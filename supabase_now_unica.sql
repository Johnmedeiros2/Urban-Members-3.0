-- ─── NOW (antigo Stories/Pulse) — visualização única ─────────────
-- Adiciona opção de "ver uma vez só" e tabela de rastreio de views.

alter table public.stories
  add column if not exists visualizacao_unica boolean default false;

create table if not exists public.story_visualizacoes (
  id uuid default gen_random_uuid() primary key,
  story_id uuid references public.stories(id) on delete cascade not null,
  morador_id uuid references public.perfis(id) on delete cascade not null,
  criado_em timestamptz default now() not null,
  unique (story_id, morador_id)
);

create index if not exists idx_story_vis_morador on public.story_visualizacoes(morador_id);
create index if not exists idx_story_vis_story on public.story_visualizacoes(story_id);

alter table public.story_visualizacoes enable row level security;

create policy "Visualizacoes publicas para leitura" on public.story_visualizacoes
  for select using (true);

create policy "Morador registra sua visualizacao" on public.story_visualizacoes
  for insert with check (auth.uid() = morador_id);
