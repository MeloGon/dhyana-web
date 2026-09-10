-- Contenido editable desde el panel; la web recibe solo preguntas publicadas.
create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null check (char_length(btrim(question)) between 1 and 300),
  answer text not null check (char_length(btrim(answer)) between 1 and 5000),
  sort_order integer not null default 1 check (sort_order between 1 and 10000),
  is_published boolean not null default false
);

alter table public.faqs enable row level security;
revoke all on table public.faqs from public, anon, authenticated, service_role;
grant select, insert, update, delete on table public.faqs to service_role;

-- Carga inicial única: conserva exactamente los textos y el orden del diseño.
insert into public.faqs (question, answer, sort_order, is_published) values
  ('¿Cómo es la primera sesión de psicoterapia?',
   'La primera sesión es un espacio de evaluación y conocimiento mutuo. Exploraremos qué te trae a consulta, tus inquietudes actuales y tus objetivos, sin ningún tipo de presión ni juicio.', 1, true),
  ('¿Qué diferencias hay entre modalidad online y presencial?',
   'Ambas modalidades cuentan con el mismo rigor terapéutico y eficacia comprobada. En online nos conectamos por videollamada cifrada y en presencial nos vemos en el consultorio.', 2, true),
  ('¿Con qué frecuencia se realizan las sesiones?',
   'Habitualmente comenzamos con una frecuencia semanal o quincenal para generar tracción y cambios sostenidos, espaciándose conforme progreses hacia el alta.', 3, true),
  ('¿Cómo se garantiza la confidencialidad?',
   'Todo lo tratado en sesión está estrictamente protegido por el secreto profesional y el Código Deontológico del Colegio Oficial de la Psicología (COP).', 4, true);
