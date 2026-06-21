-- =====================================================================
-- Urban Members — Coleta de comportamento por SETOR
-- Cada vez que um morador visita, curte ou posta em um setor (bairro),
-- guardamos um sinal. Com o tempo, esses dados alimentam o algoritmo de
-- recomendação e as vendas direcionadas.
-- Rode este script no Supabase: Dashboard > SQL Editor > New query > Run.
-- =====================================================================

create table if not exists public.setor_interacoes (
  id          uuid primary key default gen_random_uuid(),
  morador_id  uuid not null references public.perfis(id) on delete cascade,
  setor_id    text not null references public.bairros(id) on delete cascade,
  tipo        text not null check (tipo in ('visita', 'curtida', 'post')),
  criado_em   timestamptz not null default now()
);

-- Índices para consultas rápidas (por morador, por setor, por data)
create index if not exists idx_setor_interacoes_morador on public.setor_interacoes(morador_id);
create index if not exists idx_setor_interacoes_setor   on public.setor_interacoes(setor_id);
create index if not exists idx_setor_interacoes_criado  on public.setor_interacoes(criado_em desc);

-- Segurança: cada morador só registra e enxerga as próprias interações
alter table public.setor_interacoes enable row level security;

drop policy if exists "inserir minhas interacoes" on public.setor_interacoes;
create policy "inserir minhas interacoes" on public.setor_interacoes
  for insert with check (auth.uid() = morador_id);

drop policy if exists "ver minhas interacoes" on public.setor_interacoes;
create policy "ver minhas interacoes" on public.setor_interacoes
  for select using (auth.uid() = morador_id);

-- =====================================================================
-- (Opcional) Visão resumida: setores favoritos de cada morador.
-- Útil no futuro para personalizar o feed e direcionar ofertas.
-- =====================================================================
create or replace view public.morador_setores_resumo as
select
  morador_id,
  setor_id,
  count(*)                                              as total_interacoes,
  count(*) filter (where tipo = 'visita')               as visitas,
  count(*) filter (where tipo = 'curtida')              as curtidas,
  count(*) filter (where tipo = 'post')                 as posts,
  max(criado_em)                                        as ultima_interacao
from public.setor_interacoes
group by morador_id, setor_id;
