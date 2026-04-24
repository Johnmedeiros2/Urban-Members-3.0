-- ─── LIVE COMMERCE ─────────────────────────────────────────────────
-- Tabela de junção que vincula produtos/cursos a uma live.
-- Morador transmite e os itens aparecem clicáveis na tela da live.

create table if not exists public.live_produtos (
  id uuid default gen_random_uuid() primary key,
  live_id uuid references public.lives(id) on delete cascade not null,
  produto_id uuid references public.produtos(id) on delete cascade,
  curso_id uuid references public.cursos(id) on delete cascade,
  destaque boolean default false,
  ordem int default 0,
  criado_em timestamptz default now() not null,
  check ((produto_id is not null and curso_id is null) or (produto_id is null and curso_id is not null))
);

create index if not exists idx_live_produtos_live on public.live_produtos(live_id, ordem);

-- Rastreia transações originadas de uma live (para mensurar conversão)
alter table public.transacoes
  add column if not exists origem_live_id uuid references public.lives(id);

create index if not exists idx_transacoes_origem_live on public.transacoes(origem_live_id);

alter table public.live_produtos enable row level security;

create policy "Live produtos publicos" on public.live_produtos
  for select using (true);

create policy "Morador vincula produto na propria live" on public.live_produtos
  for insert with check (
    auth.uid() = (select autor_id from public.lives where id = live_id)
  );

create policy "Morador apaga vinculo na propria live" on public.live_produtos
  for delete using (
    auth.uid() = (select autor_id from public.lives where id = live_id)
  );
