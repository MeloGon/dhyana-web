-- Configuración única de la tarjeta pública. El servidor solo puede leer y editar.
create table public.contact_settings (
  id boolean primary key default true check (id),
  title text not null check (char_length(btrim(title)) between 1 and 120),
  address text not null check (char_length(btrim(address)) between 1 and 300),
  address_note text not null default '' check (char_length(address_note) <= 300),
  phone text not null check (char_length(phone) <= 40 and phone ~ '^\+[0-9 ()-]+$'
    and regexp_replace(phone, '[^0-9]', '', 'g') ~ '^[1-9][0-9]{6,14}$'),
  phone_note text not null default '' check (char_length(phone_note) <= 300),
  email text not null check (char_length(email) <= 254 and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  hours text not null check (char_length(btrim(hours)) between 1 and 500),
  hours_note text not null default '' check (char_length(hours_note) <= 500),
  whatsapp_phone text not null check (whatsapp_phone ~ '^[1-9][0-9]{6,14}$'),
  whatsapp_message text not null default '' check (char_length(whatsapp_message) <= 1000),
  whatsapp_label text not null check (char_length(btrim(whatsapp_label)) between 1 and 120)
);

alter table public.contact_settings enable row level security;
revoke all on table public.contact_settings from public, anon, authenticated, service_role;
grant select, update on table public.contact_settings to service_role;

-- Carga inicial única con el contenido existente del diseño.
insert into public.contact_settings (
  title, address, address_note, phone, phone_note, email,
  hours, hours_note, whatsapp_phone, whatsapp_message, whatsapp_label
) values (
  'Datos de la Consulta',
  'Av. de la Paz 142, Planta 3, Despacho 302',
  'Zona céntrica, fácil aparcamiento y metro cercano',
  '+34 612 345 678',
  'Mensajes y llamadas en horario de consulta',
  'consulta@psicologiamorales.com',
  'Lunes a Viernes: 08:30 a 20:30',
  'Sábados: 09:00 a 14:00 (Talleres y sesiones especiales)',
  '34612345678',
  'Hola Lic. Alejandro, quisiera consultar por una cita',
  'Contactar por WhatsApp Directo'
);
