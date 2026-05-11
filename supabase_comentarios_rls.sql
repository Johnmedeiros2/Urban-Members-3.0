-- ─── COMENTÁRIOS — RLS POLICIES ─────────────────────────────────
-- Garante que usuários autenticados possam inserir e ler comentários.
-- Idempotente: pode rodar múltiplas vezes sem erro.

alter table public.comentarios enable row level security;

-- SELECT: qualquer pessoa (autenticada ou não) pode ler comentários
drop policy if exists "Comentarios visíveis" on public.comentarios;
create policy "Comentarios visíveis" on public.comentarios
  for select using (true);

-- INSERT: usuário autenticado pode inserir somente como ele mesmo
drop policy if exists "Morador comenta" on public.comentarios;
create policy "Morador comenta" on public.comentarios
  for insert with check (auth.uid() = autor_id);

-- DELETE: autor pode apagar o próprio comentário
drop policy if exists "Autor apaga comentario" on public.comentarios;
create policy "Autor apaga comentario" on public.comentarios
  for delete using (auth.uid() = autor_id);

-- UPDATE: apenas via função remover_comentario (moderação) — sem policy direta
-- (a função usa SECURITY DEFINER e já tem seu próprio check)
