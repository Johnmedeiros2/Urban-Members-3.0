-- ─── TABELA: CUPONS DE DESCONTO ─────────────────────────────────────
-- Morador afiliado cria cupom com % de desconto. Quem usar ganha desconto
-- e o afiliado recebe a comissão (lógica de comissão já existe via trigger).

create table if not exists public.cupons (
  id uuid default gen_random_uuid() primary key,
  codigo text unique not null,
  afiliado_id uuid references public.perfis(id) on delete cascade not null,
  desconto_percentual int not null check (desconto_percentual between 1 and 50),
  max_usos int not null default 100,
  usos_atuais int not null default 0,
  ativo boolean not null default true,
  expira_em timestamptz,
  criado_em timestamptz default now() not null
);

create index if not exists idx_cupons_codigo on public.cupons(codigo);
create index if not exists idx_cupons_afiliado on public.cupons(afiliado_id);

-- Coluna de cupom usado em transacoes (rastreio + relatório)
alter table public.transacoes
  add column if not exists cupom_id uuid references public.cupons(id),
  add column if not exists desconto_aplicado numeric(10,2) default 0;

-- RLS
alter table public.cupons enable row level security;

create policy "Cupons publicos para leitura por codigo" on public.cupons
  for select using (true);

create policy "Afiliado cria seu cupom" on public.cupons
  for insert with check (auth.uid() = afiliado_id);

create policy "Afiliado edita seu cupom" on public.cupons
  for update using (auth.uid() = afiliado_id);

create policy "Afiliado apaga seu cupom" on public.cupons
  for delete using (auth.uid() = afiliado_id);
