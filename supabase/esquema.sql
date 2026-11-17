create table if not exists public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  rol text not null default 'candidato' check (rol in ('candidato', 'empresa', 'admin')),
  nombre text not null,
  telefono text,
  edad int check (edad between 18 and 120),
  colonia text,
  experiencia text,
  giro text,
  aprobado boolean not null default false,
  creado_en timestamptz not null default now()
);

create table if not exists public.vacantes (
  id bigint generated always as identity primary key,
  empresa_id uuid not null references public.perfiles (id) on delete cascade,
  titulo text not null,
  sueldo numeric(10, 2) not null check (sueldo > 0),
  ubicacion text not null,
  horario text not null check (horario in ('Matutino', 'Vespertino', 'Medio tiempo', 'Fines de semana')),
  categoria text not null,
  descripcion text not null,
  requisitos text not null,
  prestaciones text not null,
  telefono_contacto text,
  estado text not null default 'activa' check (estado in ('activa', 'pausada', 'cerrada')),
  creada_en timestamptz not null default now()
);

create table if not exists public.solicitudes (
  id bigint generated always as identity primary key,
  vacante_id bigint not null references public.vacantes (id) on delete cascade,
  candidato_id uuid not null references public.perfiles (id) on delete cascade,
  estatus text not null default 'Enviada' check (estatus in ('Enviada', 'En revisión', 'Aceptada', 'Rechazada', 'Cancelada')),
  creada_en timestamptz not null default now(),
  unique (vacante_id, candidato_id)
);

create index if not exists vacantes_empresa_idx on public.vacantes (empresa_id);
create index if not exists vacantes_estado_idx on public.vacantes (estado);
create index if not exists solicitudes_candidato_idx on public.solicitudes (candidato_id);

create or replace function public.crear_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  edad_texto text := meta ->> 'edad';
begin
  insert into public.perfiles (id, rol, nombre, telefono, edad, colonia, experiencia, giro)
  values (
    new.id,
    case when meta ->> 'rol' = 'empresa' then 'empresa' else 'candidato' end,
    coalesce(nullif(trim(meta ->> 'nombre'), ''), new.email, 'Sin nombre'),
    nullif(trim(meta ->> 'telefono'), ''),
    case when edad_texto ~ '^[0-9]{1,3}$' then edad_texto::int end,
    nullif(trim(meta ->> 'colonia'), ''),
    nullif(trim(meta ->> 'experiencia'), ''),
    nullif(trim(meta ->> 'giro'), '')
  );
  return new;
end;
$$;

drop trigger if exists al_crear_usuario on auth.users;
create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.crear_perfil();

create or replace function public.mi_rol()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select rol from public.perfiles where id = (select auth.uid());
$$;

create or replace function public.candidato_aprobado()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.perfiles
    where id = (select auth.uid())
      and rol = 'candidato'
      and aprobado
  );
$$;

create or replace function public.candidato_aplico(vid bigint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.solicitudes
    where vacante_id = vid
      and candidato_id = (select auth.uid())
  );
$$;

create or replace function public.empresa_ve_candidato(cid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.solicitudes s
    join public.vacantes v on v.id = s.vacante_id
    where s.candidato_id = cid
      and v.empresa_id = (select auth.uid())
  );
$$;

create or replace function public.vacante_es_mia(vid bigint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.vacantes
    where id = vid
      and empresa_id = (select auth.uid())
  );
$$;

create or replace function public.vacante_activa(vid bigint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.vacantes
    where id = vid
      and estado = 'activa'
  );
$$;

revoke execute on function public.crear_perfil() from public, anon, authenticated;
revoke execute on function public.mi_rol() from public, anon;
revoke execute on function public.candidato_aprobado() from public, anon;
revoke execute on function public.candidato_aplico(bigint) from public, anon;
revoke execute on function public.empresa_ve_candidato(uuid) from public, anon;
revoke execute on function public.vacante_es_mia(bigint) from public, anon;
revoke execute on function public.vacante_activa(bigint) from public, anon;

