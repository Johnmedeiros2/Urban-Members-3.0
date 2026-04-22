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
