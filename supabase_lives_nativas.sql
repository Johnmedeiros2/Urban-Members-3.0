-- ─── LIVES NATIVAS (LiveKit) ─────────────────────────────────────
-- Permite escolher entre: usar link externo (Zoom/YouTube) ou
-- transmitir direto na plataforma via LiveKit.

alter table public.lives
  add column if not exists tipo text default 'externa'
  check (tipo in ('externa', 'nativa'));

alter table public.lives
  add column if not exists nome_sala text;

create index if not exists idx_lives_sala on public.lives(nome_sala) where nome_sala is not null;
