-- ─── MATERIAIS DO CURSO ─────────────────────────────────────────
-- Arquivos (PDF, Excel, Word, etc) anexados ao curso ou a uma aula específica.

create table if not exists public.materiais (
  id uuid default gen_random_uuid() primary key,
  curso_id uuid references public.cursos(id) on delete cascade not null,
  aula_id uuid references public.aulas(id) on delete cascade,
  titulo text not null,
  descricao text,
  arquivo_url text not null,
  nome_arquivo text not null,
  tipo text,
  tamanho_bytes bigint,
  criado_em timestamptz default now() not null
);

create index if not exists idx_materiais_curso on public.materiais(curso_id);
create index if not exists idx_materiais_aula  on public.materiais(aula_id);

alter table public.materiais enable row level security;

create policy "Materiais publicos para leitura" on public.materiais
  for select using (true);

create policy "Instrutor adiciona material no seu curso" on public.materiais
  for insert with check (
    auth.uid() = (select instrutor_id from public.cursos where id = curso_id)
  );

create policy "Instrutor edita material do seu curso" on public.materiais
  for update using (
    auth.uid() = (select instrutor_id from public.cursos where id = curso_id)
  );

create policy "Instrutor apaga material do seu curso" on public.materiais
  for delete using (
    auth.uid() = (select instrutor_id from public.cursos where id = curso_id)
  );

-- ⚠️ Ação manual: criar bucket "materiais" no Supabase Storage
-- 1. Storage → New bucket → nome: materiais → Public ON → Create
-- 2. Additional configuration (opcional):
--    - File size limit: 50MB
--    - Allowed MIME types:
--      application/pdf,
--      application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,
--      application/vnd.openxmlformats-officedocument.wordprocessingml.document,
--      application/vnd.openxmlformats-officedocument.presentationml.presentation,
--      application/vnd.ms-excel,
--      application/msword,
--      application/vnd.ms-powerpoint,
--      text/csv,
--      text/plain
