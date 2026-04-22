import { createClient } from "./supabase";

export interface PostReal {
  id: string;
  autor_id: string;
  bairro_id: string;
  conteudo: string;
  total_curtidas: number;
  total_comentarios: number;
  criado_em: string;
  autor?: { nome: string; cidade: string | null; urban_score: number } | null;
}

// ── POSTS ───────────────────────────────────────────────────────────

export async function buscarPosts(limite = 20): Promise<PostReal[]> {
  const supabase = createClient();

  // 1. Busca posts
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .order("criado_em", { ascending: false })
    .limit(limite);

  if (error) { console.error("buscarPosts:", error); return []; }
  if (!posts || posts.length === 0) return [];

  // 2. Busca autores dos posts em uma query separada
  const autorIds = [...new Set(posts.map((p: { autor_id: string }) => p.autor_id))];
  const { data: perfis } = await supabase
    .from("perfis")
    .select("id, nome, cidade, urban_score")
    .in("id", autorIds);

  const perfisMap = new Map((perfis ?? []).map((p: { id: string; nome: string; cidade: string | null; urban_score: number }) => [p.id, p]));

  return posts.map((p: PostReal) => ({
    ...p,
    autor: perfisMap.get(p.autor_id) ?? null,
  }));
}

export async function criarPost(conteudo: string, bairro_id = "negocios") {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado. Faça login novamente.");

  // Garante que o perfil existe antes de postar
  const { data: perfil } = await supabase
    .from("perfis")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!perfil) {
    // Cria perfil se não existir (usuários antigos antes do trigger)
    await supabase
      .from("perfis")
      .insert({
        id: user.id,
        nome: user.user_metadata?.nome_completo ?? user.email?.split("@")[0] ?? "Morador",
      });
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({ autor_id: user.id, bairro_id, conteudo })
    .select()
    .single();

  if (error) {
    console.error("criarPost:", error);
    throw new Error(error.message);
  }
  return data;
}

// ── CURTIDAS ────────────────────────────────────────────────────────

export async function curtirPost(post_id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");
  const { error } = await supabase
    .from("curtidas")
    .insert({ post_id, morador_id: user.id });
  if (error && !error.message.includes("duplicate")) throw error;
}

export async function descurtirPost(post_id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");
  const { error } = await supabase
    .from("curtidas")
    .delete()
    .eq("post_id", post_id)
    .eq("morador_id", user.id);
  if (error) throw error;
}

export async function minhasCurtidas(post_ids: string[]): Promise<Set<string>> {
  if (post_ids.length === 0) return new Set();
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Set();
  const { data } = await supabase
    .from("curtidas")
    .select("post_id")
    .eq("morador_id", user.id)
    .in("post_id", post_ids);
  return new Set((data ?? []).map((r: { post_id: string }) => r.post_id));
}

// ── NOTIFICAÇÕES ────────────────────────────────────────────────────

export async function buscarNotificacoes() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("notificacoes")
    .select("*, originador:perfis!originador_id(nome)")
    .eq("destinatario_id", user.id)
    .order("criado_em", { ascending: false })
    .limit(30);
  return data ?? [];
}

export async function marcarTodasLidas() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("notificacoes")
    .update({ lida: true })
    .eq("destinatario_id", user.id)
    .eq("lida", false);
}

// ── ADMIN ───────────────────────────────────────────────────────────

export async function estatisticasAdmin() {
  const supabase = createClient();
  const [perfis, posts, notif, conexoes] = await Promise.all([
    supabase.from("perfis").select("*", { count: "exact", head: true }),
    supabase.from("posts").select("*", { count: "exact", head: true }),
    supabase.from("notificacoes").select("*", { count: "exact", head: true }),
    supabase.from("conexoes").select("*", { count: "exact", head: true }),
  ]);
  return {
    total_moradores: perfis.count ?? 0,
    total_posts:    posts.count ?? 0,
    total_notif:    notif.count ?? 0,
    total_conexoes: conexoes.count ?? 0,
  };
}

export async function buscarMoradores() {
  const supabase = createClient();
  const { data } = await supabase
    .from("perfis")
    .select("*")
    .order("criado_em", { ascending: false })
    .limit(50);
  return data ?? [];
}

// ── LOJAS E PRODUTOS ────────────────────────────────────────────────

export interface Produto {
  id: string;
  loja_id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  categoria: string;
  tag: string | null;
  total_vendas: number;
  disponivel: boolean;
  criado_em: string;
  loja?: {
    nome: string;
    dono_id: string;
    dono?: { nome: string; cidade: string | null; urban_score: number } | null;
  } | null;
}

