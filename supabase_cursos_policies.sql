-- ─── POLICIES DE EDIÇÃO E EXCLUSÃO DE CURSOS ────────────────────
-- Permite ao instrutor (dono do curso) atualizar e apagar.
-- Idempotente: pode rodar múltiplas vezes sem erro.

drop policy if exists "Instrutor edita seu curso" on public.cursos;
create policy "Instrutor edita seu curso" on public.cursos
  for update using (auth.uid() = instrutor_id);

drop policy if exists "Instrutor apaga seu curso" on public.cursos;
create policy "Instrutor apaga seu curso" on public.cursos
  for delete using (auth.uid() = instrutor_id);

-- ⚠️ Pré-requisito: as tabelas dependentes (aulas, materiais, avaliacoes,
-- wishlist, live_produtos, curso_alunos, transacoes) já devem ter
-- "on delete cascade" no campo curso_id. Se uma delas não tiver, o delete
-- vai falhar com FK violation — confira no painel do Supabase.
