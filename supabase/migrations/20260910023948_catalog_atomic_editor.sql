-- Un guardado incluye taller y todos sus horarios. Un error revierte todo.
alter table public.workshop_groups add column sort_order integer not null default 0;
grant delete on public.workshops, public.workshop_groups to service_role;

create function public.save_workshop_catalog(p_workshop_id uuid, p_workshop jsonb, p_slug text)
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
      if (v_group->>'capacity')::integer < (
        select count(*) from public.monthly_accesses a join public.purchases p on p.id = a.purchase_id
        where p.group_id = v_group_id and a.starts_at <= now() and a.ends_at > now()
      ) then
        raise exception using errcode = 'PT409', message = 'La capacidad no puede ser menor que los accesos vigentes.';
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

create function public.delete_workshop_catalog(p_workshop_id uuid)
returns void
language plpgsql security invoker set search_path = ''
as $$
begin
  perform id from public.workshops where id = p_workshop_id for update;
  if not found then
    raise exception using errcode = 'PT404', message = 'Taller no encontrado.';
  end if;
  perform id from public.workshop_groups where workshop_id = p_workshop_id order by id for update;
  if exists (
    select 1 from public.purchases p join public.workshop_groups g on g.id = p.group_id
    where g.workshop_id = p_workshop_id
  ) then
    raise exception using errcode = 'PT409', message = 'Este taller tiene compras. Desmarca «Publicar en la web» para ocultarlo sin perder el historial.';
  end if;
  -- Las FK también bloquean una compra que llegue durante la eliminación.
  delete from public.workshop_groups where workshop_id = p_workshop_id;
  delete from public.workshops where id = p_workshop_id;
end;
$$;

revoke all on function public.save_workshop_catalog(uuid, jsonb, text) from public, anon, authenticated;
revoke all on function public.delete_workshop_catalog(uuid) from public, anon, authenticated;
grant execute on function public.save_workshop_catalog(uuid, jsonb, text) to service_role;
grant execute on function public.delete_workshop_catalog(uuid) to service_role;
