-- Base comercial de Dhyana. Se aplica a un proyecto Supabase nuevo.
-- Esta migración no cobra, reserva cupos ni publica talleres automáticamente.
begin;

create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete restrict,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.workshops (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (length(btrim(title)) > 0),
  summary text not null default '',
  category text not null check (category in ('group', 'individual')),
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.workshop_groups (
  id uuid primary key default gen_random_uuid(),
  workshop_id uuid not null references public.workshops (id) on delete restrict,
  -- Texto editable mientras se concretan los horarios. No genera reuniones.
  schedule_description text not null default '',
  price_cents integer not null check (price_cents > 0),
  currency text not null default 'PEN' check (currency = 'PEN'),
  capacity integer not null check (capacity > 0),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  check (not is_published or length(btrim(schedule_description)) > 0)
);

create index workshop_groups_workshop_id_idx
  on public.workshop_groups (workshop_id);

create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  -- Código independiente del id interno; no contiene datos del comprador.
  reference_code text not null unique
    default ('DHY-' || upper(replace(gen_random_uuid()::text, '-', ''))),
  group_id uuid not null references public.workshop_groups (id) on delete restrict,
  buyer_name text not null check (length(btrim(buyer_name)) > 0),
  buyer_email text not null check (length(btrim(buyer_email)) > 0),
  buyer_phone text not null check (length(btrim(buyer_phone)) > 0),
  -- Importe histórico: editar el precio del grupo no modifica una venta pasada.
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'PEN' check (currency = 'PEN'),
  origin text not null check (origin in ('culqi', 'manual')),
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'cancelled')),
  payment_reference text check (length(btrim(payment_reference)) > 0),
  recorded_by uuid references public.admin_users (user_id) on delete restrict,
  -- Fecha real del pago verificado; registrar una venta manual tarde no la cambia.
  purchased_at timestamptz check (isfinite(purchased_at)),
  coordinated_at timestamptz check (isfinite(coordinated_at)),
  coordinated_by uuid references public.admin_users (user_id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (id, purchased_at),
  check ((status = 'paid') = (purchased_at is not null)),
  check ((origin = 'manual') = (recorded_by is not null)),
  check (origin <> 'culqi' or status <> 'paid' or payment_reference is not null),
  check ((coordinated_at is null) = (coordinated_by is null)),
  check (coordinated_at is null or (status = 'paid' and coordinated_at >= purchased_at))
);

-- Un cargo de Culqi no puede asociarse a dos compras distintas.
create unique index purchases_culqi_payment_reference_idx
  on public.purchases (payment_reference)
  where origin = 'culqi' and payment_reference is not null;

create index purchases_group_id_purchased_at_idx
  on public.purchases (group_id, purchased_at);
create index purchases_recorded_by_idx on public.purchases (recorded_by);
create index purchases_coordinated_by_idx on public.purchases (coordinated_by);

create table public.monthly_accesses (
  -- Una compra confirmada admite un solo acceso, incluso si se reintenta el pago.
  purchase_id uuid primary key,
  starts_at timestamptz not null check (isfinite(starts_at)),
  -- Un mes calendario en Perú, no 30 días. PostgreSQL ajusta 31/01 al último
  -- día de febrero. La columna almacenada impide recibir una fecha del navegador.
  ends_at timestamptz generated always as (
    ((starts_at at time zone 'America/Lima') + interval '1 month')
      at time zone 'America/Lima'
  ) stored,
  created_at timestamptz not null default now(),
  -- La fecha tiene que coincidir con el pago: no puede existir acceso pendiente
  -- ni comenzar un mes nuevo por registrar hoy una venta antigua.
  foreign key (purchase_id, starts_at)
    references public.purchases (id, purchased_at) on delete restrict,
  check (ends_at > starts_at)
);

-- Defensa doble: revocar los permisos predeterminados y activar RLS sin
-- políticas públicas. Ni visitantes ni usuarios autenticados acceden directamente
-- a compradores, capacidad o administradores. La lectura pública llegará por Next.
alter table public.admin_users enable row level security;
alter table public.workshops enable row level security;
alter table public.workshop_groups enable row level security;
alter table public.purchases enable row level security;
alter table public.monthly_accesses enable row level security;

revoke all on table public.admin_users, public.workshops, public.workshop_groups,
  public.purchases, public.monthly_accesses from public, anon, authenticated, service_role;

grant usage on schema public to service_role;
grant select on public.admin_users to service_role;
grant select, insert, update on public.workshops, public.workshop_groups,
  public.purchases, public.monthly_accesses to service_role;

-- La lista de administradores se configura explícitamente desde SQL. No hay
-- autoasignación por registrarse. El backend deberá verificar sesión e is_active
-- antes de usar service_role para cualquier operación administrativa.
commit;
