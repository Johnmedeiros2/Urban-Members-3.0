-- ─── AULAS DOS CURSOS ─────────────────────────────────────────────
-- Cada curso tem N aulas. Aula pode ser gravada (video_url) ou ao vivo (link + data).

create table if not exists public.aulas (
  id uuid default gen_random_uuid() primary key,
  curso_id uuid references public.cursos(id) on delete cascade not null,
  titulo text not null,
  descricao text,
  ordem int not null default 0,
  video_url text,
  duracao_seg int default 0,
  ao_vivo boolean default false,
  agendado_para timestamptz,
  link_ao_vivo text,
  criado_em timestamptz default now() not null
);

create index if not exists idx_aulas_curso on public.aulas(curso_id, ordem);

alter table public.aulas enable row level security;

create policy "Aulas publicas para leitura" on public.aulas
  for select using (true);

create policy "Instrutor cria aula no seu curso" on public.aulas
  for insert with check (
    auth.uid() = (select instrutor_id from public.cursos where id = curso_id)
  );

create policy "Instrutor edita aula no seu curso" on public.aulas
  for update using (
    auth.uid() = (select instrutor_id from public.cursos where id = curso_id)
  );

create policy "Instrutor apaga aula no seu curso" on public.aulas
  for delete using (
    auth.uid() = (select instrutor_id from public.cursos where id = curso_id)
  );

-- Progresso do aluno em cada aula
create table if not exists public.aula_progresso (
  id uuid default gen_random_uuid() primary key,
  aula_id uuid references public.aulas(id) on delete cascade not null,
  morador_id uuid references public.perfis(id) on delete cascade not null,
  concluida boolean default false,
  atualizado_em timestamptz default now() not null,
  unique (aula_id, morador_id)
);

alter table public.aula_progresso enable row level security;

create policy "Progresso publico para leitura" on public.aula_progresso
  for select using (true);

create policy "Morador registra seu progresso" on public.aula_progresso
  for insert with check (auth.uid() = morador_id);

create policy "Morador atualiza seu progresso" on public.aula_progresso
  for update using (auth.uid() = morador_id);

-- ⚠️ Ação: criar bucket "aulas" no Storage (Public ON) se for hospedar vídeos longos aqui.
-- Alternativa: reutilizar o bucket "videos" já existente.
