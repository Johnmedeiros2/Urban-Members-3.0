-- ─── PERFIL AUTOMÁTICO NO CADASTRO ──────────────────────────────
-- Toda vez que um morador se cadastra (insert em auth.users),
-- cria automaticamente a entrada correspondente em public.perfis.
-- Resolve o caso de morador novo que tenta usar uma feature antes
-- de fazer seu primeiro post (que era o único lugar com fallback).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfis (id, nome)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'nome_completo',
      new.raw_user_meta_data->>'full_name',
      split_part(coalesce(new.email, ''), '@', 1),
      'Morador'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── BACKFILL ─────────────────────────────────────────────────────
-- Cria perfis para moradores que ja se cadastraram mas nao tem perfil
-- (caso da Melissa e qualquer outro afetado).
insert into public.perfis (id, nome)
select
  u.id,
  coalesce(
    u.raw_user_meta_data->>'nome_completo',
    u.raw_user_meta_data->>'full_name',
    split_part(coalesce(u.email, ''), '@', 1),
    'Morador'
  )
from auth.users u
left join public.perfis p on p.id = u.id
where p.id is null
on conflict (id) do nothing;