export async function buscarProdutos(limite = 20): Promise<Produto[]> {
  const supabase = createClient();
  const { data: produtos, error } = await supabase
    .from("produtos")
    .select("*, loja:lojas(nome, dono_id)")
    .eq("disponivel", true)
    .order("criado_em", { ascending: false })
    .limit(limite);
  if (error || !produtos) { console.error(error); return []; }

  // Busca donos
  const donoIds = produtos
    .map((p: Produto) => p.loja?.dono_id)
    .filter(Boolean) as string[];
  if (donoIds.length === 0) return produtos as Produto[];

  const { data: perfis } = await supabase
    .from("perfis")
    .select("id, nome, cidade, urban_score")
    .in("id", donoIds);

  const perfisMap = new Map(
    (perfis ?? []).map((p: { id: string; nome: string; cidade: string | null; urban_score: number }) => [p.id, p])
  );

  return produtos.map((p: Produto) => ({
    ...p,
    loja: p.loja ? { ...p.loja, dono: perfisMap.get(p.loja.dono_id) ?? null } : null,
  }));
}

export async function buscarMinhaLoja() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("lojas").select("*").eq("dono_id", user.id).maybeSingle();
  return data;
}

export async function criarLoja(nome: string, descricao?: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");
  const { data, error } = await supabase
    .from("lojas")
    .insert({ dono_id: user.id, nome, descricao })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function criarProduto(loja_id: string, nome: string, preco: number, descricao: string, categoria: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("produtos")
    .insert({ loja_id, nome, preco, descricao, categoria })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function buscarLojas(limite = 10) {
  const supabase = createClient();
  const { data } = await supabase
    .from("lojas")
    .select("*")
    .order("total_vendas", { ascending: false })
    .limit(limite);
  if (!data) return [];

  const donoIds = data.map((l: { dono_id: string }) => l.dono_id);
  const { data: perfis } = await supabase
    .from("perfis")
    .select("id, nome, cidade, urban_score")
    .in("id", donoIds);
  const perfisMap = new Map(
    (perfis ?? []).map((p: { id: string; nome: string; cidade: string | null; urban_score: number }) => [p.id, p])
  );

  return data.map((l: { dono_id: string }) => ({ ...l, dono: perfisMap.get(l.dono_id) ?? null }));
}

// ── CURSOS ──────────────────────────────────────────────────────────

export interface Curso {
  id: string;
  instrutor_id: string;
  bairro_id: string;
  titulo: string;
  descricao: string | null;
  duracao_min: number;
  total_aulas: number;
  nivel: string;
  preco: number;
  total_alunos: number;
  ao_vivo: boolean;
  criado_em: string;
  instrutor?: { nome: string; cidade: string | null; urban_score: number } | null;
}

export async function buscarCursos(limite = 20): Promise<Curso[]> {
  const supabase = createClient();
  const { data: cursos, error } = await supabase
    .from("cursos")
    .select("*")
    .order("criado_em", { ascending: false })
    .limit(limite);
  if (error || !cursos) return [];

  const instrutorIds = [...new Set(cursos.map((c: Curso) => c.instrutor_id))];
  const { data: perfis } = await supabase
    .from("perfis")
    .select("id, nome, cidade, urban_score")
    .in("id", instrutorIds);

  const perfisMap = new Map(
    (perfis ?? []).map((p: { id: string; nome: string; cidade: string | null; urban_score: number }) => [p.id, p])
  );

  return cursos.map((c: Curso) => ({ ...c, instrutor: perfisMap.get(c.instrutor_id) ?? null }));
}

export async function criarCurso(titulo: string, descricao: string, nivel: string, preco: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");
  const { data, error } = await supabase
    .from("cursos")
    .insert({ instrutor_id: user.id, titulo, descricao, nivel, preco })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function matricularCurso(curso_id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");
  const { error } = await supabase
    .from("curso_alunos")
    .insert({ curso_id, morador_id: user.id });
  if (error && !error.message.includes("duplicate")) throw new Error(error.message);
}

// ── TRANSAÇÕES (Urban Pay) ──────────────────────────────────────────

export interface Transacao {
  id: string;
  comprador_id: string;
  vendedor_id: string;
  produto_id: string | null;
  curso_id: string | null;
  valor: number;
  taxa_urban: number;
  valor_liquido: number;
  descricao: string | null;
  status: string;
  criado_em: string;
  comprador?: { nome: string } | null;
  vendedor?: { nome: string } | null;
}

export async function minhasTransacoes(): Promise<Transacao[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("transacoes")
    .select("*")
    .or(`comprador_id.eq.${user.id},vendedor_id.eq.${user.id}`)
    .order("criado_em", { ascending: false })
    .limit(30);
  if (!data) return [];

  const ids = [...new Set(data.flatMap((t: Transacao) => [t.comprador_id, t.vendedor_id]))];
  const { data: perfis } = await supabase
    .from("perfis")
    .select("id, nome")
    .in("id", ids);
  const perfisMap = new Map((perfis ?? []).map((p: { id: string; nome: string }) => [p.id, p]));

  return data.map((t: Transacao) => ({
    ...t,
    comprador: perfisMap.get(t.comprador_id) ?? null,
    vendedor: perfisMap.get(t.vendedor_id) ?? null,
  }));
}

export async function criarTransacao(
  vendedor_id: string,
  valor: number,
  descricao: string
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");
  if (user.id === vendedor_id) throw new Error("Não é possível pagar para si mesmo");

  const { data, error } = await supabase
    .from("transacoes")
    .insert({ comprador_id: user.id, vendedor_id, valor, descricao, status: "concluida" })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function saldoAtual() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;
  const { data } = await supabase
    .from("transacoes")
    .select("valor, valor_liquido, comprador_id, vendedor_id, status")
    .or(`comprador_id.eq.${user.id},vendedor_id.eq.${user.id}`)
    .eq("status", "concluida");
  if (!data) return 0;
  let saldo = 0;
  for (const t of data) {
    if (t.vendedor_id === user.id) saldo += Number(t.valor_liquido);
    if (t.comprador_id === user.id) saldo -= Number(t.valor);
  }
  return saldo;
}

// ── ADMIN (estatísticas completas) ──────────────────────────────────

// ── INDICAÇÕES (AFILIADOS) ──────────────────────────────────────────

export async function vincularIndicador(indicador_id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  if (user.id === indicador_id) return; // não pode se auto-indicar

  // Só vincula se ainda não tem indicador (primeiro que convidar leva)
  await supabase
    .from("perfis")
    .update({ indicador_id })
    .eq("id", user.id)
    .is("indicador_id", null);
}

export interface Indicacao {
  id: string;
  nome: string;
  foto_url: string | null;
  cidade: string | null;
  criado_em: string;
  total_gerado: number;
  urban_score: number;
}

export async function minhasIndicacoes(): Promise<{
  pessoas: Indicacao[];
  total_comissao: number;
  total_pessoas: number;
  pessoas_compraram: number;
}> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { pessoas: [], total_comissao: 0, total_pessoas: 0, pessoas_compraram: 0 };

  // Pessoas que você indicou
  const { data: pessoas } = await supabase
    .from("perfis")
    .select("id, nome, foto_url, cidade, criado_em, urban_score")
    .eq("indicador_id", user.id)
    .order("criado_em", { ascending: false });

  if (!pessoas || pessoas.length === 0) {
    return { pessoas: [], total_comissao: 0, total_pessoas: 0, pessoas_compraram: 0 };
  }

  // Comissões que você ganhou de cada uma
  const { data: comissoes } = await supabase
    .from("transacoes")
    .select("comprador_id, comissao_indicador")
    .eq("indicador_id", user.id)
    .eq("status", "concluida");

  // Agrega total por pessoa
  const mapa = new Map<string, number>();
  let total_comissao = 0;
  const compradores = new Set<string>();
  for (const c of comissoes ?? []) {
    const valor = Number(c.comissao_indicador);
    mapa.set(c.comprador_id, (mapa.get(c.comprador_id) ?? 0) + valor);
    compradores.add(c.comprador_id);
    total_comissao += valor;
  }

  const enriquecidas: Indicacao[] = (pessoas as Array<{ id: string; nome: string; foto_url: string | null; cidade: string | null; criado_em: string; urban_score: number }>).map((p) => ({
    ...p,
    total_gerado: mapa.get(p.id) ?? 0,
  }));

  return {
    pessoas: enriquecidas,
    total_comissao,
    total_pessoas: pessoas.length,
    pessoas_compraram: compradores.size,
  };
}

export async function saldoComissoes() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;
  const { data } = await supabase
    .from("transacoes")
    .select("comissao_indicador")
    .eq("indicador_id", user.id)
    .eq("status", "concluida");
  return (data ?? []).reduce((s: number, t: { comissao_indicador: number }) => s + Number(t.comissao_indicador), 0);
}

// ── CONEXÕES ────────────────────────────────────────────────────────

export async function todosMoradores(busca = "") {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let query = supabase
    .from("perfis")
    .select("id, nome, cidade, estado, pais, urban_score, ocupacao, foto_url");
  if (user) query = query.neq("id", user.id);
  if (busca.trim()) {
    query = query.or(`nome.ilike.%${busca}%,cidade.ilike.%${busca}%`);
  }
  const { data } = await query.order("urban_score", { ascending: false }).limit(100);
  return data ?? [];
}

export async function minhasConexoesIds(): Promise<Set<string>> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Set();
  const { data } = await supabase
    .from("conexoes")
    .select("seguido_id")
    .eq("seguidor_id", user.id);
  return new Set((data ?? []).map((r: { seguido_id: string }) => r.seguido_id));
}

