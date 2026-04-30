-- ─── MODERAÇÃO — FASE 2: REMOÇÃO DE POSTS ──────────────────────
-- Adiciona soft delete em posts e a função que faz a remoção.
-- A função roda como SECURITY DEFINER e checa is_moderador() —
-- não precisa abrir policy de UPDATE em posts pra moderador.

alter table public.posts
  add column if not exists apagado_em timestamptz;

alter table public.posts
  add column if not exists apagado_por uuid
  references public.perfis(id) on delete set null;

alter table public.posts
  add column if not exists motivo_remocao text;

create index if not exists idx_posts_apagado
  on public.posts(apagado_em) where apagado_em is not null;

create or replace function public.remover_post(post_id uuid, motivo text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  meu_id uuid;
begin
  meu_id := auth.uid();
  if meu_id is null then
    raise exception 'Não autenticado';
  end if;
  if not public.is_moderador() then
    raise exception 'Apenas moderadores podem remover conteúdo';
  end if;
  if length(coalesce(motivo, '')) < 10 then
    raise exception 'Informe um motivo com pelo menos 10 caracteres';
  end if;

  update public.posts
    set apagado_em = now(),
        apagado_por = meu_id,
        motivo_remocao = motivo
    where id = post_id
      and apagado_em is null;

  insert into public.acoes_moderacao (moderador_id, tipo_alvo, alvo_id, motivo)
  values (meu_id, 'post', post_id, motivo);
end;
$$;

revoke all on function public.remover_post(uuid, text) from public;
grant execute on function public.remover_post(uuid, text) to authenticated;
