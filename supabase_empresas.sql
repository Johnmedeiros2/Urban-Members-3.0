-- ─── EMPRESAS — Pessoa Jurídica como entidade separada ─────────
-- Empresa pertence a um morador (dono), tem perfil próprio com CNPJ, segmento, etc.
-- Um morador pode ter várias empresas. Outros moradores podem seguir.

create table if not exists public.empresas (
  id uuid default gen_random_uuid() primary key,
  dono_id uuid references public.perfis(id) on delete cascade not null,
  nome_fantasia text not null,
  razao_social text,
  cnpj text,
  segmento text,
  descricao text,
  foto_url text,
  capa_url text,
  cidade text,
  estado text,
  pais text default 'Brasil',
  site text,
  email_contato text,
  telefone text,
  ativa boolean default true,
  total_seguidores int default 0,
  total_produtos int default 0,
  total_cursos int default 0,
  urban_score int default 10,
  criado_em timestamptz default now() not null
);

create index if not exists idx_empresas_dono on public.empresas(dono_id);
create index if not exists idx_empresas_segmento on public.empresas(segmento);
create index if not exists idx_empresas_ativa on public.empresas(ativa) where ativa = true;
create unique index if not exists idx_empresas_cnpj_unique on public.empresas(cnpj) where cnpj is not null;

-- Quem segue uma empresa
create table if not exists public.empresa_seguidores (
  empresa_id uuid references public.empresas(id) on delete cascade not null,
  morador_id uuid references public.perfis(id) on delete cascade not null,
  criado_em timestamptz default now() not null,
  primary key (empresa_id, morador_id)
);

create index if not exists idx_emp_seguidores_morador on public.empresa_seguidores(morador_id);

-- RLS
alter table public.empresas enable row level security;
alter table public.empresa_seguidores enable row level security;

create policy "Empresas publicas leitura" on public.empresas
  for select using (true);

create policy "Morador cria sua empresa" on public.empresas
  for insert with check (auth.uid() = dono_id);

create policy "Dono edita sua empresa" on public.empresas
  for update using (auth.uid() = dono_id);

create policy "Dono apaga sua empresa" on public.empresas
  for delete using (auth.uid() = dono_id);

create policy "Seguidores publicos leitura" on public.empresa_seguidores
  for select using (true);

create policy "Morador segue empresa" on public.empresa_seguidores
  for insert with check (auth.uid() = morador_id);

create policy "Morador deixa de seguir" on public.empresa_seguidores
  for delete using (auth.uid() = morador_id);

-- Trigger pra atualizar contador de seguidores
create or replace function public.atualizar_seguidores_empresa()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.empresas set total_seguidores = total_seguidores + 1 where id = NEW.empresa_id;
  elsif TG_OP = 'DELETE' then
    update public.empresas set total_seguidores = greatest(0, total_seguidores - 1) where id = OLD.empresa_id;
  end if;
  return null;
end;
$$ language plpgsql;

drop trigger if exists trg_seguidores_empresa on public.empresa_seguidores;
create trigger trg_seguidores_empresa
  after insert or delete on public.empresa_seguidores
  for each row execute function public.atualizar_seguidores_empresa();

-- ⚠️ Ação manual: criar bucket "empresas" no Supabase Storage
-- 1. Storage → New bucket → nome: empresas → Public ON → Create
-- (Pra logos e capas das empresas)
