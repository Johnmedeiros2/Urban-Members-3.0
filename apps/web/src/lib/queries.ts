import { createClient } from "./supabase";

export interface PostReal {
  id: string;
  autor_id: string;
  bairro_id: string;
  conteudo: string;
  total_curtidas: number;
  total_comentarios: number;
  criado_em: string;
  foto_url: string | null;
  video_url: string | null;
  autor?: { nome: string; cidade: string | null; urban_score: number; foto_url: string | null } | null;
}

// ── POSTS ───────────────────────────────────────────────────────────

export async function buscarPosts(limite = 20, tag?: string | null): Promise<PostReal[]> {
  const supabase = createClient();

  // 1. Busca posts (filtra por hashtag se fornecida)
  let query = supabase
    .from("posts")
    .select("*")
    .order("criado_em", { ascending: false })
    .limit(limite);
  if (tag) query = query.ilike("conteudo", `%#${tag}%`);
  const { data: posts, error } = await query;

  if (error) { console.error("buscarPosts:", error); return []; }
  if (!posts || posts.length === 0) return [];

  // 2. Busca autores dos posts em uma query separada
  const autorIds = [...new Set(posts.map((p: { autor_id: string }) => p.autor_id))];
  const { data: perfis } = await supabase
    .from("perfis")
    .select("id, nome, cidade, urban_score, foto_url")
    .in("id", autorIds);

  const perfisMap = new Map((perfis ?? []).map((p: { id: string; nome: string; cidade: string | null; urban_score: number; foto_url: string | null }) => [p.id, p]));

  return posts.map((p: PostReal) => ({
    ...p,
    autor: perfisMap.get(p.autor_id) ?? null,
  }));
}

