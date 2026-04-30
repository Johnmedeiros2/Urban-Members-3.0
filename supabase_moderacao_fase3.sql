-- ─── MODERAÇÃO — FASE 3: CURSOS, COMENTÁRIOS E AVALIAÇÕES ──────
-- Mesmo padrão da Fase 2: soft delete + função SECURITY DEFINER
-- que checa is_moderador() e exige motivo de pelo menos 10 chars.

-- ── CURSOS ───────────────────────────────────────────────────────

alter table public.cursos
  add column if not exists apagado_em timestamptz;
alter table public.cursos
  add column if not exists apagado_por uuid
  references public.perfis(id) on delete set null;
alter table public.cursos
  add column if not exists motivo_remocao text;

create index if not exists idx_cursos_apagado
  on public.cursos(apagado_em) where apagado_em is not null;

create or replace function public.remover_curso(curso_id uuid, motivo text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  meu_id uuid;
begin
  meu_id := auth.uid();
  if meu_id is null then raise exception 'Não autenticado'; end if;
  if not public.is_moderador() then
    raise exception 'Apenas moderadores podem remover conteúdo';
  end if;
  if length(coalesce(motivo, '')) < 10 then
    raise exception 'Informe um motivo com pelo menos 10 caracteres';
  end if;

  update public.cursos
    set apagado_em = now(), apagado_por = meu_id, motivo_remocao = motivo
    where id = curso_id and apagado_em is null;

  insert into public.acoes_moderacao (moderador_id, tipo_alvo, alvo_id, motivo)
  values (meu_id, 'curso', curso_id, motivo);
end;
$$;

revoke all on function public.remover_curso(uuid, text) from public;
grant execute on function public.remover_curso(uuid, text) to authenticated;

-- ── COMENTÁRIOS ──────────────────────────────────────────────────

alter table public.comentarios
  add column if not exists apagado_em timestamptz;
alter table public.comentarios
  add column if not exists apagado_por uuid
  references public.perfis(id) on delete set null;
alter table public.comentarios
  add column if not exists motivo_remocao text;

create index if not exists idx_comentarios_apagado
  on public.comentarios(apagado_em) where apagado_em is not null;

create or replace function public.remover_comentario(comentario_id uuid, motivo text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  meu_id uuid;
begin
  meu_id := auth.uid();
  if meu_id is null then raise exception 'Não autenticado'; end if;
  if not public.is_moderador() then
    raise exception 'Apenas moderadores podem remover conteúdo';
  end if;
  if length(coalesce(motivo, '')) < 10 then
    raise exception 'Informe um motivo com pelo menos 10 caracteres';
  end if;

  update public.comentarios
    set apagado_em = now(), apagado_por = meu_id, motivo_remocao = motivo
    where id = comentario_id and apagado_em is null;

  insert into public.acoes_moderacao (moderador_id, tipo_alvo, alvo_id, motivo)
  values (meu_id, 'comentario', comentario_id, motivo);
end;
$$;

revoke all on function public.remover_comentario(uuid, text) from public;
grant execute on function public.remover_comentario(uuid, text) to authenticated;

-- ── AVALIAÇÕES ───────────────────────────────────────────────────

alter table public.avaliacoes
  add column if not exists apagado_em timestamptz;
alter table public.avaliacoes
  add column if not exists apagado_por uuid
  references public.perfis(id) on delete set null;
alter table public.avaliacoes
  add column if not exists motivo_remocao text;

create index if not exists idx_avaliacoes_apagado
  on public.avaliacoes(apagado_em) where apagado_em is not null;

create or replace function public.remover_avaliacao(avaliacao_id uuid, motivo text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  meu_id uuid;
begin
  meu_id := auth.uid();
  if meu_id is null then raise exception 'Não autenticado'; end if;
  if not public.is_moderador() then
    raise exception 'Apenas moderadores podem remover conteúdo';
  end if;
  if length(coalesce(motivo, '')) < 10 then
    raise exception 'Informe um motivo com pelo menos 10 caracteres';
  end if;

  update public.avaliacoes
    set apagado_em = now(), apagado_por = meu_id, motivo_remocao = motivo
    where id = avaliacao_id and apagado_em is null;

  insert into public.acoes_moderacao (moderador_id, tipo_alvo, alvo_id, motivo)
  values (meu_id, 'avaliacao', avaliacao_id, motivo);
end;
$$;

revoke all on function public.remover_avaliacao(uuid, text) from public;
grant execute on function public.remover_avaliacao(uuid, text) to authenticated;