export async function conectarCom(morador_id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");
  if (user.id === morador_id) throw new Error("Você não pode conectar com si mesmo");
  const { error } = await supabase
    .from("conexoes")
    .insert({ seguidor_id: user.id, seguido_id: morador_id });
  if (error && !error.message.includes("duplicate")) throw new Error(error.message);
}

export async function desconectarDe(morador_id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");
  const { error } = await supabase
    .from("conexoes")
    .delete()
    .eq("seguidor_id", user.id)
    .eq("seguido_id", morador_id);
  if (error) throw new Error(error.message);
}

export async function buscarMorador(id: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("perfis")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data;
}

export async function contagemConexoes(morador_id: string) {
  const supabase = createClient();
  const [seguidores, seguindo] = await Promise.all([
    supabase.from("conexoes").select("*", { count: "exact", head: true }).eq("seguido_id", morador_id),
    supabase.from("conexoes").select("*", { count: "exact", head: true }).eq("seguidor_id", morador_id),
  ]);
  return { seguidores: seguidores.count ?? 0, seguindo: seguindo.count ?? 0 };
}

// ── UPLOAD DE FOTO DE PERFIL ────────────────────────────────────────

export async function uploadFotoPerfil(arquivo: File): Promise<string> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  const ext = arquivo.name.split(".").pop() ?? "jpg";
  const path = `${user.id}/perfil.${ext}`;

  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, arquivo, { upsert: true, cacheControl: "3600" });
  if (error) throw new Error(error.message);

  const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
  const foto_url = `${publicUrl}?t=${Date.now()}`;

  await supabase.from("perfis").update({ foto_url }).eq("id", user.id);
  return foto_url;
}

