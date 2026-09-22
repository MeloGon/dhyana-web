-- Libro de Reclamaciones virtual (INDECOPI, Ley 29571 / DS 011-2011-PCM / Ley 32495).
-- El libro no se registra ante INDECOPI: el número de hoja lo genera este sistema.
-- INDECOPI no responde las hojas, responde el proveedor en 15 días hábiles.
begin;

create table public.complaint_book_settings (
  id boolean primary key default true check (id),
  ruc text not null check (ruc ~ '^[0-9]{11}$'),
  razon_social text not null check (char_length(btrim(razon_social)) between 1 and 200),
  domicilio text not null check (char_length(btrim(domicilio)) between 1 and 300),
  correo_reclamos_interno text not null
    check (char_length(correo_reclamos_interno) <= 254
      and correo_reclamos_interno ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  -- Textos de cumplimiento legal fijo (aviso INDECOPI, plazo de 15 días hábiles).
  -- Editables desde el panel, pero el panel exige una confirmación explícita
  -- distinta del guardado normal antes de sobrescribirlos.
  texto_aviso_otras_vias text not null check (char_length(btrim(texto_aviso_otras_vias)) between 1 and 2000),
  texto_plazo_respuesta text not null check (char_length(btrim(texto_plazo_respuesta)) between 1 and 2000)
);

alter table public.complaint_book_settings enable row level security;
revoke all on table public.complaint_book_settings from public, anon, authenticated, service_role;
grant select, update on table public.complaint_book_settings to service_role;

insert into public.complaint_book_settings (
  id, ruc, razon_social, domicilio, correo_reclamos_interno, texto_aviso_otras_vias, texto_plazo_respuesta
) values (
  true, '10775304842', 'Centro de Desarrollo Integral Dhyana', 'Cerro Colorado, Arequipa, Perú',
  'reclamos@dhyana.pe',
  'Formular un reclamo o una queja no impide acudir a otras vías de solución de conflictos ni es un requisito previo para interponer una denuncia ante el INDECOPI.',
  'El proveedor debe dar respuesta al reclamo o queja en un plazo no mayor a 15 días hábiles, improrrogable, contado desde la fecha de presentación de esta hoja.'
);

-- Correlativo sin huecos por establecimiento y año. No hay fila "en cero": se
-- crea al registrar la primera hoja del año mediante upsert en la misma
-- transacción que inserta la hoja.
create table public.complaint_book_counters (
  codigo_establecimiento text not null check (codigo_establecimiento ~ '^[A-Z0-9]{2,20}$'),
  anio integer not null check (anio between 2020 and 2100),
  ultimo_correlativo integer not null default 0 check (ultimo_correlativo >= 0),
  primary key (codigo_establecimiento, anio)
);

alter table public.complaint_book_counters enable row level security;
revoke all on table public.complaint_book_counters from public, anon, authenticated, service_role;
grant select, insert, update on table public.complaint_book_counters to service_role;

create table public.complaint_book_entries (
  id uuid primary key default gen_random_uuid(),
  codigo_establecimiento text not null,
  anio integer not null,
  correlativo integer not null check (correlativo > 0),
  -- Formato {ESTABLECIMIENTO}-{AÑO}-{CORRELATIVO6}, ej. WEB-2026-000123.
  numero_hoja text not null unique,
  created_at timestamptz not null default now(),
  tipo text not null check (tipo in ('reclamo', 'queja')),

  consumidor_nombre text not null check (char_length(btrim(consumidor_nombre)) between 1 and 200),
  consumidor_domicilio text not null check (char_length(btrim(consumidor_domicilio)) between 1 and 300),
  consumidor_documento_tipo text not null check (consumidor_documento_tipo in ('dni', 'ce', 'pasaporte', 'ruc')),
  consumidor_documento_numero text not null check (char_length(btrim(consumidor_documento_numero)) between 1 and 20),
  consumidor_telefono text not null check (char_length(btrim(consumidor_telefono)) between 1 and 40),
  consumidor_correo text not null
    check (char_length(consumidor_correo) <= 254
      and consumidor_correo ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),

  es_menor_edad boolean not null default false,
  representante_nombre text not null default '' check (char_length(representante_nombre) <= 200),
  representante_documento_numero text not null default '' check (char_length(representante_documento_numero) <= 20),

  bien_tipo text not null check (bien_tipo in ('producto', 'servicio')),
  bien_descripcion text not null check (char_length(btrim(bien_descripcion)) between 1 and 2000),
  monto_reclamado_cents integer check (monto_reclamado_cents is null or monto_reclamado_cents >= 0),

  detalle_hechos text not null check (char_length(btrim(detalle_hechos)) between 1 and 5000),
  detalle_pedido text not null check (char_length(btrim(detalle_pedido)) between 1 and 2000),

  estado text not null default 'registrado' check (estado in ('registrado', 'en_tramite', 'respondido')),
  respuesta_texto text not null default '' check (char_length(respuesta_texto) <= 5000),
  respuesta_fecha date,
  respuesta_evidencia_path text not null default '',
  respondido_por uuid references public.admin_users (user_id) on delete restrict,

  pdf_path text not null default '',
  email_consumidor_enviado boolean not null default false,
  email_interno_enviado boolean not null default false,
  email_error text not null default '',

  unique (codigo_establecimiento, anio, correlativo),
  foreign key (codigo_establecimiento, anio) references public.complaint_book_counters (codigo_establecimiento, anio),
  check (not es_menor_edad or (btrim(representante_nombre) <> '' and btrim(representante_documento_numero) <> '')),
  check ((estado = 'respondido') = (respuesta_texto <> '' and respuesta_fecha is not null))
);

create index complaint_book_entries_estado_idx on public.complaint_book_entries (estado, created_at desc);

-- Auditoría de transiciones de estado, retención mínima 2 años.
create table public.complaint_book_status_log (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.complaint_book_entries (id) on delete restrict,
  admin_id uuid references public.admin_users (user_id) on delete restrict,
  previous_status text not null,
  new_status text not null,
  note text not null default '',
  created_at timestamptz not null default now()
);
create index complaint_book_status_log_entry_id_idx on public.complaint_book_status_log (entry_id);

alter table public.complaint_book_entries enable row level security;
alter table public.complaint_book_status_log enable row level security;
revoke all on table public.complaint_book_entries, public.complaint_book_status_log
  from public, anon, authenticated, service_role;
-- Sin DELETE en la lista de permisos: ninguna hoja se puede eliminar desde la
-- aplicación, ni siquiera con una función confirmada. Es la única defensa
-- necesaria; no hace falta un trigger adicional que la reproduzca.
grant select, insert, update on table public.complaint_book_entries to service_role;
grant select, insert on table public.complaint_book_status_log to service_role;

-- Protege los campos del Anexo I ya registrados aunque una función futura
-- intente modificarlos: solo estado/respuesta/adjuntos/envíos son editables.
create function public.guard_complaint_sheet_update()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if old.codigo_establecimiento is distinct from new.codigo_establecimiento
    or old.anio is distinct from new.anio
    or old.correlativo is distinct from new.correlativo
    or old.numero_hoja is distinct from new.numero_hoja
    or old.created_at is distinct from new.created_at
    or old.tipo is distinct from new.tipo
    or old.consumidor_nombre is distinct from new.consumidor_nombre
    or old.consumidor_domicilio is distinct from new.consumidor_domicilio
    or old.consumidor_documento_tipo is distinct from new.consumidor_documento_tipo
    or old.consumidor_documento_numero is distinct from new.consumidor_documento_numero
    or old.consumidor_telefono is distinct from new.consumidor_telefono
    or old.consumidor_correo is distinct from new.consumidor_correo
    or old.es_menor_edad is distinct from new.es_menor_edad
    or old.representante_nombre is distinct from new.representante_nombre
    or old.representante_documento_numero is distinct from new.representante_documento_numero
    or old.bien_tipo is distinct from new.bien_tipo
    or old.bien_descripcion is distinct from new.bien_descripcion
    or old.monto_reclamado_cents is distinct from new.monto_reclamado_cents
    or old.detalle_hechos is distinct from new.detalle_hechos
    or old.detalle_pedido is distinct from new.detalle_pedido then
    raise exception using errcode = 'PT403', message = 'Los datos originales de la hoja no se pueden modificar.';
  end if;
  return new;
end;
$$;
revoke all on function public.guard_complaint_sheet_update() from public, anon, authenticated;
create trigger complaint_book_entries_guard_update before update on public.complaint_book_entries
  for each row execute function public.guard_complaint_sheet_update();

create function public.register_complaint_sheet(p_codigo_establecimiento text, p_input jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  v_anio integer := extract(year from (clock_timestamp() at time zone 'America/Lima'))::integer;
  v_correlativo integer;
  v_numero_hoja text;
  v_id uuid;
  v_created_at timestamptz;
  v_es_menor boolean := coalesce((p_input->>'esMenorEdad')::boolean, false);
begin
  if p_codigo_establecimiento !~ '^[A-Z0-9]{2,20}$' then
    raise exception using errcode = 'PT400', message = 'Canal de ingreso inválido.';
  end if;
  if p_input->>'tipo' not in ('reclamo', 'queja')
    or coalesce(btrim(p_input->>'consumidorNombre'), '') = ''
    or coalesce(btrim(p_input->>'consumidorDomicilio'), '') = ''
    or p_input->>'consumidorDocumentoTipo' not in ('dni', 'ce', 'pasaporte', 'ruc')
    or coalesce(btrim(p_input->>'consumidorDocumentoNumero'), '') = ''
    or coalesce(btrim(p_input->>'consumidorTelefono'), '') = ''
    or coalesce(btrim(p_input->>'consumidorCorreo'), '') = ''
    or p_input->>'bienTipo' not in ('producto', 'servicio')
    or coalesce(btrim(p_input->>'bienDescripcion'), '') = ''
    or coalesce(btrim(p_input->>'detalleHechos'), '') = ''
    or coalesce(btrim(p_input->>'detallePedido'), '') = '' then
    -- Datos mínimos incompletos: la norma considera el reclamo "no presentado".
    -- No se crea fila ni se consume un número de hoja.
    raise exception using errcode = 'PT400', message = 'Completa los datos obligatorios de la hoja.';
  end if;
  if v_es_menor and (coalesce(btrim(p_input->>'representanteNombre'), '') = ''
    or coalesce(btrim(p_input->>'representanteDocumentoNumero'), '') = '') then
    raise exception using errcode = 'PT400', message = 'Indica los datos del padre, madre o representante.';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('complaint-sheet:' || p_codigo_establecimiento || ':' || v_anio, 0));
  insert into public.complaint_book_counters (codigo_establecimiento, anio, ultimo_correlativo)
    values (p_codigo_establecimiento, v_anio, 1)
    on conflict (codigo_establecimiento, anio)
    do update set ultimo_correlativo = public.complaint_book_counters.ultimo_correlativo + 1
    returning ultimo_correlativo into v_correlativo;
  v_numero_hoja := p_codigo_establecimiento || '-' || v_anio || '-' || lpad(v_correlativo::text, 6, '0');

  insert into public.complaint_book_entries (
    codigo_establecimiento, anio, correlativo, numero_hoja, tipo,
    consumidor_nombre, consumidor_domicilio, consumidor_documento_tipo, consumidor_documento_numero,
    consumidor_telefono, consumidor_correo, es_menor_edad, representante_nombre, representante_documento_numero,
    bien_tipo, bien_descripcion, monto_reclamado_cents, detalle_hechos, detalle_pedido
  ) values (
    p_codigo_establecimiento, v_anio, v_correlativo, v_numero_hoja, p_input->>'tipo',
    btrim(p_input->>'consumidorNombre'), btrim(p_input->>'consumidorDomicilio'), p_input->>'consumidorDocumentoTipo',
    btrim(p_input->>'consumidorDocumentoNumero'), btrim(p_input->>'consumidorTelefono'), lower(btrim(p_input->>'consumidorCorreo')),
    v_es_menor, btrim(coalesce(p_input->>'representanteNombre', '')), btrim(coalesce(p_input->>'representanteDocumentoNumero', '')),
    p_input->>'bienTipo', btrim(p_input->>'bienDescripcion'),
    case when p_input->'montoReclamadoCents' is null or p_input->'montoReclamadoCents' = 'null'::jsonb then null
      else (p_input->>'montoReclamadoCents')::integer end,
    btrim(p_input->>'detalleHechos'), btrim(p_input->>'detallePedido')
  ) returning id, created_at into v_id, v_created_at;

  return jsonb_build_object('id', v_id, 'numeroHoja', v_numero_hoja, 'createdAt', v_created_at);
end;
$$;

create function public.set_complaint_sheet_status(p_admin_id uuid, p_id uuid, p_estado text)
returns void language plpgsql security invoker set search_path = '' as $$
declare v_previous text;
begin
  if not exists (select 1 from public.admin_users where user_id = p_admin_id and is_active) then
    raise exception using errcode = 'PT403', message = 'Administrador sin autorización.';
  end if;
  if p_estado <> 'en_tramite' then
    raise exception using errcode = 'PT400', message = 'Transición de estado inválida.';
  end if;
  select estado into v_previous from public.complaint_book_entries where id = p_id for update;
  if not found then raise exception using errcode = 'PT404', message = 'Hoja no encontrada.'; end if;
  if v_previous <> 'registrado' then
    raise exception using errcode = 'PT409', message = 'Solo se puede pasar a "en trámite" desde "registrado".';
  end if;
  update public.complaint_book_entries set estado = 'en_tramite' where id = p_id;
  insert into public.complaint_book_status_log (entry_id, admin_id, previous_status, new_status)
    values (p_id, p_admin_id, v_previous, 'en_tramite');
end;
$$;

create function public.respond_complaint_sheet(
  p_admin_id uuid, p_id uuid, p_respuesta_texto text, p_respuesta_fecha date, p_evidencia_path text
)
returns void language plpgsql security invoker set search_path = '' as $$
declare v_previous text;
begin
  if not exists (select 1 from public.admin_users where user_id = p_admin_id and is_active) then
    raise exception using errcode = 'PT403', message = 'Administrador sin autorización.';
  end if;
  if coalesce(btrim(p_respuesta_texto), '') = '' or char_length(p_respuesta_texto) > 5000 then
    raise exception using errcode = 'PT400', message = 'Escribe la respuesta al consumidor.';
  end if;
  if p_respuesta_fecha is null or p_respuesta_fecha > (clock_timestamp() at time zone 'America/Lima')::date then
    raise exception using errcode = 'PT400', message = 'La fecha de la respuesta no puede estar en el futuro.';
  end if;
  select estado into v_previous from public.complaint_book_entries where id = p_id for update;
  if not found then raise exception using errcode = 'PT404', message = 'Hoja no encontrada.'; end if;
  if v_previous = 'respondido' then
    raise exception using errcode = 'PT409', message = 'Esta hoja ya tiene una respuesta registrada.';
  end if;
  update public.complaint_book_entries set estado = 'respondido', respuesta_texto = btrim(p_respuesta_texto),
    respuesta_fecha = p_respuesta_fecha, respuesta_evidencia_path = coalesce(p_evidencia_path, ''), respondido_por = p_admin_id
  where id = p_id;
  insert into public.complaint_book_status_log (entry_id, admin_id, previous_status, new_status)
    values (p_id, p_admin_id, v_previous, 'respondido');
end;
$$;

revoke all on function public.register_complaint_sheet(text, jsonb) from public, anon, authenticated;
revoke all on function public.set_complaint_sheet_status(uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.respond_complaint_sheet(uuid, uuid, text, date, text) from public, anon, authenticated;
grant execute on function public.register_complaint_sheet(text, jsonb) to service_role;
grant execute on function public.set_complaint_sheet_status(uuid, uuid, text) to service_role;
grant execute on function public.respond_complaint_sheet(uuid, uuid, text, date, text) to service_role;

-- Bucket privado: contiene datos personales del consumidor. Sin política pública;
-- toda lectura pasa por una URL firmada de corta duración generada en el servidor.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('complaint-book', 'complaint-book', false, 10485760,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);

commit;
