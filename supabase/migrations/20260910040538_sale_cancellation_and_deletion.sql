-- Anular conserva el pago y el período original; eliminar retira registros erróneos.
alter table public.purchases
  add column cancelled_at timestamptz check (isfinite(cancelled_at)),
  add column cancelled_by uuid references public.admin_users(user_id) on delete restrict,
  add column cancellation_reason text,
  drop constraint purchases_check,
  drop constraint purchases_check4,
  add constraint purchases_payment_date_status_check check (
    (status <> 'paid' or purchased_at is not null)
    and (purchased_at is null or status in ('paid', 'cancelled'))
  ),
  add constraint purchases_coordination_history_check check (
    coordinated_at is null or (status in ('paid', 'cancelled') and purchased_at is not null and coordinated_at >= purchased_at)
  ),
  add constraint purchases_cancellation_check check (
    (cancelled_at is not null) = (status = 'cancelled' and purchased_at is not null)
    and (cancelled_at is null) = (cancelled_by is null)
    and (cancelled_at is null) = (cancellation_reason is null)
    and (cancelled_at is null or (cancelled_at >= purchased_at and length(btrim(cancellation_reason)) between 5 and 500))
  );
create index purchases_cancelled_by_idx on public.purchases(cancelled_by);

-- Solo identificadores técnicos. Evita resucitar una venta eliminada al reenviar
-- la solicitud original; no conserva participante, importe ni referencia del pago.
create table public.deleted_manual_sale_requests (
  request_id uuid primary key,
  deleted_at timestamptz not null default now()
);
alter table public.deleted_manual_sale_requests enable row level security;
revoke all on public.deleted_manual_sale_requests from public, anon, authenticated, service_role;
grant select, insert on public.deleted_manual_sale_requests to service_role;

-- DELETE se concede al servidor, pero estos triggers impiden borrar filas
-- directamente por Data API: solo la operación confirmada habilita ese ID.
create function public.guard_sale_deletion()
returns trigger language plpgsql security invoker set search_path = '' as $$
declare v_id uuid; v_origin text;
begin
  -- El administrador SQL conserva mantenimiento y limpieza de fixtures;
  -- el rol de la aplicación debe pasar por la operación confirmada.
  if current_user = 'postgres' then return old; end if;
  if tg_table_name = 'purchases' then
    v_id := old.id;
    v_origin := old.origin;
  else
    v_id := old.purchase_id;
    select origin into v_origin from public.purchases where id = v_id;
  end if;
  if current_setting('dhyana.delete_sale_id', true) is distinct from v_id::text or v_origin is distinct from 'manual' then
    raise exception using errcode = 'PT403', message = 'El borrado requiere confirmar una venta manual desde el panel.';
  end if;
  return old;
end;
$$;
revoke all on function public.guard_sale_deletion() from public, anon, authenticated;
create trigger purchases_guard_deletion before delete on public.purchases
  for each row execute function public.guard_sale_deletion();
create trigger accesses_guard_deletion before delete on public.monthly_accesses
  for each row execute function public.guard_sale_deletion();
grant delete on public.purchases, public.monthly_accesses to service_role;

