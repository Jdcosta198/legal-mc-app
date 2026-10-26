-- SOLO PRUEBAS. Reconstrucción de la base actual del despacho a partir de work/verify-rls.sql
-- (tablas professionals, cases, documents, events con permisos por columna y RLS para activos).
do $$ begin if not exists (select 1 from pg_roles where rolname='anon') then create role anon nologin; end if;
 if not exists (select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if; end $$;
create schema if not exists auth;
create table if not exists auth.users(id uuid primary key, email text);
create or replace function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claims',true)::json->>'sub','')::uuid $$;
grant usage on schema auth, public to anon, authenticated; grant execute on function auth.uid() to anon, authenticated;
create table public.professionals(user_id uuid primary key references auth.users(id), display_name text not null, active boolean not null default true);
create or replace function public.is_active_professional() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from professionals where user_id=auth.uid() and active) $$;
grant execute on function public.is_active_professional() to authenticated;
create table public.cases(id uuid primary key default gen_random_uuid(), title text not null, reference text, status text not null default 'active' check(status in('active','closed')), created_by uuid not null default auth.uid(), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.documents(id uuid primary key default gen_random_uuid(), case_id uuid not null references public.cases(id), filename text not null, object_path text not null unique, byte_size bigint not null, uploaded_by uuid not null default auth.uid(), created_at timestamptz not null default now());
create table public.events(id uuid primary key default gen_random_uuid(), case_id uuid not null references public.cases(id), title text not null, due_at timestamptz not null, created_by uuid not null default auth.uid(), created_at timestamptz not null default now());
alter table public.professionals enable row level security; alter table public.cases enable row level security; alter table public.documents enable row level security; alter table public.events enable row level security;
grant select on public.professionals to authenticated;
grant select(id,title,reference,status,created_by,created_at,updated_at) on public.cases to authenticated;
grant insert(id,title,reference,status) on public.cases to authenticated;
grant update(title,reference,status,updated_at) on public.cases to authenticated;
grant select, insert on public.documents, public.events to authenticated;
create policy p_read on public.professionals for select to authenticated using (user_id=auth.uid());
create policy c_all on public.cases for all to authenticated using (public.is_active_professional()) with check (public.is_active_professional());
create policy d_all on public.documents for all to authenticated using (public.is_active_professional()) with check (public.is_active_professional());
create policy e_sel on public.events for select to authenticated using (public.is_active_professional());
create policy e_ins on public.events for insert to authenticated with check (public.is_active_professional());
