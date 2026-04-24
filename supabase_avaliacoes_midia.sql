-- ─── MÍDIA EM AVALIAÇÕES ─────────────────────────────────────────
-- Adiciona foto e vídeo na avaliação (review com prova visual).

alter table public.avaliacoes
  add column if not exists foto_url text,
  add column if not exists video_url text;
