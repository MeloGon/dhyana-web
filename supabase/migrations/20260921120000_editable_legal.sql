-- Configuración única de Términos, Privacidad y Política de cambios/devoluciones.
-- El servidor solo puede leer y editar, igual que about_settings y contact_settings.
create table public.legal_settings (
  id boolean primary key default true check (id),
  terms_title text not null check (char_length(btrim(terms_title)) between 1 and 200),
  terms_body text not null check (char_length(btrim(terms_body)) between 1 and 20000),
  privacy_title text not null check (char_length(btrim(privacy_title)) between 1 and 200),
  privacy_body text not null check (char_length(btrim(privacy_body)) between 1 and 20000),
  returns_title text not null check (char_length(btrim(returns_title)) between 1 and 200),
  returns_body text not null check (char_length(btrim(returns_body)) between 1 and 20000)
);

alter table public.legal_settings enable row level security;
revoke all on table public.legal_settings from public, anon, authenticated, service_role;
grant select, update on table public.legal_settings to service_role;

-- Carga inicial única. Texto provisional explícito: no es contenido legal real ni
-- aprobado, a diferencia del resto del contenido de demo del sitio. Reemplazar desde
-- /admin/legal antes de publicar o de habilitar cobros con Culqi.
insert into public.legal_settings (
  terms_title, terms_body, privacy_title, privacy_body, returns_title, returns_body
) values (
  'Términos y condiciones',
  'Este documento está en preparación. Aún no ha sido revisado ni aprobado como política oficial del Centro de Desarrollo Integral Dhyana. No debe considerarse vigente hasta su publicación final desde el panel de administración.',
  'Política de privacidad',
  'Este documento está en preparación. Aún no ha sido revisado ni aprobado como política oficial del Centro de Desarrollo Integral Dhyana. No debe considerarse vigente hasta su publicación final desde el panel de administración.',
  'Política de cambios y devoluciones',
  'Este documento está en preparación. Aún no ha sido revisado ni aprobado como política oficial del Centro de Desarrollo Integral Dhyana. No debe considerarse vigente hasta su publicación final desde el panel de administración.'
);
