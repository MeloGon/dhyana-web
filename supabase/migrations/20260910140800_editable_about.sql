-- Sección "Sobre nosotros" editable desde el panel. Fila única (singleton).
create table public.about_settings (
  id boolean primary key default true check (id),

  -- Cabecera
  badge text not null check (char_length(btrim(badge)) between 1 and 120),
  heading text not null check (char_length(btrim(heading)) between 1 and 200),
  introduction text not null check (char_length(btrim(introduction)) between 1 and 1000),

  -- Tarjeta de perfil
  profile_name text not null check (char_length(btrim(profile_name)) between 1 and 120),
  profile_title text not null check (char_length(btrim(profile_title)) between 1 and 200),
  profile_image_url text not null check (char_length(btrim(profile_image_url)) between 1 and 500),
  profile_image_alt text not null check (char_length(btrim(profile_image_alt)) between 1 and 200),

  -- Credenciales (3 líneas bajo la foto)
  credential1 text not null check (char_length(btrim(credential1)) between 1 and 300),
  credential2 text not null check (char_length(btrim(credential2)) between 1 and 300),
  credential3 text not null check (char_length(btrim(credential3)) between 1 and 300),

  -- Cita al pie de la tarjeta
  quote text not null check (char_length(btrim(quote)) between 1 and 500),

  -- Enfoque (lado derecho)
  approach_title text not null check (char_length(btrim(approach_title)) between 1 and 200),
  approach_paragraph1 text not null check (char_length(btrim(approach_paragraph1)) between 1 and 1000),
  approach_paragraph2 text not null check (char_length(btrim(approach_paragraph2)) between 1 and 1000),

  -- Pilares (4 tarjetas; íconos fijos en código)
  pillar1_title text not null check (char_length(btrim(pillar1_title)) between 1 and 120),
  pillar1_description text not null check (char_length(btrim(pillar1_description)) between 1 and 500),
  pillar2_title text not null check (char_length(btrim(pillar2_title)) between 1 and 120),
  pillar2_description text not null check (char_length(btrim(pillar2_description)) between 1 and 500),
  pillar3_title text not null check (char_length(btrim(pillar3_title)) between 1 and 120),
  pillar3_description text not null check (char_length(btrim(pillar3_description)) between 1 and 500),
  pillar4_title text not null check (char_length(btrim(pillar4_title)) between 1 and 120),
  pillar4_description text not null check (char_length(btrim(pillar4_description)) between 1 and 500)
);

alter table public.about_settings enable row level security;
revoke all on table public.about_settings from public, anon, authenticated, service_role;
grant select, update on table public.about_settings to service_role;

-- Carga inicial con el contenido demo actual de la sección.
insert into public.about_settings (
  badge, heading, introduction,
  profile_name, profile_title, profile_image_url, profile_image_alt,
  credential1, credential2, credential3,
  quote, approach_title, approach_paragraph1, approach_paragraph2,
  pillar1_title, pillar1_description,
  pillar2_title, pillar2_description,
  pillar3_title, pillar3_description,
  pillar4_title, pillar4_description
) values (
  'Sobre el Terapeuta',
  'Un Acompañamiento Cercano Hacia Tu Calma',
  'Hola, soy el Lic. Alejandro Morales. Mi vocación es brindarte un espacio terapéutico donde sentirte escuchado, comprendido y capaz de transformar tu relación con tus pensamientos y emociones.',
  'Lic. Alejandro Morales',
  'Psicólogo Clínico · Colegiado Nº M-34821',
  'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
  'Lic. Alejandro Morales - Psicólogo Clínico',
  'Máster en Psicoterapia Humanista & TCC',
  'Especialista en Mindfulness y Reducción de Estrés (MBSR)',
  'Más de 8 años de práctica clínica con adultos y parejas',
  'Sanar no es volverse perfecto, es aprender a abrazar tu humanidad.',
  'Mi Enfoque: Una Mirada Integradora y Humana',
  'Cada persona llega a consulta con su propio universo de experiencias, anhelos y dificultades. Por eso, mi trabajo no consiste en aplicar fórmulas rígidas, sino en co-crear contigo un proceso terapéutico a tu medida.',
  'Combinamos la profundidad del autoconocimiento con estrategias prácticas que puedas poner a prueba desde la primera semana para recuperar tu bienestar mental.',
  'Vínculo Seguro y Empatía',
  'Un entorno libre de juicios donde podrás expresarte con total confianza, validación y respeto a tu ritmo.',
  'Terapia Basada en Evidencia',
  'Integración de Terapia Cognitivo-Conductual (TCC), Terapia de Aceptación y Compromiso (ACT) y Mindfulness.',
  'Herramientas Prácticas',
  'Estrategias concretas de autorregulación emocional, respiración y límites sanos para tu vida cotidiana.',
  'Ética y Confidencialidad',
  'Práctica clínica avalada por el Colegio Oficial de la Psicología, garantizando máxima reserva y rigor.'
);
