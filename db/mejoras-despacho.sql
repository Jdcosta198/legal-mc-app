-- LEGAL MARTÍNEZ & CORTÉS · Mejora opcional de la base de datos (versión 2 del despacho)
-- Ejecutar UNA vez en Supabase → SQL Editor. Se puede repetir sin dañar nada.
-- La app funciona sin esta mejora; al instalarla se activan solas estas funciones:
--   · marcar plazos de la agenda como "hechos"
--   · cliente, materia y notas internas en cada expediente
--   · cotizaciones de la calculadora guardadas en la nube (visibles para ambos profesionales)
-- Mantiene el modelo actual: solo profesionales ACTIVOS de public.professionals ven y editan.

begin;

-- Función de apoyo: ¿la persona conectada es un profesional activo del despacho?
create or replace function public.lmc_es_profesional_activo() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.professionals p where p.user_id = auth.uid() and p.active)
$$;
revoke all on function public.lmc_es_profesional_activo() from public, anon;
grant execute on function public.lmc_es_profesional_activo() to authenticated;

-- 1) Agenda: plazo realizado
alter table public.events add column if not exists done boolean not null default false;
alter table public.events add column if not exists done_at timestamptz;
grant select (done, done_at) on public.events to authenticated;
grant update (done, done_at) on public.events to authenticated;
drop policy if exists lmc_events_marcar_hecho on public.events;
create policy lmc_events_marcar_hecho on public.events for update to authenticated
  using (public.lmc_es_profesional_activo()) with check (public.lmc_es_profesional_activo());
create or replace function public.lmc_events_done_at() returns trigger language plpgsql as $$
begin new.done_at := case when new.done then coalesce(new.done_at, now()) else null end; return new; end $$;
drop trigger if exists lmc_events_done_at on public.events;
create trigger lmc_events_done_at before insert or update of done on public.events for each row execute function public.lmc_events_done_at();

-- 2) Expedientes: cliente, materia y notas
alter table public.cases add column if not exists client_name text check (char_length(client_name) <= 200);
alter table public.cases add column if not exists area text check (char_length(area) <= 60);
alter table public.cases add column if not exists notes text check (char_length(notes) <= 2000);
grant select (client_name, area, notes) on public.cases to authenticated;
grant insert (client_name, area, notes) on public.cases to authenticated;
grant update (client_name, area, notes) on public.cases to authenticated;

-- 3) Cotizaciones de la calculadora
create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references public.cases(id) on delete set null,
  client_name text not null check (char_length(client_name) between 1 and 200),
  client_phone text check (char_length(client_phone) <= 20),
  service text not null check (char_length(service) <= 400),
  tariff_id text not null check (char_length(tariff_id) <= 40),
  total numeric(14,2) not null check (total >= 0),
  detail jsonb not null default '{}'::jsonb,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now()
);
create index if not exists quotes_created_idx on public.quotes(created_at desc);
alter table public.quotes enable row level security;
revoke all on public.quotes from anon, authenticated;
grant select, insert on public.quotes to authenticated;   -- sin editar ni borrar: historial confiable
drop policy if exists lmc_quotes_leer on public.quotes;
create policy lmc_quotes_leer on public.quotes for select to authenticated using (public.lmc_es_profesional_activo());
drop policy if exists lmc_quotes_crear on public.quotes;
create policy lmc_quotes_crear on public.quotes for insert to authenticated
  with check (public.lmc_es_profesional_activo() and created_by = auth.uid());

commit;
