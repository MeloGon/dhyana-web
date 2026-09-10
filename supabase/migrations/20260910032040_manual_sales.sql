-- Ventas externas verificadas por un administrador; no procesa pagos ni reservas.
alter table public.purchases
  add column manual_request_id uuid unique,
  add column manual_payment_method text check (manual_payment_method in ('yape', 'transfer', 'cash', 'other')),
  add constraint purchases_manual_request_check check (manual_request_id is null or origin = 'manual');
create unique index purchases_manual_payment_reference_idx
  on public.purchases (manual_payment_method, payment_reference)
  where origin = 'manual' and manual_payment_method is not null and payment_reference is not null;

-- Máxima ocupación simultánea dentro de [inicio, fin). No suma personas cuyos
-- períodos no coinciden. También sirve para registrar pagos antiguos correctamente.
create function public.group_peak_occupancy(p_group_id uuid, p_from timestamptz, p_until timestamptz)
returns bigint language sql stable security invoker set search_path = '' as $$
  with periods as (
    select a.starts_at, a.ends_at from public.monthly_accesses a
    join public.purchases p on p.id = a.purchase_id
    where p.group_id = p_group_id and a.starts_at < p_until and a.ends_at > p_from
  ), events as (
    select greatest(starts_at, p_from) as at, 1 as delta from periods
    union all select ends_at, -1 from periods where ends_at < p_until
  ), counts as (
    select sum(sum(delta)) over (order by at) as occupied from events group by at
  ) select coalesce(max(occupied), 0)::bigint from counts;
$$;

create function public.register_manual_sale(p_admin_id uuid, p_input jsonb)
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
  select * into v_purchase from public.purchases where manual_request_id = v_request_id;
  if found then
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

create function public.set_sale_coordination(p_admin_id uuid, p_purchase_id uuid, p_coordinated boolean)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  if not exists (select 1 from public.admin_users where user_id = p_admin_id and is_active) then
    raise exception using errcode = 'PT403', message = 'Administrador sin autorización.';
  end if;
  if p_coordinated is null then raise exception using errcode = 'PT400', message = 'Estado inválido.'; end if;
  perform id from public.purchases where id = p_purchase_id and status = 'paid' for update;
  if not found then raise exception using errcode = 'PT404', message = 'Compra confirmada no encontrada.'; end if;
  update public.purchases set
    coordinated_at = case when p_coordinated then coalesce(coordinated_at, clock_timestamp()) else null end,
    coordinated_by = case when p_coordinated then coalesce(coordinated_by, p_admin_id) else null end
  where id = p_purchase_id;
end;
$$;

-- Búsqueda literal y paginación en servidor: los filtros no forman SQL dinámico.
create function public.admin_sales_page(p_query text, p_access text, p_coordination text, p_page integer)
returns jsonb language sql stable security invoker set search_path = '' as $$
  with filtered as (
    select p.id, p.reference_code, p.buyer_name, p.buyer_email, p.buyer_phone, p.amount_cents,
      p.origin, p.manual_payment_method, p.payment_reference, p.purchased_at, p.coordinated_at,
      w.title, g.schedule_description, a.starts_at, a.ends_at,
      case when a.starts_at > now() then 'upcoming' when a.ends_at > now() then 'active' else 'expired' end as access_status
    from public.purchases p
    join public.monthly_accesses a on a.purchase_id = p.id
    join public.workshop_groups g on g.id = p.group_id
    join public.workshops w on w.id = g.workshop_id
    where p.status = 'paid'
      and (p_query = '' or strpos(lower(concat_ws(' ', p.reference_code, p.buyer_name, p.buyer_email, p.buyer_phone, p.payment_reference)), lower(p_query)) > 0)
      and (p_coordination = 'all' or (p_coordination = 'pending' and p.coordinated_at is null)
        or (p_coordination = 'done' and p.coordinated_at is not null))
      and (p_access = 'all' or (p_access = 'active' and a.starts_at <= now() and a.ends_at > now())
        or (p_access = 'expired' and a.ends_at <= now()) or (p_access = 'upcoming' and a.starts_at > now()))
  ), page as (
    select * from filtered order by purchased_at desc, id desc limit 20 offset (greatest(p_page, 1) - 1) * 20
  ) select jsonb_build_object('total', (select count(*) from filtered), 'page', p_page, 'pageSize', 20,
    'asOf', now(), 'items', coalesce((select jsonb_agg(jsonb_build_object(
      'id', id, 'referenceCode', reference_code, 'buyerName', buyer_name, 'buyerEmail', buyer_email,
      'buyerPhone', buyer_phone, 'amountCents', amount_cents, 'origin', origin, 'paymentMethod', manual_payment_method,
      'paymentReference', payment_reference, 'purchasedAt', purchased_at, 'coordinatedAt', coordinated_at,
      'workshopTitle', title, 'scheduleDescription', schedule_description, 'startsAt', starts_at, 'endsAt', ends_at,
      'accessStatus', access_status) order by purchased_at desc, id desc) from page), '[]'::jsonb));
$$;

