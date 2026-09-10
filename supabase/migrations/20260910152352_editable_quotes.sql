-- Citas y reflexiones editables desde el panel (/admin/quotes).
create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  quote text not null check (char_length(btrim(quote)) between 1 and 1000),
  author text not null check (char_length(btrim(author)) between 1 and 150),
  role text not null default '' check (char_length(role) <= 250),
  accent_note text not null default '' check (char_length(accent_note) <= 300),
  variant text not null default 'mint' check (variant in ('mint', 'sky', 'lavender')),
  sort_order integer not null default 1 check (sort_order between 1 and 10000),
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.quotes enable row level security;
revoke all on table public.quotes from public, anon, authenticated, service_role;
grant select, insert, update, delete on table public.quotes to service_role;

-- Carga inicial con las citas del diseño más reflexiones afines.
insert into public.quotes (quote, author, role, accent_note, variant, sort_order, is_published) values
  ('No puedes detener las olas, pero puedes aprender a surfear.',
   'Jon Kabat-Zinn',
   'Pionero de la Reducción del Estrés Basada en Mindfulness (MBSR)',
   'Respira, cada momento es una oportunidad para empezar de nuevo',
   'mint', 1, true),
  ('La curiosa paradoja es que cuando me acepto tal como soy, entonces puedo cambiar.',
   'Carl Rogers',
   'Fundador del Enfoque Centrado en la Persona',
   'Tu espacio de aceptación incondicional',
   'sky', 2, true),
  ('Entre el estímulo y la respuesta hay un espacio. En ese espacio reside nuestro poder de elegir.',
   'Viktor Frankl',
   'Neurólogo, psiquiatra y autor de El hombre en busca de sentido',
   'Elige con calma tu propio camino',
   'lavender', 3, true),
  ('Sentir no es un signo de debilidad; es la prueba más certera de que estás vivo y conectado.',
   'Brené Brown',
   'Investigadora y referente en empatía y vulnerabilidad',
   'Abraza tu humanidad con gentileza',
   'mint', 4, true);