create function public.delete_manual_sale(p_admin_id uuid, p_purchase_id uuid, p_code text, p_is_test boolean)
returns void language plpgsql security invoker set search_path = '' as $$
declare v_purchase public.purchases; v_previous text;
begin
  if not exists (select 1 from public.admin_users where user_id = p_admin_id and is_active) then
    raise exception using errcode = 'PT403', message = 'Administrador sin autorización.';
  end if;
  if p_is_test is distinct from true or coalesce(p_code, '') !~ '^DHY-[A-F0-9]{32}$' then
    raise exception using errcode = 'PT400', message = 'Confirma que es una prueba o error de registro y escribe el código de compra.';
  end if;
  select * into v_purchase from public.purchases where id = p_purchase_id;
  if not found then return; end if;
  if v_purchase.manual_request_id is not null then
    perform pg_advisory_xact_lock(hashtextextended('manual-sale:' || v_purchase.manual_request_id, 0));
  end if;
  perform id from public.workshops where id = (
    select workshop_id from public.workshop_groups where id = v_purchase.group_id
  ) for update;
  perform id from public.workshop_groups where id = v_purchase.group_id for update;
  select * into v_purchase from public.purchases where id = p_purchase_id for update;
  if not found then return; end if;
  if v_purchase.origin <> 'manual' then
    raise exception using errcode = 'PT409', message = 'Los pagos de Culqi no se eliminan definitivamente. Puedes anular la venta conservando el historial.';
  end if;
  if v_purchase.reference_code <> p_code then
    raise exception using errcode = 'PT400', message = 'El código no coincide con la venta seleccionada.';
  end if;
  if v_purchase.manual_request_id is not null then
    insert into public.deleted_manual_sale_requests(request_id) values(v_purchase.manual_request_id);
  end if;
  v_previous := current_setting('dhyana.delete_sale_id', true);
  perform set_config('dhyana.delete_sale_id', p_purchase_id::text, true);
  delete from public.monthly_accesses where purchase_id = p_purchase_id;
  delete from public.purchases where id = p_purchase_id;
  perform set_config('dhyana.delete_sale_id', coalesce(v_previous, ''), true);
end;
$$;

create function public.cancel_sale(p_admin_id uuid, p_purchase_id uuid, p_reason text)
returns void language plpgsql security invoker set search_path = '' as $$
declare v_purchase public.purchases;
begin
  if not exists (select 1 from public.admin_users where user_id = p_admin_id and is_active) then
    raise exception using errcode = 'PT403', message = 'Administrador sin autorización.';
  end if;
  if p_reason is null or length(btrim(p_reason)) not between 5 and 500 then
    raise exception using errcode = 'PT400', message = 'Indica un motivo de entre 5 y 500 caracteres.';
  end if;
  select * into v_purchase from public.purchases where id = p_purchase_id;
  if not found then raise exception using errcode = 'PT404', message = 'Venta no encontrada.'; end if;
  perform id from public.workshops where id = (
    select workshop_id from public.workshop_groups where id = v_purchase.group_id
  ) for update;
  perform id from public.workshop_groups where id = v_purchase.group_id for update;
  select * into v_purchase from public.purchases where id = p_purchase_id for update;
  if not found then raise exception using errcode = 'PT404', message = 'Venta no encontrada.'; end if;
  if v_purchase.status = 'cancelled' then return; end if;
  if v_purchase.status <> 'paid' then
    raise exception using errcode = 'PT409', message = 'Solo se puede anular una venta pagada.';
  end if;
  update public.purchases set status = 'cancelled', cancelled_at = clock_timestamp(),
    cancelled_by = p_admin_id, cancellation_reason = btrim(p_reason) where id = p_purchase_id;
end;
$$;

