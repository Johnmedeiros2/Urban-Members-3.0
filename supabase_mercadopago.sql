-- ─── MERCADO PAGO: COLUNAS EXTRAS EM TRANSAÇÕES ────────────────────
-- Adiciona campos para rastrear pagamento no MP.
-- Status passa a ter ciclo: "pendente" → "concluida" (webhook) ou "cancelada"/"recusada"

alter table public.transacoes
  add column if not exists mp_preference_id text,
  add column if not exists mp_payment_id text,
  add column if not exists mp_payment_status text,
  add column if not exists metodo_pagamento text;

-- Índice para busca rápida por payment_id (usado no webhook)
create index if not exists idx_transacoes_mp_payment on public.transacoes(mp_payment_id);
create index if not exists idx_transacoes_mp_preference on public.transacoes(mp_preference_id);

-- Status default é "pendente" quando usar MP (antes era "concluida" direto)
-- Nota: se quiser manter compatibilidade com fluxo atual (Urban Pay interno),
-- só muda o status via código dependendo do caminho (interno vs MP).
