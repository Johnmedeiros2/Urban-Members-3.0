-- ─── STORIES 24H ─────────────────────────────────────────────────
-- Conteúdo efêmero: expira 24h após criação. Fotos ou vídeos.

create table if not exists public.stories (
  id uuid default gen_random_uuid() primary key,
  autor_id uuid references public.perfis(id) on delete cascade not null,
  foto_url text,
  video_url text,
  criado_em timestamptz default now() not null,
  expira_em timestamptz default (now() + interval '24 hours') not null,
  check (foto_url is not null or video_url is not null)
);

create index if not exists idx_stories_expira on public.stories(expira_em);
create index if not exists idx_stories_autor on public.stories(autor_id);

-- RLS
alter table public.stories enable row level security;

create policy "Stories ativos publicos" on public.stories
  for select using (expira_em > now());

create policy "Morador cria seu story" on public.stories
  for insert with check (auth.uid() = autor_id);

create policy "Morador apaga seu story" on public.stories
  for delete using (auth.uid() = autor_id);

-- Reutiliza buckets: foto vai em "posts", vídeo vai em "videos"
-- Nenhum bucket novo necessário.