revoke all on function public.delete_manual_sale(uuid, uuid, text, boolean) from public, anon, authenticated;
revoke all on function public.cancel_sale(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.delete_manual_sale(uuid, uuid, text, boolean) to service_role;
grant execute on function public.cancel_sale(uuid, uuid, text) to service_role;

-- Una anulación libera el futuro, pero no borra la ocupación histórica anterior.
create or replace function public.group_peak_occupancy(p_group_id uuid, p_from timestamptz, p_until timestamptz)
returns bigint language sql stable security invoker set search_path = '' as $$
  with original_periods as (
    select a.starts_at, least(a.ends_at, coalesce(p.cancelled_at, 'infinity'::timestamptz)) as ends_at
    from public.monthly_accesses a join public.purchases p on p.id = a.purchase_id
    where p.group_id = p_group_id and p.status in ('paid', 'cancelled')
  ), periods as (
    select * from original_periods where starts_at < ends_at and starts_at < p_until and ends_at > p_from
  ), events as (
    select greatest(starts_at, p_from) as at, 1 as delta from periods
    union all select ends_at, -1 from periods where ends_at < p_until
  ), counts as (
    select sum(sum(delta)) over (order by at) as occupied from events group by at
  ) select coalesce(max(occupied), 0)::bigint from counts;
$$;

create or replace function public.register_manual_sale(p_admin_id uuid, p_input jsonb)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare
  v_request_id uuid := (p_input->>'requestId')::uuid;
  v_group_id uuid := (p_input->>'groupId')::uuid;
  v_paid_at timestamptz := (p_input->>'purchasedAt')::timestamptz;
  v_until timestamptz;
  v_workshop_id uuid;
  v_category text;
  v_capacity integer;
  v_purchase public.purchases;
  v_reference text := nullif(upper(btrim(p_input->>'paymentReference')), '');
begin
  if not exists (select 1 from public.admin_users where user_id = p_admin_id and is_active) then
    raise exception using errcode = 'PT403', message = 'Administrador sin autorización.';
  end if;
  if v_request_id is null or v_group_id is null or v_paid_at is null or not isfinite(v_paid_at)
    or (p_input->>'paymentVerified')::boolean is distinct from true then
    raise exception using errcode = 'PT400', message = 'Completa los datos y confirma que verificaste el pago.';
  end if;
  if coalesce(p_input->>'paymentMethod', '') not in ('yape', 'transfer', 'cash', 'other') then
    raise exception using errcode = 'PT400', message = 'Medio de pago inválido.';
  end if;
  -- Misma solicitud, mismo resultado aunque se pierda la respuesta HTTP.
  perform pg_advisory_xact_lock(hashtextextended('manual-sale:' || v_request_id, 0));
  if exists (select 1 from public.deleted_manual_sale_requests where request_id = v_request_id) then
    raise exception using errcode = 'PT409', message = 'Esta solicitud corresponde a una venta eliminada. No se puede volver a registrar.';
  end if;
  select * into v_purchase from public.purchases where manual_request_id = v_request_id;
  if found then
    if v_purchase.status = 'cancelled' then
      raise exception using errcode = 'PT409', message = 'Esta venta fue anulada. Revisa el historial antes de registrar otra compra.';
    end if;
    if v_purchase.group_id is distinct from v_group_id
      or v_purchase.recorded_by is distinct from p_admin_id
      or v_purchase.buyer_name is distinct from btrim(p_input->>'buyerName')
      or v_purchase.buyer_email is distinct from lower(btrim(p_input->>'buyerEmail'))
      or v_purchase.buyer_phone is distinct from btrim(p_input->>'buyerPhone')
      or v_purchase.amount_cents is distinct from (p_input->>'amountCents')::integer
      or v_purchase.purchased_at is distinct from v_paid_at
      or v_purchase.payment_reference is distinct from v_reference
      or v_purchase.manual_payment_method is distinct from p_input->>'paymentMethod' then
      raise exception using errcode = 'PT409', message = 'Esta solicitud ya registró otra venta. Revisa el listado antes de crear una nueva.';
    end if;
    return v_purchase.id;
  end if;
  if v_paid_at > clock_timestamp() then
    raise exception using errcode = 'PT400', message = 'La fecha del pago no puede estar en el futuro.';
  end if;
  if v_reference is not null and exists (
    select 1 from public.purchases where origin = 'culqi' and upper(payment_reference) = v_reference
  ) then
    raise exception using errcode = 'PT409', message = 'Esta referencia pertenece a un pago de Culqi. No lo registres como venta manual.';
  end if;
  select workshop_id into v_workshop_id from public.workshop_groups where id = v_group_id;
  if not found then raise exception using errcode = 'PT404', message = 'Horario no encontrado.'; end if;
  -- Mismo orden que el editor: taller y después grupo. Serializa venta/venta y
  -- venta/edición de capacidad sin mantener bloqueos durante llamadas externas.
  select category into v_category from public.workshops where id = v_workshop_id for update;
  select capacity into v_capacity from public.workshop_groups where id = v_group_id for update;
  if not found then raise exception using errcode = 'PT404', message = 'Horario no encontrado.'; end if;
  if v_category <> 'group' then
    raise exception using errcode = 'PT409', message = 'Solo se registran ventas de talleres grupales.';
  end if;
  v_until := ((v_paid_at at time zone 'America/Lima') + interval '1 month') at time zone 'America/Lima';
  if public.group_peak_occupancy(v_group_id, v_paid_at, v_until) >= v_capacity then
    raise exception using errcode = 'PT409', message = 'No hay cupo disponible durante el período de esta compra.';
  end if;
  insert into public.purchases (group_id, buyer_name, buyer_email, buyer_phone, amount_cents, origin,
    status, recorded_by, purchased_at, payment_reference, manual_request_id, manual_payment_method)
  values (v_group_id, btrim(p_input->>'buyerName'), lower(btrim(p_input->>'buyerEmail')),
    btrim(p_input->>'buyerPhone'), (p_input->>'amountCents')::integer, 'manual', 'paid', p_admin_id,
    v_paid_at, v_reference, v_request_id, p_input->>'paymentMethod') returning * into v_purchase;
  insert into public.monthly_accesses (purchase_id, starts_at) values (v_purchase.id, v_paid_at);
  return v_purchase.id;
end;
$$;


create or replace function public.admin_sales_page(p_query text, p_access text, p_coordination text, p_page integer)
returns jsonb language sql stable security invoker set search_path = '' as $$
  with filtered as (
    select p.id, p.status, p.cancelled_at, p.cancelled_by, p.cancellation_reason, p.reference_code, p.buyer_name, p.buyer_email, p.buyer_phone, p.amount_cents,
      p.origin, p.manual_payment_method, p.payment_reference, p.purchased_at, p.coordinated_at,
      w.title, g.schedule_description, a.starts_at, a.ends_at,
      case when p.status = 'cancelled' then 'cancelled' when a.starts_at > now() then 'upcoming' when a.ends_at > now() then 'active' else 'expired' end as access_status
    from public.purchases p
    join public.monthly_accesses a on a.purchase_id = p.id
    join public.workshop_groups g on g.id = p.group_id
    join public.workshops w on w.id = g.workshop_id
    where p.status in ('paid', 'cancelled')
      and (p_query = '' or strpos(lower(concat_ws(' ', p.reference_code, p.buyer_name, p.buyer_email, p.buyer_phone, p.payment_reference)), lower(p_query)) > 0)
      and (p_coordination = 'all' or (p_coordination = 'pending' and p.coordinated_at is null and p.status = 'paid')
        or (p_coordination = 'done' and p.coordinated_at is not null))
      and (p_access = 'all' or (p_access = 'cancelled' and p.status = 'cancelled') or (p_access = 'active' and p.status = 'paid' and a.starts_at <= now() and a.ends_at > now())
        or (p_access = 'expired' and p.status = 'paid' and a.ends_at <= now()) or (p_access = 'upcoming' and p.status = 'paid' and a.starts_at > now()))
  ), page as (
    select * from filtered order by purchased_at desc, id desc limit 20 offset (greatest(p_page, 1) - 1) * 20
  ) select jsonb_build_object('total', (select count(*) from filtered), 'page', p_page, 'pageSize', 20,
    'asOf', now(), 'items', coalesce((select jsonb_agg(jsonb_build_object(
      'status', status, 'cancelledAt', cancelled_at, 'cancelledBy', cancelled_by, 'cancellationReason', cancellation_reason,
      'id', id, 'referenceCode', reference_code, 'buyerName', buyer_name, 'buyerEmail', buyer_email,
      'buyerPhone', buyer_phone, 'amountCents', amount_cents, 'origin', origin, 'paymentMethod', manual_payment_method,
      'paymentReference', payment_reference, 'purchasedAt', purchased_at, 'coordinatedAt', coordinated_at,
      'workshopTitle', title, 'scheduleDescription', schedule_description, 'startsAt', starts_at, 'endsAt', ends_at,
      'accessStatus', access_status) order by purchased_at desc, id desc) from page), '[]'::jsonb));
$$;
