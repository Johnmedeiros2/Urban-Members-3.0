-- ─── URBAN ACADEMY AI — Trilhas com avatar IA ──────────────────
-- Estrutura completa pra trilhas adaptativas inspiradas em BYJU's/Squirrel/Vedantu.

-- 1. Trilhas (matéria/curso completo)
create table if not exists public.trilhas (
  id uuid default gen_random_uuid() primary key,
  titulo text not null,
  descricao text,
  publico_alvo text,                              -- ex: 'ENEM', 'Concursos', 'Reforço Escolar'
  area text,                                      -- ex: 'matematica', 'portugues', 'historia'
  nivel text default 'basico',                    -- 'basico', 'intermediario', 'avancado'
  total_atomos int default 0,
  ativa boolean default true,
  capa_url text,
  criado_em timestamptz default now() not null
);

create index if not exists idx_trilhas_ativa on public.trilhas(ativa) where ativa = true;
create index if not exists idx_trilhas_area on public.trilhas(area);

-- 2. Átomos (unidade mínima de conhecimento, 5-10min cada)
create table if not exists public.atomos (
  id text primary key,                            -- ex: 'mat-frac-equiv'
  trilha_id uuid references public.trilhas(id) on delete cascade not null,
  titulo text not null,
  descricao text,
  ordem int default 0,
  nivel_bloom text,                               -- 'lembrar', 'entender', 'aplicar', 'analisar', 'avaliar', 'criar'
  tempo_estimado_min int default 5,
  video_url text,
  resumo_md text,                                 -- texto markdown da aula (cola de bolso)
  pre_requisitos text[] default '{}',             -- array de IDs de outros átomos
  ativo boolean default true,
  criado_em timestamptz default now() not null
);

create index if not exists idx_atomos_trilha on public.atomos(trilha_id, ordem);

-- 3. Questões de diagnóstico (avaliação inicial adaptativa)
create table if not exists public.questoes_diagnostico (
  id uuid default gen_random_uuid() primary key,
  atomo_id text references public.atomos(id) on delete cascade not null,
  enunciado text not null,
  alternativas jsonb not null,                    -- [{texto, correta:bool}, ...]
  dificuldade int not null check (dificuldade between 1 and 5),
  criado_em timestamptz default now() not null
);

create index if not exists idx_questoes_diag_atomo on public.questoes_diagnostico(atomo_id);

-- 4. Exercícios (após assistir aula)
create table if not exists public.exercicios (
  id uuid default gen_random_uuid() primary key,
  atomo_id text references public.atomos(id) on delete cascade not null,
  enunciado text not null,
  tipo text default 'multipla',                   -- 'multipla', 'input', 'verdadeiro_falso'
  alternativas jsonb,                             -- pra múltipla escolha
  gabarito text not null,                         -- resposta correta (texto ou índice)
  feedback_erro text,                             -- explicação se errar
  dificuldade int default 2 check (dificuldade between 1 and 5),
  criado_em timestamptz default now() not null
);

create index if not exists idx_exercicios_atomo on public.exercicios(atomo_id);

-- 5. Progresso do aluno em cada átomo
create table if not exists public.progresso_aluno_atomo (
  aluno_id uuid references public.perfis(id) on delete cascade not null,
  atomo_id text references public.atomos(id) on delete cascade not null,
  dominio_pct int default 0 check (dominio_pct between 0 and 100),
  tentativas_total int default 0,
  acertos_total int default 0,
  ultima_atualizacao timestamptz default now() not null,
  primary key (aluno_id, atomo_id)
);

create index if not exists idx_progresso_aluno on public.progresso_aluno_atomo(aluno_id);

-- 6. Tentativas individuais de exercícios (rastreio fino)
create table if not exists public.tentativas_exercicio (
  id uuid default gen_random_uuid() primary key,
  aluno_id uuid references public.perfis(id) on delete cascade not null,
  exercicio_id uuid references public.exercicios(id) on delete cascade not null,
  acertou boolean not null,
  resposta text,
  criado_em timestamptz default now() not null
);

create index if not exists idx_tent_aluno on public.tentativas_exercicio(aluno_id, criado_em desc);

-- 7. Diagnóstico do aluno (resultado da avaliação inicial por trilha)
create table if not exists public.diagnosticos (
  id uuid default gen_random_uuid() primary key,
  aluno_id uuid references public.perfis(id) on delete cascade not null,
  trilha_id uuid references public.trilhas(id) on delete cascade not null,
  pontos_fortes text[] default '{}',              -- IDs de átomos já dominados
  pontos_fracos text[] default '{}',              -- IDs de átomos que precisa estudar
  proximo_atomo text,                             -- recomendação inicial
  concluido boolean default false,
  criado_em timestamptz default now() not null,
  unique (aluno_id, trilha_id)
);

create index if not exists idx_diagnosticos_aluno on public.diagnosticos(aluno_id);

-- 8. Matrícula em trilha (assinante ativo)
create table if not exists public.trilha_alunos (
  trilha_id uuid references public.trilhas(id) on delete cascade not null,
  aluno_id uuid references public.perfis(id) on delete cascade not null,
  matriculado_em timestamptz default now() not null,
  primary key (trilha_id, aluno_id)
);

-- ─── RLS ─────────────────────────────────────────────────────────

alter table public.trilhas enable row level security;
alter table public.atomos enable row level security;
alter table public.questoes_diagnostico enable row level security;
alter table public.exercicios enable row level security;
alter table public.progresso_aluno_atomo enable row level security;
alter table public.tentativas_exercicio enable row level security;
alter table public.diagnosticos enable row level security;
alter table public.trilha_alunos enable row level security;

-- Trilhas e átomos são públicos pra leitura
create policy "Trilhas publicas leitura" on public.trilhas for select using (true);
create policy "Atomos publicos leitura" on public.atomos for select using (true);
create policy "Questoes diag publicas" on public.questoes_diagnostico for select using (true);
create policy "Exercicios publicos" on public.exercicios for select using (true);

-- Progresso é privado por aluno
create policy "Progresso proprio" on public.progresso_aluno_atomo
  for select using (auth.uid() = aluno_id);
create policy "Progresso proprio insert" on public.progresso_aluno_atomo
  for insert with check (auth.uid() = aluno_id);
create policy "Progresso proprio update" on public.progresso_aluno_atomo
  for update using (auth.uid() = aluno_id);

create policy "Tentativas proprias" on public.tentativas_exercicio
  for select using (auth.uid() = aluno_id);
create policy "Tentativas proprias insert" on public.tentativas_exercicio
  for insert with check (auth.uid() = aluno_id);

create policy "Diagnosticos proprios" on public.diagnosticos
  for select using (auth.uid() = aluno_id);
create policy "Diagnosticos proprios insert" on public.diagnosticos
  for insert with check (auth.uid() = aluno_id);
create policy "Diagnosticos proprios update" on public.diagnosticos
  for update using (auth.uid() = aluno_id);

create policy "Trilha alunos publico" on public.trilha_alunos for select using (true);
create policy "Trilha alunos insert proprio" on public.trilha_alunos
  for insert with check (auth.uid() = aluno_id);

-- Apenas admins (e Urban Staff via service role no backend) editam trilhas/átomos
-- Pra evitar bypass acidental, criação fica via API admin no momento.