// ── MEU COMÉRCIO (perfil) ───────────────────────────────────────────

export async function meusProdutos() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { loja: null, produtos: [] };

  const { data: loja } = await supabase
    .from("lojas")
    .select("*")
    .eq("dono_id", user.id)
    .maybeSingle();

  if (!loja) return { loja: null, produtos: [] };

  const { data: produtos } = await supabase
    .from("produtos")
    .select("*")
    .eq("loja_id", loja.id)
    .order("total_vendas", { ascending: false });

  return { loja, produtos: produtos ?? [] };
}

export async function meusCursos() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("cursos")
    .select("*")
    .eq("instrutor_id", user.id)
    .order("total_alunos", { ascending: false });
  return data ?? [];
}

export async function minhasVendasResumo() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { total_recebido: 0, total_vendas: 0, ticket_medio: 0, taxa_paga: 0 };

  const { data } = await supabase
    .from("transacoes")
    .select("valor, valor_liquido, taxa_urban")
    .eq("vendedor_id", user.id)
    .eq("status", "concluida");

  if (!data || data.length === 0) return { total_recebido: 0, total_vendas: 0, ticket_medio: 0, taxa_paga: 0 };

  const total_recebido = data.reduce((s: number, t: { valor_liquido: number }) => s + Number(t.valor_liquido), 0);
  const taxa_paga = data.reduce((s: number, t: { taxa_urban: number }) => s + Number(t.taxa_urban), 0);
  const total_vendas = data.length;

  return {
    total_recebido,
    total_vendas,
    ticket_medio: total_recebido / total_vendas,
    taxa_paga,
  };
}

export async function estatisticasCompletas() {
  const supabase = createClient();
  const [
    perfis, posts, notif, conexoes,
    lojas, produtos, cursos, transacoes
  ] = await Promise.all([
    supabase.from("perfis").select("*", { count: "exact", head: true }),
    supabase.from("posts").select("*", { count: "exact", head: true }),
    supabase.from("notificacoes").select("*", { count: "exact", head: true }),
    supabase.from("conexoes").select("*", { count: "exact", head: true }),
    supabase.from("lojas").select("*", { count: "exact", head: true }),
    supabase.from("produtos").select("*", { count: "exact", head: true }),
    supabase.from("cursos").select("*", { count: "exact", head: true }),
    supabase.from("transacoes").select("*").eq("status", "concluida"),
  ]);

  const totalTaxa = (transacoes.data ?? []).reduce((s: number, t: { taxa_urban: number }) => s + Number(t.taxa_urban), 0);

  return {
    moradores: perfis.count ?? 0,
    lojistas:  lojas.count ?? 0,
    posts:     posts.count ?? 0,
    cursos:    cursos.count ?? 0,
    transacoes: transacoes.data?.length ?? 0,
    produtos:  produtos.count ?? 0,
    conexoes:  conexoes.count ?? 0,
    notif:     notif.count ?? 0,
    receita:   totalTaxa,
  };
}
