-- Agregar soporte de precio referencial en USD para participantes internacionales.
alter table public.workshop_groups
  add column if not exists usd_price_cents integer check (usd_price_cents is null or usd_price_cents > 0);

-- Actualizar save_workshop_catalog para persistir usd_price_cents
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
  v_regular_cents integer;
  v_discount_cents integer;
  v_final_cents integer;
  v_usd_cents integer;
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
    v_discount_cents := coalesce((v_group->>'discountCents')::integer, 0);
    v_regular_cents := coalesce((v_group->>'regularPriceCents')::integer, (v_group->>'priceCents')::integer);
    v_final_cents := coalesce((v_group->>'priceCents')::integer, v_regular_cents - v_discount_cents);
    v_usd_cents := (v_group->>'usdPriceCents')::integer;

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
      update public.workshop_groups set
        schedule_description = v_group->>'scheduleDescription',
        regular_price_cents = v_regular_cents,
        discount_cents = v_discount_cents,
        price_cents = v_final_cents,
        usd_price_cents = v_usd_cents,
        capacity = (v_group->>'capacity')::integer,
        is_published = (v_group->>'isPublished')::boolean,
        sort_order = v_order
      where id = v_group_id and workshop_id = v_id;
    else
      insert into public.workshop_groups (
        workshop_id, schedule_description, price_cents, regular_price_cents, discount_cents, usd_price_cents,
        capacity, is_published, sort_order
      )
      values (
        v_id,
        v_group->>'scheduleDescription',
        v_final_cents,
        v_regular_cents,
        v_discount_cents,
        v_usd_cents,
        (v_group->>'capacity')::integer,
        (v_group->>'isPublished')::boolean,
        v_order
      )
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