revoke all on function public.group_peak_occupancy(uuid, timestamptz, timestamptz) from public, anon, authenticated;
revoke all on function public.register_manual_sale(uuid, jsonb) from public, anon, authenticated;
revoke all on function public.set_sale_coordination(uuid, uuid, boolean) from public, anon, authenticated;
revoke all on function public.admin_sales_page(text, text, text, integer) from public, anon, authenticated;
grant execute on function public.group_peak_occupancy(uuid, timestamptz, timestamptz) to service_role;
grant execute on function public.register_manual_sale(uuid, jsonb) to service_role;
grant execute on function public.set_sale_coordination(uuid, uuid, boolean) to service_role;
grant execute on function public.admin_sales_page(text, text, text, integer) to service_role;

-- El editor comparte bloqueo y cálculo de ocupación con las ventas manuales.
create or replace function public.save_workshop_catalog(p_workshop_id uuid, p_workshop jsonb, p_slug text)
returns jsonb
language plpgsql security invoker set search_path = ''
as $$
declare
  v_id uuid := p_workshop_id;
  v_workshop public.workshops;
  v_group jsonb;
  v_group_id uuid;
  v_kept uuid[] := '{}';
  v_slug text := p_slug;
  v_suffix integer := 1;
  v_order integer := 0;
begin
  if jsonb_typeof(p_workshop->'groups') is distinct from 'array'
    or jsonb_array_length(p_workshop->'groups') > 50 then
    raise exception using errcode = 'PT400', message = 'Horarios inválidos.';
  end if;
  -- Serializar únicamente los nombres que compiten por el mismo identificador.
  perform pg_advisory_xact_lock(hashtextextended('catalog-slug:' || p_slug, 0));
  if v_id is not null then
    select * into v_workshop from public.workshops where id = v_id for update;
    if not found then
      raise exception using errcode = 'PT404', message = 'Taller no encontrado.';
    end if;
    perform id from public.workshop_groups where workshop_id = v_id order by id for update;
  end if;

  if v_id is not null and v_workshop.title = p_workshop->>'title' then
    v_slug := v_workshop.slug;
  else
    while exists (select 1 from public.workshops where slug = v_slug and id is distinct from v_id) loop
      v_suffix := v_suffix + 1;
      v_slug := p_slug || '-' || v_suffix;
    end loop;
  end if;
  if v_id is null then
    insert into public.workshops (title, slug, summary, category, is_published)
    values (p_workshop->>'title', v_slug, p_workshop->>'summary', p_workshop->>'category',
      (p_workshop->>'isPublished')::boolean) returning * into v_workshop;
    v_id := v_workshop.id;
  else
    update public.workshops set title = p_workshop->>'title', slug = v_slug,
      summary = p_workshop->>'summary', category = p_workshop->>'category',
      is_published = (p_workshop->>'isPublished')::boolean
    where id = v_id returning * into v_workshop;
  end if;

  for v_group in select value from jsonb_array_elements(p_workshop->'groups') loop
    v_group_id := (v_group->>'id')::uuid;
    if v_group_id is not null then
      if v_group_id = any(v_kept) then
        raise exception using errcode = 'PT400', message = 'Horario repetido.';
      end if;
      if not exists (select 1 from public.workshop_groups where id = v_group_id and workshop_id = v_id) then
        raise exception using errcode = 'PT404', message = 'Horario no encontrado en este taller.';
      end if;
      if (v_group->>'capacity')::integer < public.group_peak_occupancy(v_group_id, clock_timestamp(), 'infinity') then
        raise exception using errcode = 'PT409', message = 'La capacidad no puede ser menor que la ocupación de accesos vigentes o futuros.';
      end if;
      update public.workshop_groups set schedule_description = v_group->>'scheduleDescription',
        price_cents = (v_group->>'priceCents')::integer, capacity = (v_group->>'capacity')::integer,
        is_published = (v_group->>'isPublished')::boolean, sort_order = v_order
      where id = v_group_id and workshop_id = v_id;
    else
      insert into public.workshop_groups (workshop_id, schedule_description, price_cents, capacity, is_published, sort_order)
      values (v_id, v_group->>'scheduleDescription', (v_group->>'priceCents')::integer,
        (v_group->>'capacity')::integer, (v_group->>'isPublished')::boolean, v_order)
      returning id into v_group_id;
    end if;
    v_kept := array_append(v_kept, v_group_id);
    v_order := v_order + 1;
  end loop;
  if exists (
    select 1 from public.purchases p join public.workshop_groups g on g.id = p.group_id
    where g.workshop_id = v_id and not (g.id = any(v_kept))
  ) then
    raise exception using errcode = 'PT409', message = 'No puedes quitar horarios con compras. Desmarca su publicación para ocultarlos.';
  end if;
  delete from public.workshop_groups where workshop_id = v_id and not (id = any(v_kept));
  return jsonb_build_object('workshop', to_jsonb(v_workshop), 'groups', (
    select coalesce(jsonb_agg(to_jsonb(g) order by g.sort_order, g.created_at, g.id), '[]'::jsonb)
    from public.workshop_groups g where g.workshop_id = v_id
  ));
end;
$$;
