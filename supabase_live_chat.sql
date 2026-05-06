-- Tabela de mensagens do chat da live
create table if not exists live_mensagens (
  id         uuid primary key default gen_random_uuid(),
  live_id    uuid references lives(id) on delete cascade not null,
  autor_id   uuid references auth.users(id) on delete cascade not null,
  texto      text not null check (char_length(texto) between 1 and 300),
  criado_em  timestamptz default now() not null
);

create index if not exists idx_live_mensagens_live_id on live_mensagens(live_id, criado_em);

-- RLS
alter table live_mensagens enable row level security;

create policy "chat_leitura_publica" on live_mensagens
  for select using (true);

create policy "chat_inserir_autenticado" on live_mensagens
  for insert with check (auth.uid() = autor_id);

-- Habilita Realtime
alter publication supabase_realtime add table live_mensagens;
