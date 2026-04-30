-- ─── MODERAÇÃO — FASE 1: FUNDAÇÃO ────────────────────────────────
-- Cria a equipe de supervisão e a auditoria. Não toca em conteúdo
-- nem adiciona soft delete ainda — isso vem na Fase 2.
-- Idempotente: pode rodar múltiplas vezes sem erro.

-- ── Função: identifica o admin (você).
-- Hardcode pelo email cadastrado no auth.users.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1 from auth.users
    where id = auth.uid()
      and email = 'johnmedeiros30@gmail.com'
  );
$$;

-- ── Tabela: equipe de moderação.
-- Admin não precisa estar aqui — is_moderador() já o reconhece via is_admin().
create table if not exists public.moderadores (
  morador_id uuid primary key references public.perfis(id) on delete cascade,
  criado_em timestamptz default now() not null,
  criado_por uuid references public.perfis(id) on delete set null
);

create index if not exists idx_moderadores_criado on public.moderadores(criado_em desc);

alter table public.moderadores enable row level security;

drop policy if exists "Moderadores publicos" on public.moderadores;
create policy "Moderadores publicos" on public.moderadores
  for select using (true);

drop policy if exists "Admin adiciona moderador" on public.moderadores;
create policy "Admin adiciona moderador" on public.moderadores
  for insert with check (public.is_admin());

drop policy if exists "Admin remove moderador" on public.moderadores;
create policy "Admin remove moderador" on public.moderadores
  for delete using (public.is_admin());

-- ── Função: identifica moderador (admin é moderador automaticamente).
create or replace function public.is_moderador()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin() or exists (
    select 1 from public.moderadores
    where morador_id = auth.uid()
  );
$$;

-- ── Tabela: histórico de ações de moderação.
-- Transparência (qualquer um pode ler) + auditoria (não dá pra editar).
create table if not exists public.acoes_moderacao (
  id uuid default gen_random_uuid() primary key,
  moderador_id uuid references public.perfis(id) on delete set null,
  tipo_alvo text not null check (tipo_alvo in (
    'post','curso','comentario','aula','material','story','avaliacao'
  )),
  alvo_id uuid not null,
  motivo text not null check (length(motivo) >= 10),
  criado_em timestamptz default now() not null
);

create index if not exists idx_acoes_alvo on public.acoes_moderacao(tipo_alvo, alvo_id);
create index if not exists idx_acoes_criado on public.acoes_moderacao(criado_em desc);

alter table public.acoes_moderacao enable row level security;

drop policy if exists "Acoes leitura publica" on public.acoes_moderacao;
create policy "Acoes leitura publica" on public.acoes_moderacao
  for select using (true);

drop policy if exists "Moderador registra acao" on public.acoes_moderacao;
create policy "Moderador registra acao" on public.acoes_moderacao
  for insert with check (
    auth.uid() = moderador_id and public.is_moderador()
  );

-- Sem policy de UPDATE/DELETE: histórico é imutável.