export async function criarPost(conteudo: string, bairro_id = "negocios", foto?: File | null, video?: File | null) {
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
    await supabase
      .from("perfis")
      .insert({
        id: user.id,
        nome: user.user_metadata?.nome_completo ?? user.email?.split("@")[0] ?? "Morador",
      });
  }

  // Upload da foto se houver
  let foto_url: string | null = null;
  if (foto) {
    const ext = foto.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("posts")
      .upload(path, foto, { cacheControl: "3600" });
    if (uploadError) throw new Error(uploadError.message);
    const { data: { publicUrl } } = supabase.storage.from("posts").getPublicUrl(path);
    foto_url = publicUrl;
  }

  // Upload do vídeo se houver
  let video_url: string | null = null;
  if (video) {
    const ext = video.name.split(".").pop() ?? "mp4";
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("videos")
      .upload(path, video, { cacheControl: "3600", contentType: video.type });
    if (uploadError) throw new Error(`Vídeo: ${uploadError.message}`);
    const { data: { publicUrl } } = supabase.storage.from("videos").getPublicUrl(path);
    video_url = publicUrl;
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({ autor_id: user.id, bairro_id, conteudo, foto_url, video_url })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function buscarPulses(limite = 20): Promise<PostReal[]> {
  const supabase = createClient();
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .not("video_url", "is", null)
    .order("criado_em", { ascending: false })
    .limit(limite);
  if (error || !posts || posts.length === 0) return [];

  const autorIds = [...new Set(posts.map((p: { autor_id: string }) => p.autor_id))];
  const { data: perfis } = await supabase
    .from("perfis")
    .select("id, nome, cidade, urban_score, foto_url")
    .in("id", autorIds);
  const map = new Map((perfis ?? []).map((p: { id: string; nome: string; cidade: string | null; urban_score: number; foto_url: string | null }) => [p.id, p]));
  return posts.map((p: PostReal) => ({ ...p, autor: map.get(p.autor_id) ?? null }));
}

export async function deletarPost(post_id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  // Busca a foto antes para poder deletar do storage
  const { data: post } = await supabase
    .from("posts")
    .select("foto_url, autor_id")
    .eq("id", post_id)
    .single();

  if (!post) throw new Error("Post não encontrado");
  if (post.autor_id !== user.id) throw new Error("Você só pode deletar seus próprios posts");

  // Deleta a foto do storage se houver
  if (post.foto_url) {
    const url = new URL(post.foto_url);
    const pathParts = url.pathname.split("/posts/");
    if (pathParts.length > 1) {
      await supabase.storage.from("posts").remove([pathParts[1]]);
    }
  }

  const { error } = await supabase.from("posts").delete().eq("id", post_id);
  if (error) throw new Error(error.message);
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

// ── MERCADO PAGO ────────────────────────────────────────────────────

export async function iniciarPagamento(params: {
  vendedor_id: string;
  valor: number;
  descricao: string;
  tipo: "produto" | "curso" | "pay";
  item_id?: string;
}): Promise<{ init_point: string; transacao_id: string }> {
  const resp = await fetch("/api/mercadopago/preference", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error || "Erro ao iniciar pagamento");
  return { init_point: data.init_point, transacao_id: data.transacao_id };
}

// ── CUPONS ──────────────────────────────────────────────────────────

export interface Cupom {
  id: string;
  codigo: string;
  afiliado_id: string;
  desconto_percentual: number;
  max_usos: number;
  usos_atuais: number;
  ativo: boolean;
  expira_em: string | null;
  criado_em: string;
}

export async function criarCupom(codigo: string, desconto_percentual: number, max_usos = 100): Promise<Cupom> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");
  const cod = codigo.trim().toUpperCase();
  if (!/^[A-Z0-9_-]{3,24}$/.test(cod)) throw new Error("Código inválido (3-24 letras/números)");
  if (desconto_percentual < 1 || desconto_percentual > 50) throw new Error("Desconto entre 1 e 50");

  const { data, error } = await supabase
    .from("cupons")
    .insert({ codigo: cod, afiliado_id: user.id, desconto_percentual, max_usos })
    .select()
    .single();
  if (error) {
    if (error.message.includes("duplicate") || error.code === "23505") throw new Error("Esse código já existe");
    throw new Error(error.message);
  }
  return data as Cupom;
}

export async function meusCupons(): Promise<Cupom[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("cupons")
    .select("*")
    .eq("afiliado_id", user.id)
    .order("criado_em", { ascending: false });
  return (data ?? []) as Cupom[];
}

export async function validarCupom(codigo: string): Promise<Cupom | null> {
  const supabase = createClient();
  const cod = codigo.trim().toUpperCase();
  if (!cod) return null;
  const { data } = await supabase
    .from("cupons")
    .select("*")
    .eq("codigo", cod)
    .eq("ativo", true)
    .maybeSingle();
  if (!data) return null;
  const cupom = data as Cupom;
  if (cupom.usos_atuais >= cupom.max_usos) return null;
  if (cupom.expira_em && new Date(cupom.expira_em) < new Date()) return null;
  return cupom;
}

export async function togglarCupom(id: string, ativo: boolean) {
  const supabase = createClient();
  const { error } = await supabase.from("cupons").update({ ativo }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deletarCupom(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("cupons").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ── AVALIAÇÕES ──────────────────────────────────────────────────────

export interface Avaliacao {
  id: string;
  produto_id: string | null;
  curso_id: string | null;
  autor_id: string;
  estrelas: number;
  comentario: string | null;
  criado_em: string;
  autor?: { nome: string; foto_url: string | null } | null;
}

export interface MediaAvaliacao {
  media: number;
  total: number;
}

export async function buscarAvaliacoes(produto_id?: string, curso_id?: string): Promise<Avaliacao[]> {
  const supabase = createClient();
  let query = supabase.from("avaliacoes").select("*").order("criado_em", { ascending: false });
  if (produto_id) query = query.eq("produto_id", produto_id);
  if (curso_id) query = query.eq("curso_id", curso_id);
  const { data, error } = await query;
  if (error) { console.error("buscarAvaliacoes:", error); return []; }
  if (!data || data.length === 0) return [];

  const autorIds = [...new Set(data.map((a: { autor_id: string }) => a.autor_id))];
  const { data: perfis } = await supabase
    .from("perfis")
    .select("id, nome, foto_url")
    .in("id", autorIds);
  const map = new Map((perfis ?? []).map((p: { id: string; nome: string; foto_url: string | null }) => [p.id, p]));
  return data.map((a: Avaliacao) => ({ ...a, autor: map.get(a.autor_id) ?? null }));
}

export async function mediaAvaliacao(produto_id?: string, curso_id?: string): Promise<MediaAvaliacao> {
  const supabase = createClient();
  let query = supabase.from("avaliacoes").select("estrelas");
  if (produto_id) query = query.eq("produto_id", produto_id);
  if (curso_id) query = query.eq("curso_id", curso_id);
  const { data } = await query;
  if (!data || data.length === 0) return { media: 0, total: 0 };
  const soma = data.reduce((acc: number, a: { estrelas: number }) => acc + a.estrelas, 0);
  return { media: soma / data.length, total: data.length };
}

export async function criarAvaliacao(params: { produto_id?: string; curso_id?: string; estrelas: number; comentario?: string }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");
  if (params.estrelas < 1 || params.estrelas > 5) throw new Error("Avaliação inválida");
  if (!params.produto_id && !params.curso_id) throw new Error("Produto ou curso obrigatório");

  const { data, error } = await supabase
    .from("avaliacoes")
    .insert({
      produto_id: params.produto_id ?? null,
      curso_id: params.curso_id ?? null,
      autor_id: user.id,
      estrelas: params.estrelas,
      comentario: params.comentario?.trim() || null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deletarAvaliacao(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("avaliacoes").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ── COMENTÁRIOS ─────────────────────────────────────────────────────

export interface Comentario {
  id: string;
  post_id: string;
  autor_id: string;
  conteudo: string;
  criado_em: string;
  autor?: { nome: string; foto_url: string | null } | null;
}

export async function buscarComentarios(post_id: string): Promise<Comentario[]> {
  const supabase = createClient();
  const { data: comentarios, error } = await supabase
    .from("comentarios")
    .select("*")
    .eq("post_id", post_id)
    .order("criado_em", { ascending: true });
  if (error) { console.error("buscarComentarios:", error); return []; }
  if (!comentarios || comentarios.length === 0) return [];

  const autorIds = [...new Set(comentarios.map((c: { autor_id: string }) => c.autor_id))];
  const { data: perfis } = await supabase
    .from("perfis")
    .select("id, nome, foto_url")
    .in("id", autorIds);
  const map = new Map((perfis ?? []).map((p: { id: string; nome: string; foto_url: string | null }) => [p.id, p]));

  return comentarios.map((c: Comentario) => ({ ...c, autor: map.get(c.autor_id) ?? null }));
}

export async function criarComentario(post_id: string, conteudo: string): Promise<Comentario> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");
  if (!conteudo.trim()) throw new Error("Comentário vazio");

  const { data, error } = await supabase
    .from("comentarios")
    .insert({ post_id, autor_id: user.id, conteudo: conteudo.trim() })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Comentario;
}

export async function deletarComentario(comentario_id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("comentarios").delete().eq("id", comentario_id);
  if (error) throw new Error(error.message);
}

// ── BUSCA GLOBAL ────────────────────────────────────────────────────

export interface ResultadoBuscaMorador {
  tipo: "morador";
  id: string;
  nome: string;
  cidade: string | null;
  foto_url: string | null;
  urban_score: number;
}

export interface ResultadoBuscaProduto {
  tipo: "produto";
  id: string;
  nome: string;
  preco: number;
  categoria: string;
}

export interface ResultadoBuscaCurso {
  tipo: "curso";
  id: string;
  titulo: string;
  nivel: string;
  preco: number;
}

export interface ResultadosBusca {
  moradores: ResultadoBuscaMorador[];
  produtos: ResultadoBuscaProduto[];
  cursos: ResultadoBuscaCurso[];
}

export async function buscarGlobal(termo: string): Promise<ResultadosBusca> {
  if (!termo.trim() || termo.trim().length < 2) {
    return { moradores: [], produtos: [], cursos: [] };
  }
  const supabase = createClient();
  const q = `%${termo.trim()}%`;
  const [m, p, c] = await Promise.all([
    supabase.from("perfis").select("id, nome, cidade, foto_url, urban_score").ilike("nome", q).limit(5),
    supabase.from("produtos").select("id, nome, preco, categoria").ilike("nome", q).limit(5),
    supabase.from("cursos").select("id, titulo, nivel, preco").ilike("titulo", q).limit(5),
  ]);
  return {
    moradores: (m.data ?? []).map((r) => ({ ...r, tipo: "morador" as const })),
    produtos: (p.data ?? []).map((r) => ({ ...r, tipo: "produto" as const })),
    cursos: (c.data ?? []).map((r) => ({ ...r, tipo: "curso" as const })),
  };
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

export async function produtosEmAlta(limite = 6): Promise<Produto[]> {
  const supabase = createClient();
  const { data: produtos } = await supabase
    .from("produtos")
    .select("*, loja:lojas(nome, dono_id)")
    .eq("disponivel", true)
    .gt("total_vendas", 0)
    .order("total_vendas", { ascending: false })
    .limit(limite);
  if (!produtos) return [];

  const donoIds = produtos.map((p: Produto) => p.loja?.dono_id).filter(Boolean) as string[];
  if (donoIds.length === 0) return produtos as Produto[];
  const { data: perfis } = await supabase.from("perfis").select("id, nome, cidade, urban_score").in("id", donoIds);
  const map = new Map((perfis ?? []).map((p: { id: string; nome: string; cidade: string | null; urban_score: number }) => [p.id, p]));
  return produtos.map((p: Produto) => ({ ...p, loja: p.loja ? { ...p.loja, dono: map.get(p.loja.dono_id) ?? null } : null }));
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

export async function minhasCompras(): Promise<Transacao[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("transacoes")
    .select("*")
    .eq("comprador_id", user.id)
    .order("criado_em", { ascending: false })
    .limit(100);
  if (!data) return [];

  const ids = [...new Set(data.map((t: Transacao) => t.vendedor_id))];
  const { data: perfis } = await supabase
    .from("perfis")
    .select("id, nome")
    .in("id", ids);
  const perfisMap = new Map((perfis ?? []).map((p: { id: string; nome: string }) => [p.id, p]));

  return data.map((t: Transacao) => ({
    ...t,
    vendedor: perfisMap.get(t.vendedor_id) ?? null,
  }));
}

export async function criarTransacao(
  vendedor_id: string,
  valor: number,
  descricao: string,
  cupomCodigo?: string | null
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");
  if (user.id === vendedor_id) throw new Error("Não é possível pagar para si mesmo");

  let cupom_id: string | null = null;
  let desconto_aplicado = 0;
  let valorFinal = valor;

  if (cupomCodigo) {
    const cupom = await validarCupom(cupomCodigo);
    if (!cupom) throw new Error("Cupom inválido ou expirado");
    desconto_aplicado = Number((valor * (cupom.desconto_percentual / 100)).toFixed(2));
    valorFinal = Number((valor - desconto_aplicado).toFixed(2));
    cupom_id = cupom.id;
  }

  const { data, error } = await supabase
    .from("transacoes")
    .insert({
      comprador_id: user.id,
      vendedor_id,
      valor: valorFinal,
      descricao,
      status: "concluida",
      cupom_id,
      desconto_aplicado,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  // Incrementa uso do cupom (não atômico, mas aceitável em MVP)
  if (cupom_id) {
    const { data: cuponAtual } = await supabase
      .from("cupons")
      .select("usos_atuais")
      .eq("id", cupom_id)
      .single();
    if (cuponAtual) {
      await supabase
        .from("cupons")
        .update({ usos_atuais: (cuponAtual.usos_atuais ?? 0) + 1 })
        .eq("id", cupom_id);
    }
  }

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
