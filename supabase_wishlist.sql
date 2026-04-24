-- ─── WISHLIST ─────────────────────────────────────────────────────
-- Morador salva produtos ou cursos para depois.

create table if not exists public.wishlist (
  id uuid default gen_random_uuid() primary key,
  morador_id uuid references public.perfis(id) on delete cascade not null,
  produto_id uuid references public.produtos(id) on delete cascade,
  curso_id uuid references public.cursos(id) on delete cascade,
  criado_em timestamptz default now() not null,
  check ((produto_id is not null and curso_id is null) or (produto_id is null and curso_id is not null))
);

create unique index if not exists idx_wishlist_unico_produto
  on public.wishlist(morador_id, produto_id) where produto_id is not null;
create unique index if not exists idx_wishlist_unico_curso
  on public.wishlist(morador_id, curso_id) where curso_id is not null;

create index if not exists idx_wishlist_morador on public.wishlist(morador_id);

alter table public.wishlist enable row level security;

create policy "Wishlist propria" on public.wishlist
  for select using (auth.uid() = morador_id);

create policy "Morador adiciona na propria wishlist" on public.wishlist
  for insert with check (auth.uid() = morador_id);

create policy "Morador remove da propria wishlist" on public.wishlist
  for delete using (auth.uid() = morador_id);