grant execute on function public.mi_rol() to authenticated;
grant execute on function public.candidato_aprobado() to authenticated;
grant execute on function public.candidato_aplico(bigint) to authenticated;
grant execute on function public.empresa_ve_candidato(uuid) to authenticated;
grant execute on function public.vacante_es_mia(bigint) to authenticated;
grant execute on function public.vacante_activa(bigint) to authenticated;

alter table public.perfiles enable row level security;
alter table public.vacantes enable row level security;
alter table public.solicitudes enable row level security;

grant usage on schema public to anon, authenticated;

revoke all on table public.perfiles from anon, authenticated;
revoke all on table public.vacantes from anon, authenticated;
revoke all on table public.solicitudes from anon, authenticated;

grant select (id, rol, nombre, giro) on public.perfiles to anon;
grant select on public.perfiles to authenticated;
grant update (nombre, telefono, edad, colonia, experiencia, giro) on public.perfiles to authenticated;

grant select on public.vacantes to anon, authenticated;
grant insert on public.vacantes to authenticated;
grant update (titulo, sueldo, ubicacion, horario, categoria, descripcion, requisitos, prestaciones, telefono_contacto, estado) on public.vacantes to authenticated;

grant select, insert on public.solicitudes to authenticated;
grant update (estatus) on public.solicitudes to authenticated;

drop policy if exists perfiles_ver_propio on public.perfiles;
create policy perfiles_ver_propio on public.perfiles
  for select to authenticated
  using (id = (select auth.uid()));

drop policy if exists perfiles_ver_empresas on public.perfiles;
create policy perfiles_ver_empresas on public.perfiles
  for select to anon, authenticated
  using (rol = 'empresa');

drop policy if exists perfiles_empresa_ve_postulantes on public.perfiles;
create policy perfiles_empresa_ve_postulantes on public.perfiles
  for select to authenticated
  using (public.empresa_ve_candidato(id));

drop policy if exists perfiles_editar_propio on public.perfiles;
create policy perfiles_editar_propio on public.perfiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists vacantes_ver_activas on public.vacantes;
create policy vacantes_ver_activas on public.vacantes
  for select to anon
  using (estado = 'activa');

drop policy if exists vacantes_ver on public.vacantes;
create policy vacantes_ver on public.vacantes
  for select to authenticated
  using (
    estado = 'activa'
    or empresa_id = (select auth.uid())
    or public.candidato_aplico(id)
  );

drop policy if exists vacantes_publicar on public.vacantes;
create policy vacantes_publicar on public.vacantes
  for insert to authenticated
  with check (
    empresa_id = (select auth.uid())
    and public.mi_rol() = 'empresa'
  );

drop policy if exists vacantes_editar on public.vacantes;
create policy vacantes_editar on public.vacantes
  for update to authenticated
  using (
    empresa_id = (select auth.uid())
    and public.mi_rol() = 'empresa'
  )
  with check (
    empresa_id = (select auth.uid())
    and public.mi_rol() = 'empresa'
  );

drop policy if exists solicitudes_ver on public.solicitudes;
create policy solicitudes_ver on public.solicitudes
  for select to authenticated
  using (
    candidato_id = (select auth.uid())
    or public.vacante_es_mia(vacante_id)
  );

drop policy if exists solicitudes_postular on public.solicitudes;
create policy solicitudes_postular on public.solicitudes
  for insert to authenticated
  with check (
    candidato_id = (select auth.uid())
    and estatus = 'Enviada'
    and public.candidato_aprobado()
    and public.vacante_activa(vacante_id)
  );

drop policy if exists solicitudes_cancelar on public.solicitudes;
create policy solicitudes_cancelar on public.solicitudes
  for update to authenticated
  using (
    candidato_id = (select auth.uid())
    and estatus in ('Enviada', 'En revisión')
  )
  with check (
    candidato_id = (select auth.uid())
    and estatus = 'Cancelada'
  );

drop policy if exists solicitudes_responder on public.solicitudes;
create policy solicitudes_responder on public.solicitudes
  for update to authenticated
  using (
    public.vacante_es_mia(vacante_id)
    and estatus <> 'Cancelada'
  )
  with check (
    public.vacante_es_mia(vacante_id)
    and estatus in ('En revisión', 'Aceptada', 'Rechazada')
  );
