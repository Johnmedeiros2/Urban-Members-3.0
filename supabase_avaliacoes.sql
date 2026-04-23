-- ─── TABELA: AVALIAÇÕES ─────────────────────────────────────────────
-- Avaliação de produto ou curso por morador. 1 a 5 estrelas + comentário.

create table if not exists public.avaliacoes (
  id uuid default gen_random_uuid() primary key,
  produto_id uuid references public.produtos(id) on delete cascade,
  curso_id uuid references public.cursos(id) on delete cascade,
  autor_id uuid references public.perfis(id) on delete cascade not null,
  estrelas int not null check (estrelas between 1 and 5),
  comentario text,
  criado_em timestamptz default now() not null,
  -- Uma avaliação precisa ser de produto OU curso, não ambos nem nenhum
  check ((produto_id is not null and curso_id is null) or (produto_id is null and curso_id is not null))
);

-- Um morador só pode avaliar o mesmo produto/curso uma vez
create unique index if not exists idx_avaliacoes_unico_produto
  on public.avaliacoes(autor_id, produto_id) where produto_id is not null;
create unique index if not exists idx_avaliacoes_unico_curso
  on public.avaliacoes(autor_id, curso_id) where curso_id is not null;

-- Índices para busca rápida
create index if not exists idx_avaliacoes_produto on public.avaliacoes(produto_id);
create index if not exists idx_avaliacoes_curso   on public.avaliacoes(curso_id);

-- RLS
alter table public.avaliacoes enable row level security;

create policy "Avaliacoes publicas para leitura" on public.avaliacoes
  for select using (true);

create policy "Morador escreve a propria avaliacao" on public.avaliacoes
  for insert with check (auth.uid() = autor_id);

create policy "Morador edita a propria avaliacao" on public.avaliacoes
  for update using (auth.uid() = autor_id);

create policy "Morador apaga a propria avaliacao" on public.avaliacoes
  for delete using (auth.uid() = autor_id);
