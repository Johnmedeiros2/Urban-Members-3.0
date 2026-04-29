-- ─── EMPRESA LINKS — Lojas e Posts vinculados a Empresa ─────────
-- Adiciona suporte opcional pra Loja pertencer a Empresa
-- e pra Post ser publicado em nome de Empresa.

-- 1. Loja pode pertencer a uma Empresa
alter table public.lojas
  add column if not exists empresa_id uuid references public.empresas(id) on delete set null;

create index if not exists idx_lojas_empresa on public.lojas(empresa_id);

-- 2. Post pode ser publicado como Empresa (em vez de morador individual)
alter table public.posts
  add column if not exists empresa_id uuid references public.empresas(id) on delete set null;

create index if not exists idx_posts_empresa on public.posts(empresa_id);

-- Trigger pra atualizar contadores da empresa quando loja é criada/apagada
create or replace function public.atualizar_contadores_empresa_loja()
returns trigger as $$
begin
  if TG_OP = 'INSERT' and NEW.empresa_id is not null then
    update public.empresas set total_produtos = total_produtos + coalesce((select count(*) from public.produtos where loja_id = NEW.id), 0)
      where id = NEW.empresa_id;
  elsif TG_OP = 'UPDATE' then
    if OLD.empresa_id is distinct from NEW.empresa_id then
      if OLD.empresa_id is not null then
        update public.empresas set total_produtos = greatest(0, total_produtos - coalesce((select count(*) from public.produtos where loja_id = OLD.id), 0))
          where id = OLD.empresa_id;
      end if;
      if NEW.empresa_id is not null then
        update public.empresas set total_produtos = total_produtos + coalesce((select count(*) from public.produtos where loja_id = NEW.id), 0)
          where id = NEW.empresa_id;
      end if;
    end if;
  elsif TG_OP = 'DELETE' and OLD.empresa_id is not null then
    update public.empresas set total_produtos = greatest(0, total_produtos - coalesce((select count(*) from public.produtos where loja_id = OLD.id), 0))
      where id = OLD.empresa_id;
  end if;
  return null;
end;
$$ language plpgsql;

drop trigger if exists trg_lojas_empresa on public.lojas;
create trigger trg_lojas_empresa
  after insert or update or delete on public.lojas
  for each row execute function public.atualizar_contadores_empresa_loja();
