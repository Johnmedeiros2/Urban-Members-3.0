-- ─── LIVES DE MORADOR ─────────────────────────────────────────────
-- MVP: morador agenda live (link externo Zoom/Meet/IG/YouTube).
-- Sem streaming nativo ainda — vídeo ao vivo nativo fica pra fase com infra dedicada.

create table if not exists public.lives (
  id uuid default gen_random_uuid() primary key,
  autor_id uuid references public.perfis(id) on delete cascade not null,
  titulo text not null,
  descricao text,
  agendado_para timestamptz,
  link text,
  ao_vivo boolean default false,
  bairro_id text,
  criado_em timestamptz default now() not null
);

create index if not exists idx_lives_agendada on public.lives(agendado_para);
create index if not exists idx_lives_ao_vivo on public.lives(ao_vivo) where ao_vivo = true;

alter table public.lives enable row level security;

create policy "Lives publicas" on public.lives
  for select using (true);

create policy "Morador cria sua live" on public.lives
  for insert with check (auth.uid() = autor_id);

create policy "Morador edita sua live" on public.lives
  for update using (auth.uid() = autor_id);

create policy "Morador apaga sua live" on public.lives
  for delete using (auth.uid() = autor_id);
