-- ─── URBAN PULSE (vídeos curtos) ─────────────────────────────────
-- Adiciona coluna video_url em posts. Posts com video_url aparecem no /pulse.

alter table public.posts
  add column if not exists video_url text;

-- Índice pra filtrar posts com vídeo rápido no feed vertical
create index if not exists idx_posts_video on public.posts(video_url) where video_url is not null;

-- ⚠️ Ação manual: criar bucket "videos" no Supabase Storage
-- 1. Storage → New bucket → nome: videos → Public bucket (on) → Create
-- 2. (Opcional) File size limit: 50MB
-- 3. Allowed MIME types: video/mp4, video/quicktime, video/webm
