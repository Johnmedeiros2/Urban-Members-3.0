import { createClient } from "./supabase";
import { track, EVENTS } from "./analytics";

export interface PostReal {
  id: string;
  autor_id: string;
  empresa_id: string | null;
  bairro_id: string;
  conteudo: string;
  total_curtidas: number;
  total_comentarios: number;
  criado_em: string;
  foto_url: string | null;
  video_url: string | null;
  apagado_em: string | null;
  apagado_por: string | null;
  motivo_remocao: string | null;
  autor?: { nome: string; cidade: string | null; urban_score: number; foto_url: string | null } | null;
  empresa?: { id: string; nome_fantasia: string; foto_url: string | null; segmento: string | null } | null;
  removido_por?: { nome: string } | null;
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

  // 3. Busca empresas dos posts vinculados
  const empresaIds = [...new Set(posts.map((p: { empresa_id: string | null }) => p.empresa_id).filter(Boolean) as string[])];
  let empresasMap = new Map<string, { id: string; nome_fantasia: string; foto_url: string | null; segmento: string | null }>();
  if (empresaIds.length > 0) {
    const { data: empresas } = await supabase
      .from("empresas")
      .select("id, nome_fantasia, foto_url, segmento")
      .in("id", empresaIds);
    empresasMap = new Map((empresas ?? []).map((e: { id: string; nome_fantasia: string; foto_url: string | null; segmento: string | null }) => [e.id, e]));
  }

  // 4. Busca nome dos moderadores que removeram posts
  const removidoPorIds = [...new Set(posts.map((p: { apagado_por: string | null }) => p.apagado_por).filter(Boolean) as string[])];
  let removedoresMap = new Map<string, { nome: string }>();
  if (removidoPorIds.length > 0) {
    const { data: removedores } = await supabase
      .from("perfis")
      .select("id, nome")
      .in("id", removidoPorIds);
    removedoresMap = new Map((removedores ?? []).map((p: { id: string; nome: string }) => [p.id, { nome: p.nome }]));
  }

  return posts.map((p: PostReal) => ({
    ...p,
    autor: perfisMap.get(p.autor_id) ?? null,
    empresa: p.empresa_id ? (empresasMap.get(p.empresa_id) ?? null) : null,
    removido_por: p.apagado_por ? (removedoresMap.get(p.apagado_por) ?? null) : null,
  }));
}

export async function buscarPostsPersonalizado(limite = 30): Promise<PostReal[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return buscarPosts(limite);

  const [meusBairros, minhasConex, posts] = await Promise.all([
    supabase.from("bairro_membros").select("bairro_id").eq("morador_id", user.id),
    supabase.from("conexoes").select("seguindo_id").eq("seguidor_id", user.id),
    supabase.from("posts").select("*").order("criado_em", { ascending: false }).limit(limite * 2),
  ]);

  if (!posts.data || posts.data.length === 0) return [];

  const bairrosSet = new Set((meusBairros.data ?? []).map((b: { bairro_id: string }) => b.bairro_id));
  const conexSet = new Set((minhasConex.data ?? []).map((c: { seguindo_id: string }) => c.seguindo_id));

  const agora = Date.now();
  const scored = posts.data.map((p: PostReal) => {
    let score = 0;
    if (bairrosSet.has(p.bairro_id)) score += 5;
    if (conexSet.has(p.autor_id)) score += 3;
    score += Math.min(Number(p.total_curtidas) * 0.5, 10);
    // Decay por dia
    const dias = (agora - new Date(p.criado_em).getTime()) / (1000 * 60 * 60 * 24);
    score -= dias * 0.3;
    return { ...p, _score: score };
  });
  scored.sort((a: PostReal & { _score: number }, b: PostReal & { _score: number }) => b._score - a._score);

  const top = scored.slice(0, limite);
  const autorIds = [...new Set(top.map((p: PostReal) => p.autor_id))];
  const { data: perfis } = await supabase
    .from("perfis")
    .select("id, nome, cidade, urban_score, foto_url")
    .in("id", autorIds);
  const map = new Map((perfis ?? []).map((p: { id: string; nome: string; cidade: string | null; urban_score: number; foto_url: string | null }) => [p.id, p]));

  const empresaIds = [...new Set(top.map((p: PostReal) => p.empresa_id).filter(Boolean) as string[])];
  let empresasMap = new Map<string, { id: string; nome_fantasia: string; foto_url: string | null; segmento: string | null }>();
  if (empresaIds.length > 0) {
    const { data: empresas } = await supabase
      .from("empresas")
      .select("id, nome_fantasia, foto_url, segmento")
      .in("id", empresaIds);
    empresasMap = new Map((empresas ?? []).map((e: { id: string; nome_fantasia: string; foto_url: string | null; segmento: string | null }) => [e.id, e]));
  }

  const removidoPorIds = [...new Set(top.map((p: PostReal) => p.apagado_por).filter(Boolean) as string[])];
  let removedoresMap = new Map<string, { nome: string }>();
  if (removidoPorIds.length > 0) {
    const { data: removedores } = await supabase
      .from("perfis")
      .select("id, nome")
      .in("id", removidoPorIds);
    removedoresMap = new Map((removedores ?? []).map((p: { id: string; nome: string }) => [p.id, { nome: p.nome }]));
  }

  return top.map((p: PostReal) => ({
    ...p,
    autor: map.get(p.autor_id) ?? null,
    empresa: p.empresa_id ? (empresasMap.get(p.empresa_id) ?? null) : null,
    removido_por: p.apagado_por ? (removedoresMap.get(p.apagado_por) ?? null) : null,
  }));
}

export async function criarPost(conteudo: string, bairro_id = "negocios", foto?: File | null, video?: File | null, empresa_id?: string | null) {
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
    .insert({ autor_id: user.id, bairro_id, conteudo, foto_url, video_url, empresa_id: empresa_id ?? null })
    .select()
    .single();

  if (error) throw new Error(error.message);
  track(EVENTS.POST_CREATED, {
    bairro_id,
    tem_foto: !!foto_url,
    tem_video: !!video_url,
    tamanho_texto: conteudo.length,
    eh_empresa: !!empresa_id,
  });
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

// ── URBAN ACADEMY AI — Trilhas adaptativas ───────────────────────────

export interface Trilha {
  id: string;
  titulo: string;
  descricao: string | null;
  publico_alvo: string | null;
  area: string | null;
  nivel: string;
  total_atomos: number;
  ativa: boolean;
  capa_url: string | null;
  criado_em: string;
}

export interface Atomo {
  id: string;
  trilha_id: string;
  titulo: string;
  descricao: string | null;
  ordem: number;
  nivel_bloom: string | null;
  tempo_estimado_min: number;
  video_url: string | null;
  resumo_md: string | null;
  pre_requisitos: string[];
  ativo: boolean;
  dominio_pct?: number;       // populado quando carrega pra um aluno específico
}

export interface Exercicio {
  id: string;
  atomo_id: string;
  enunciado: string;
  tipo: "multipla" | "input" | "verdadeiro_falso";
  alternativas: { texto: string; correta: boolean }[] | null;
  gabarito: string;
  feedback_erro: string | null;
  dificuldade: number;
}

export interface QuestaoDiagnostico {
  id: string;
  atomo_id: string;
  enunciado: string;
  alternativas: { texto: string; correta: boolean }[];
  dificuldade: number;
}

export async function buscarTrilhas(): Promise<Trilha[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("trilhas")
    .select("*")
    .eq("ativa", true)
    .order("criado_em", { ascending: false });
  return (data ?? []) as Trilha[];
}

export async function buscarTrilha(id: string): Promise<Trilha | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("trilhas")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data as Trilha | null;
}

export async function buscarAtomos(trilha_id: string): Promise<Atomo[]> {
  const supabase = createClient();
  const { data: atomos } = await supabase
    .from("atomos")
    .select("*")
    .eq("trilha_id", trilha_id)
    .eq("ativo", true)
    .order("ordem", { ascending: true });

  if (!atomos) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return atomos as Atomo[];

  const ids = atomos.map((a: { id: string }) => a.id);
  const { data: progresso } = await supabase
    .from("progresso_aluno_atomo")
    .select("atomo_id, dominio_pct")
    .eq("aluno_id", user.id)
    .in("atomo_id", ids);

  const map = new Map((progresso ?? []).map((p: { atomo_id: string; dominio_pct: number }) => [p.atomo_id, p.dominio_pct]));
  return (atomos as Atomo[]).map((a) => ({ ...a, dominio_pct: map.get(a.id) ?? 0 }));
}

export async function buscarAtomo(atomo_id: string): Promise<Atomo | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("atomos")
    .select("*")
    .eq("id", atomo_id)
    .maybeSingle();
  if (!data) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return data as Atomo;

  const { data: progresso } = await supabase
    .from("progresso_aluno_atomo")
    .select("dominio_pct")
    .eq("aluno_id", user.id)
    .eq("atomo_id", atomo_id)
    .maybeSingle();

  return { ...(data as Atomo), dominio_pct: (progresso as { dominio_pct: number } | null)?.dominio_pct ?? 0 };
}

export async function buscarExercicios(atomo_id: string): Promise<Exercicio[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("exercicios")
    .select("*")
    .eq("atomo_id", atomo_id)
    .order("dificuldade", { ascending: true });
  return (data ?? []) as Exercicio[];
}

export async function buscarQuestoesDiagnostico(trilha_id: string, limite = 15): Promise<QuestaoDiagnostico[]> {
  const supabase = createClient();
  // pega questões dos átomos da trilha
  const { data: atomos } = await supabase
    .from("atomos")
    .select("id")
    .eq("trilha_id", trilha_id);
  if (!atomos || atomos.length === 0) return [];
  const ids = atomos.map((a: { id: string }) => a.id);

  const { data } = await supabase
    .from("questoes_diagnostico")
    .select("*")
    .in("atomo_id", ids)
    .limit(limite);
  return (data ?? []) as QuestaoDiagnostico[];
}

export async function matricularTrilha(trilha_id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");
  const { error } = await supabase
    .from("trilha_alunos")
    .insert({ trilha_id, aluno_id: user.id });
  if (error && !error.message.includes("duplicate")) throw new Error(error.message);
}

export async function registrarTentativa(exercicio_id: string, acertou: boolean, resposta: string, atomo_id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  // Salva tentativa
  await supabase.from("tentativas_exercicio").insert({
    aluno_id: user.id,
    exercicio_id,
    acertou,
    resposta,
  });

  // Atualiza progresso (lógica simples: cada acerto sobe 20%, cada erro -10%, capa em [0, 100])
  const { data: existente } = await supabase
    .from("progresso_aluno_atomo")
    .select("*")
    .eq("aluno_id", user.id)
    .eq("atomo_id", atomo_id)
    .maybeSingle();

  if (existente) {
    const e = existente as { dominio_pct: number; tentativas_total: number; acertos_total: number };
    const novoPct = Math.max(0, Math.min(100, e.dominio_pct + (acertou ? 20 : -10)));
    await supabase
      .from("progresso_aluno_atomo")
      .update({
        dominio_pct: novoPct,
        tentativas_total: e.tentativas_total + 1,
        acertos_total: e.acertos_total + (acertou ? 1 : 0),
        ultima_atualizacao: new Date().toISOString(),
      })
      .eq("aluno_id", user.id)
      .eq("atomo_id", atomo_id);
  } else {
    await supabase.from("progresso_aluno_atomo").insert({
      aluno_id: user.id,
      atomo_id,
      dominio_pct: acertou ? 20 : 0,
      tentativas_total: 1,
      acertos_total: acertou ? 1 : 0,
    });
  }
}

export async function progressoTrilha(trilha_id: string): Promise<{ totalAtomos: number; dominados: number; em_progresso: number; percentual: number }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { totalAtomos: 0, dominados: 0, em_progresso: 0, percentual: 0 };

  const { data: atomos } = await supabase
    .from("atomos")
    .select("id")
    .eq("trilha_id", trilha_id)
    .eq("ativo", true);

  if (!atomos || atomos.length === 0) return { totalAtomos: 0, dominados: 0, em_progresso: 0, percentual: 0 };
  const ids = atomos.map((a: { id: string }) => a.id);

  const { data: progresso } = await supabase
    .from("progresso_aluno_atomo")
    .select("dominio_pct")
    .eq("aluno_id", user.id)
    .in("atomo_id", ids);

  const dominados = (progresso ?? []).filter((p: { dominio_pct: number }) => p.dominio_pct >= 80).length;
  const em_progresso = (progresso ?? []).filter((p: { dominio_pct: number }) => p.dominio_pct > 0 && p.dominio_pct < 80).length;
  const percentual = Math.round((dominados / atomos.length) * 100);

  return { totalAtomos: atomos.length, dominados, em_progresso, percentual };
}

// ── AGENDA (Calendário do morador) ──────────────────────────────────

export interface EventoAgenda {
  id: string;
  tipo: "live" | "aula" | "curso-novo";
  titulo: string;
  data: string; // ISO
  ao_vivo_agora?: boolean;
  autor_nome?: string;
  autor_id?: string;
  link?: string;
  href: string;
  descricao?: string;
}

export async function agendaDoMorador(escopo: "meus" | "todos" = "todos"): Promise<EventoAgenda[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const agora = new Date();
  const limiteFuturo = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 dias pra frente
  const limitePassado = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 dias pra trás

  // 1. Lives agendadas ou ao vivo agora
  const { data: lives } = await supabase
    .from("lives")
    .select("id, titulo, descricao, agendado_para, link, ao_vivo, autor_id")
    .or(`agendado_para.gte.${limitePassado.toISOString()},ao_vivo.eq.true`)
    .lte("agendado_para", limiteFuturo.toISOString());

  // 2. Aulas ao vivo de cursos que o morador está matriculado (ou todos se escopo = todos)
  let cursosMatriculado: string[] = [];
  if (user) {
    const { data: matriculas } = await supabase
      .from("curso_alunos")
      .select("curso_id")
      .eq("morador_id", user.id);
    cursosMatriculado = (matriculas ?? []).map((m: { curso_id: string }) => m.curso_id);
  }

  let aulasQuery = supabase
    .from("aulas")
    .select("id, titulo, descricao, agendado_para, link_ao_vivo, curso_id")
    .eq("ao_vivo", true)
    .gte("agendado_para", limitePassado.toISOString())
    .lte("agendado_para", limiteFuturo.toISOString());
  if (escopo === "meus" && cursosMatriculado.length > 0) {
    aulasQuery = aulasQuery.in("curso_id", cursosMatriculado);
  } else if (escopo === "meus") {
    aulasQuery = aulasQuery.eq("curso_id", "00000000-0000-0000-0000-000000000000"); // nada
  }
  const { data: aulas } = await aulasQuery;

  // 3. Cursos novos criados recentemente (últimos 7 dias)
  const { data: cursosNovos } = await supabase
    .from("cursos")
    .select("id, titulo, criado_em, instrutor_id")
    .gte("criado_em", limitePassado.toISOString())
    .order("criado_em", { ascending: false })
    .limit(10);

  // Nomes dos autores
  const autorIds = [
    ...(lives ?? []).map((l: { autor_id: string }) => l.autor_id),
    ...(cursosNovos ?? []).map((c: { instrutor_id: string }) => c.instrutor_id),
  ];
  const idsUnicos = [...new Set(autorIds)];
  const { data: perfis } = idsUnicos.length > 0
    ? await supabase.from("perfis").select("id, nome").in("id", idsUnicos)
    : { data: [] };
  const nomeMap = new Map((perfis ?? []).map((p: { id: string; nome: string }) => [p.id, p.nome]));

  // Títulos de cursos pra aulas
  const cursoIds = (aulas ?? []).map((a: { curso_id: string }) => a.curso_id);
  const { data: cursosInfo } = cursoIds.length > 0
    ? await supabase.from("cursos").select("id, titulo").in("id", cursoIds)
    : { data: [] };
  const cursoNomeMap = new Map((cursosInfo ?? []).map((c: { id: string; titulo: string }) => [c.id, c.titulo]));

  const eventos: EventoAgenda[] = [];

  (lives ?? []).forEach((l: { id: string; titulo: string; descricao: string | null; agendado_para: string | null; link: string | null; ao_vivo: boolean; autor_id: string }) => {
    if (escopo === "meus" && user && l.autor_id !== user.id) return;
    const data = l.ao_vivo && !l.agendado_para ? agora.toISOString() : l.agendado_para;
    if (!data) return;
    eventos.push({
      id: `live-${l.id}`,
      tipo: "live",
      titulo: l.titulo,
      descricao: l.descricao ?? undefined,
      data,
      ao_vivo_agora: l.ao_vivo,
      autor_nome: nomeMap.get(l.autor_id) ?? undefined,
      autor_id: l.autor_id,
      link: l.link ?? undefined,
      href: `/live/${l.id}`,
    });
  });

  (aulas ?? []).forEach((a: { id: string; titulo: string; descricao: string | null; agendado_para: string | null; link_ao_vivo: string | null; curso_id: string }) => {
    if (!a.agendado_para) return;
    const cursoTit = cursoNomeMap.get(a.curso_id) ?? "Curso";
    eventos.push({
      id: `aula-${a.id}`,
      tipo: "aula",
      titulo: `${a.titulo} · ${cursoTit}`,
      descricao: a.descricao ?? undefined,
      data: a.agendado_para,
      link: a.link_ao_vivo ?? undefined,
      href: `/curso/${a.curso_id}?aula=${a.id}`,
    });
  });

  (cursosNovos ?? []).forEach((c: { id: string; titulo: string; criado_em: string; instrutor_id: string }) => {
    eventos.push({
      id: `curso-${c.id}`,
      tipo: "curso-novo",
      titulo: c.titulo,
      data: c.criado_em,
      autor_nome: nomeMap.get(c.instrutor_id) ?? undefined,
      autor_id: c.instrutor_id,
      href: `/curso/${c.id}`,
    });
  });

  eventos.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
  return eventos;
}

// ── LIVES ───────────────────────────────────────────────────────────

export interface Live {
  id: string;
  autor_id: string;
  titulo: string;
  descricao: string | null;
  agendado_para: string | null;
  link: string | null;
  ao_vivo: boolean;
  bairro_id: string | null;
  criado_em: string;
  tipo: "externa" | "nativa";
  nome_sala: string | null;
  autor?: { nome: string; cidade: string | null; foto_url: string | null; urban_score: number } | null;
}

export async function buscarLives(): Promise<Live[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("lives")
    .select("*")
    .order("ao_vivo", { ascending: false })
    .order("agendado_para", { ascending: true });
  if (!data || data.length === 0) return [];

  const autorIds = [...new Set(data.map((l: { autor_id: string }) => l.autor_id))];
  const { data: perfis } = await supabase
    .from("perfis")
    .select("id, nome, cidade, foto_url, urban_score")
    .in("id", autorIds);
  const map = new Map((perfis ?? []).map((p: { id: string; nome: string; cidade: string | null; foto_url: string | null; urban_score: number }) => [p.id, p]));
  return (data as Live[]).map((l) => ({ ...l, autor: map.get(l.autor_id) ?? null }));
}

export async function criarLive(params: {
  titulo: string;
  descricao?: string;
  agendado_para?: string | null;
  link?: string;
  bairro_id?: string;
  tipo?: "externa" | "nativa";
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");
  if (!params.titulo.trim()) throw new Error("Título obrigatório");

  const tipo = params.tipo ?? "externa";
  if (tipo === "externa" && !params.link?.trim()) {
    throw new Error("Link da transmissão é obrigatório para lives externas");
  }
  const nome_sala = tipo === "nativa"
    ? `urban-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
    : null;

  const { data, error } = await supabase
    .from("lives")
    .insert({
      autor_id: user.id,
      titulo: params.titulo.trim(),
      descricao: params.descricao ?? null,
      agendado_para: params.agendado_para ?? null,
      link: tipo === "externa" ? (params.link?.trim() || null) : null,
      bairro_id: params.bairro_id ?? null,
      tipo,
      nome_sala,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function atualizarLiveStatus(id: string, ao_vivo: boolean) {
  const supabase = createClient();
  const { error } = await supabase.from("lives").update({ ao_vivo }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deletarLive(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("lives").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export interface ItemLive {
  id: string;
  live_id: string;
  produto_id: string | null;
  curso_id: string | null;
  destaque: boolean;
  ordem: number;
  produto?: { id: string; nome: string; preco: number; categoria: string; loja?: { dono_id: string } } | null;
  curso?: { id: string; titulo: string; preco: number; instrutor_id: string } | null;
}

export async function buscarItensLive(live_id: string): Promise<ItemLive[]> {
  const supabase = createClient();
  const { data: vinculos } = await supabase
    .from("live_produtos")
    .select("*")
    .eq("live_id", live_id)
    .order("destaque", { ascending: false })
    .order("ordem", { ascending: true });
  if (!vinculos || vinculos.length === 0) return [];

  const produtoIds = vinculos.filter((v: { produto_id: string | null }) => v.produto_id).map((v: { produto_id: string }) => v.produto_id);
  const cursoIds = vinculos.filter((v: { curso_id: string | null }) => v.curso_id).map((v: { curso_id: string }) => v.curso_id);

  const [prodRes, cursoRes] = await Promise.all([
    produtoIds.length > 0
      ? supabase.from("produtos").select("id, nome, preco, categoria, loja:lojas(dono_id)").in("id", produtoIds)
      : Promise.resolve({ data: [] }),
    cursoIds.length > 0
      ? supabase.from("cursos").select("id, titulo, preco, instrutor_id").in("id", cursoIds)
      : Promise.resolve({ data: [] }),
  ]);
  const prodMap = new Map((prodRes.data ?? []).map((p: { id: string }) => [p.id, p]));
  const cursoMap = new Map((cursoRes.data ?? []).map((c: { id: string }) => [c.id, c]));

  return (vinculos as ItemLive[]).map((v) => ({
    ...v,
    produto: v.produto_id ? prodMap.get(v.produto_id) as ItemLive["produto"] : null,
    curso: v.curso_id ? cursoMap.get(v.curso_id) as ItemLive["curso"] : null,
  }));
}

export async function vincularItemLive(params: { live_id: string; produto_id?: string; curso_id?: string; destaque?: boolean }) {
  const supabase = createClient();
  if (!params.produto_id && !params.curso_id) throw new Error("Vincule um produto ou curso");
  const { error } = await supabase.from("live_produtos").insert({
    live_id: params.live_id,
    produto_id: params.produto_id ?? null,
    curso_id: params.curso_id ?? null,
    destaque: params.destaque ?? false,
  });
  if (error) throw new Error(error.message);
}

export async function desvincularItemLive(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("live_produtos").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// Variante de criarTransacao que registra origem_live_id
export async function comprarDaLive(vendedor_id: string, valor: number, descricao: string, live_id: string, cupomCodigo?: string | null) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");
  if (user.id === vendedor_id) throw new Error("Não é possível pagar para si mesmo");

  let cupom_id: string | null = null;
  let desconto_aplicado = 0;
  let valorFinal = valor;
  if (cupomCodigo) {
    const cupom = await validarCupom(cupomCodigo);
    if (!cupom) throw new Error("Cupom inválido");
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
      origem_live_id: live_id,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  track(EVENTS.PURCHASE_COMPLETED, {
    valor: valorFinal,
    valor_original: valor,
    descricao,
    vendedor_id,
    via: "live",
    live_id,
    tem_cupom: !!cupom_id,
    desconto_aplicado,
  });
  return data;
}

// Resumo de conversão de uma live
export async function resumoConversaoLive(live_id: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("transacoes")
    .select("valor, valor_liquido")
    .eq("origem_live_id", live_id)
    .eq("status", "concluida");
  if (!data || data.length === 0) return { total_vendas: 0, total_valor: 0, total_liquido: 0 };
  const total_valor = data.reduce((s: number, t: { valor: number }) => s + Number(t.valor), 0);
  const total_liquido = data.reduce((s: number, t: { valor_liquido: number }) => s + Number(t.valor_liquido), 0);
  return { total_vendas: data.length, total_valor, total_liquido };
}

// ── STORIES 24H ─────────────────────────────────────────────────────

export interface Story {
  id: string;
  autor_id: string;
  foto_url: string | null;
  video_url: string | null;
  visualizacao_unica: boolean;
  criado_em: string;
  expira_em: string;
  autor?: { nome: string; foto_url: string | null } | null;
}

export interface StoriesPorAutor {
  autor_id: string;
  autor: { nome: string; foto_url: string | null };
  stories: Story[];
}

export async function buscarStoriesAtivos(): Promise<StoriesPorAutor[]> {
  const supabase = createClient();
  const agora = new Date().toISOString();
  const { data: { user } } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("stories")
    .select("*")
    .gt("expira_em", agora)
    .order("criado_em", { ascending: true });
  if (!data || data.length === 0) return [];

  // Filtra stories de visualização única que o morador atual já viu
  let jaVistos: Set<string> = new Set();
  if (user) {
    const { data: vistos } = await supabase
      .from("story_visualizacoes")
      .select("story_id")
      .eq("morador_id", user.id);
    jaVistos = new Set((vistos ?? []).map((v: { story_id: string }) => v.story_id));
  }

  const storiesFiltrados = (data as Story[]).filter((s) => {
    // Autor sempre vê o próprio, mesmo se já visualizou
    if (user && s.autor_id === user.id) return true;
    if (s.visualizacao_unica && jaVistos.has(s.id)) return false;
    return true;
  });

  if (storiesFiltrados.length === 0) return [];

  const autorIds = [...new Set(storiesFiltrados.map((s) => s.autor_id))];
  const { data: perfis } = await supabase
    .from("perfis")
    .select("id, nome, foto_url")
    .in("id", autorIds);
  const perfilMap = new Map((perfis ?? []).map((p: { id: string; nome: string; foto_url: string | null }) => [p.id, p]));

  // Agrupa por autor
  const grupos = new Map<string, StoriesPorAutor>();
  for (const s of storiesFiltrados) {
    const autor = perfilMap.get(s.autor_id);
    if (!autor) continue;
    if (!grupos.has(s.autor_id)) {
      grupos.set(s.autor_id, { autor_id: s.autor_id, autor, stories: [] });
    }
    grupos.get(s.autor_id)!.stories.push(s);
  }
  return Array.from(grupos.values());
}

export async function registrarVisualizacaoStory(story_id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("story_visualizacoes")
    .upsert({ story_id, morador_id: user.id }, { onConflict: "story_id,morador_id" });
}

export async function criarStory(foto?: File | null, video?: File | null, horas: 12 | 24 = 24, visualizacao_unica = false) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");
  if (!foto && !video) throw new Error("Envie uma foto ou vídeo");

  let foto_url: string | null = null;
  let video_url: string | null = null;

  if (foto) {
    const ext = foto.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/story-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("posts").upload(path, foto, { cacheControl: "3600" });
    if (error) throw new Error(error.message);
    foto_url = supabase.storage.from("posts").getPublicUrl(path).data.publicUrl;
  }

  if (video) {
    const ext = video.name.split(".").pop() ?? "mp4";
    const path = `${user.id}/story-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("videos").upload(path, video, { cacheControl: "3600", contentType: video.type });
    if (error) throw new Error(`Vídeo: ${error.message}`);
    video_url = supabase.storage.from("videos").getPublicUrl(path).data.publicUrl;
  }

  const expira_em = new Date(Date.now() + horas * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("stories")
    .insert({ autor_id: user.id, foto_url, video_url, expira_em, visualizacao_unica })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deletarStory(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("stories").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ── WISHLIST ────────────────────────────────────────────────────────

export interface ItemWishlist {
  id: string;
  morador_id: string;
  produto_id: string | null;
  curso_id: string | null;
  criado_em: string;
  produto?: { id: string; nome: string; preco: number; categoria: string; loja?: { dono_id: string; dono?: { nome: string } | null } | null } | null;
  curso?: { id: string; titulo: string; preco: number; nivel: string; instrutor_id: string; instrutor?: { nome: string } | null } | null;
}

export async function minhaWishlist(): Promise<ItemWishlist[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("wishlist")
    .select("*")
    .eq("morador_id", user.id)
    .order("criado_em", { ascending: false });
  if (!data || data.length === 0) return [];

  const produtoIds = data.filter((w: { produto_id: string | null }) => w.produto_id).map((w: { produto_id: string }) => w.produto_id);
  const cursoIds = data.filter((w: { curso_id: string | null }) => w.curso_id).map((w: { curso_id: string }) => w.curso_id);

  const [prodRes, cursoRes] = await Promise.all([
    produtoIds.length > 0
      ? supabase.from("produtos").select("id, nome, preco, categoria, loja:lojas(dono_id)").in("id", produtoIds)
      : Promise.resolve({ data: [] }),
    cursoIds.length > 0
      ? supabase.from("cursos").select("id, titulo, preco, nivel, instrutor_id").in("id", cursoIds)
      : Promise.resolve({ data: [] }),
  ]);

  // Busca donos/instrutores para nome (Supabase retorna joins como array OU objeto)
  type ProdRow = { id: string; nome: string; preco: number; categoria: string; loja: { dono_id: string }[] | { dono_id: string } | null };
  type CursoRow = { id: string; titulo: string; preco: number; nivel: string; instrutor_id: string };
  const prodRows = (prodRes.data ?? []) as ProdRow[];
  const cursoRows = (cursoRes.data ?? []) as CursoRow[];

  const donoIds = prodRows.map((p) => {
    const l = Array.isArray(p.loja) ? p.loja[0] : p.loja;
    return l?.dono_id;
  }).filter(Boolean) as string[];
  const instIds = cursoRows.map((c) => c.instrutor_id);
  const perfilIds = [...new Set([...donoIds, ...instIds])];

  const { data: perfis } = perfilIds.length > 0
    ? await supabase.from("perfis").select("id, nome").in("id", perfilIds)
    : { data: [] };
  const pMap = new Map((perfis ?? []).map((p: { id: string; nome: string }) => [p.id, p]));

  const prodMap = new Map(prodRows.map((p) => {
    const lojaObj = Array.isArray(p.loja) ? p.loja[0] : p.loja;
    return [p.id, { ...p, loja: lojaObj ? { ...lojaObj, dono: pMap.get(lojaObj.dono_id) ?? null } : null }];
  }));
  const cursoMap = new Map(cursoRows.map((c) => [c.id, { ...c, instrutor: pMap.get(c.instrutor_id) ?? null }]));

  return (data as ItemWishlist[]).map((w) => ({
    ...w,
    produto: w.produto_id ? prodMap.get(w.produto_id) as ItemWishlist["produto"] : null,
    curso: w.curso_id ? cursoMap.get(w.curso_id) as ItemWishlist["curso"] : null,
  }));
}

export async function idsDaWishlist(): Promise<{ produtos: Set<string>; cursos: Set<string> }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { produtos: new Set(), cursos: new Set() };
  const { data } = await supabase
    .from("wishlist")
    .select("produto_id, curso_id")
    .eq("morador_id", user.id);
  return {
    produtos: new Set((data ?? []).filter((w: { produto_id: string | null }) => w.produto_id).map((w: { produto_id: string }) => w.produto_id)),
    cursos:   new Set((data ?? []).filter((w: { curso_id: string | null }) => w.curso_id).map((w: { curso_id: string }) => w.curso_id)),
  };
}

export async function toggleWishlist(tipo: "produto" | "curso", itemId: string): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  const col = tipo === "produto" ? "produto_id" : "curso_id";
  const { data: existe } = await supabase
    .from("wishlist")
    .select("id")
    .eq("morador_id", user.id)
    .eq(col, itemId)
    .maybeSingle();

  if (existe) {
    await supabase.from("wishlist").delete().eq("id", (existe as { id: string }).id);
    return false;
  } else {
    const payload: Record<string, string> = { morador_id: user.id };
    payload[col] = itemId;
    await supabase.from("wishlist").insert(payload);
    return true;
  }
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
  foto_url: string | null;
  video_url: string | null;
  criado_em: string;
  apagado_em: string | null;
  apagado_por: string | null;
  motivo_remocao: string | null;
  autor?: { nome: string; foto_url: string | null } | null;
  removido_por?: { nome: string } | null;
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

  const removedoresMap = await buscarRemovedores(data.map((a: Avaliacao) => a.apagado_por));

  return data.map((a: Avaliacao) => ({
    ...a,
    autor: map.get(a.autor_id) ?? null,
    removido_por: a.apagado_por ? (removedoresMap.get(a.apagado_por) ?? null) : null,
  }));
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

export async function criarAvaliacao(params: { produto_id?: string; curso_id?: string; estrelas: number; comentario?: string; foto?: File | null; video?: File | null }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");
  if (params.estrelas < 1 || params.estrelas > 5) throw new Error("Avaliação inválida");
  if (!params.produto_id && !params.curso_id) throw new Error("Produto ou curso obrigatório");

  let foto_url: string | null = null;
  let video_url: string | null = null;

  if (params.foto) {
    const ext = params.foto.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/review-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("posts").upload(path, params.foto, { cacheControl: "3600" });
    if (error) throw new Error(error.message);
    foto_url = supabase.storage.from("posts").getPublicUrl(path).data.publicUrl;
  }
  if (params.video) {
    const ext = params.video.name.split(".").pop() ?? "mp4";
    const path = `${user.id}/review-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("videos").upload(path, params.video, { cacheControl: "3600", contentType: params.video.type });
    if (error) throw new Error(`Vídeo: ${error.message}`);
    video_url = supabase.storage.from("videos").getPublicUrl(path).data.publicUrl;
  }

  const { data, error } = await supabase
    .from("avaliacoes")
    .insert({
      produto_id: params.produto_id ?? null,
      curso_id: params.curso_id ?? null,
      autor_id: user.id,
      estrelas: params.estrelas,
      comentario: params.comentario?.trim() || null,
      foto_url,
      video_url,
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
  apagado_em: string | null;
  apagado_por: string | null;
  motivo_remocao: string | null;
  autor?: { nome: string; foto_url: string | null } | null;
  removido_por?: { nome: string } | null;
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

  const removedoresMap = await buscarRemovedores(comentarios.map((c: Comentario) => c.apagado_por));

  return comentarios.map((c: Comentario) => ({
    ...c,
    autor: map.get(c.autor_id) ?? null,
    removido_por: c.apagado_por ? (removedoresMap.get(c.apagado_por) ?? null) : null,
  }));
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

export interface ResultadoBuscaAula {
  tipo: "aula";
  id: string;
  titulo: string;
  curso_id: string;
  curso_titulo: string;
}

export interface ResultadosBusca {
  moradores: ResultadoBuscaMorador[];
  produtos: ResultadoBuscaProduto[];
  cursos: ResultadoBuscaCurso[];
  aulas: ResultadoBuscaAula[];
}

export async function buscarGlobal(termo: string): Promise<ResultadosBusca> {
  if (!termo.trim() || termo.trim().length < 2) {
    return { moradores: [], produtos: [], cursos: [], aulas: [] };
  }
  const supabase = createClient();
  const q = `%${termo.trim()}%`;
  const [m, p, c, a] = await Promise.all([
    supabase.from("perfis").select("id, nome, cidade, foto_url, urban_score").ilike("nome", q).limit(5),
    supabase.from("produtos").select("id, nome, preco, categoria").ilike("nome", q).limit(5),
    supabase.from("cursos").select("id, titulo, nivel, preco").ilike("titulo", q).limit(5),
    supabase.from("aulas").select("id, titulo, curso_id, descricao, curso:cursos(titulo)").or(`titulo.ilike.${q},descricao.ilike.${q}`).limit(5),
  ]);
  return {
    moradores: (m.data ?? []).map((r) => ({ ...r, tipo: "morador" as const })),
    produtos: (p.data ?? []).map((r) => ({ ...r, tipo: "produto" as const })),
    cursos: (c.data ?? []).map((r) => ({ ...r, tipo: "curso" as const })),
    aulas: (a.data ?? []).map((r: { id: string; titulo: string; curso_id: string; curso: { titulo: string }[] | { titulo: string } | null }) => {
      const cursoObj = Array.isArray(r.curso) ? r.curso[0] : r.curso;
      return {
        tipo: "aula" as const,
        id: r.id,
        titulo: r.titulo,
        curso_id: r.curso_id,
        curso_titulo: cursoObj?.titulo ?? "",
      };
    }),
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

export async function criarLoja(nome: string, descricao?: string, empresa_id?: string | null) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");
  const { data, error } = await supabase
    .from("lojas")
    .insert({ dono_id: user.id, nome, descricao, empresa_id: empresa_id ?? null })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function lojasDaEmpresa(empresa_id: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("lojas")
    .select("*")
    .eq("empresa_id", empresa_id)
    .order("criado_em", { ascending: false });
  return data ?? [];
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
  apagado_em: string | null;
  apagado_por: string | null;
  motivo_remocao: string | null;
  instrutor?: { nome: string; cidade: string | null; urban_score: number } | null;
  removido_por?: { nome: string } | null;
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

  const removedoresMap = await buscarRemovedores(cursos.map((c: Curso) => c.apagado_por));

  return cursos.map((c: Curso) => ({
    ...c,
    instrutor: perfisMap.get(c.instrutor_id) ?? null,
    removido_por: c.apagado_por ? (removedoresMap.get(c.apagado_por) ?? null) : null,
  }));
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

export async function atualizarCurso(
  curso_id: string,
  campos: { titulo: string; descricao: string; nivel: string; preco: number },
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("cursos")
    .update(campos)
    .eq("id", curso_id);
  if (error) throw new Error(error.message);
}

export async function deletarCurso(curso_id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("cursos")
    .delete()
    .eq("id", curso_id);
  if (error) throw new Error(error.message);
}

// ── AULAS ───────────────────────────────────────────────────────────

export interface Aula {
  id: string;
  curso_id: string;
  titulo: string;
  descricao: string | null;
  ordem: number;
  video_url: string | null;
  duracao_seg: number;
  ao_vivo: boolean;
  agendado_para: string | null;
  link_ao_vivo: string | null;
  criado_em: string;
  concluida?: boolean;
}

// ── MATERIAIS DO CURSO ──────────────────────────────────────────

export interface Material {
  id: string;
  curso_id: string;
  aula_id: string | null;
  titulo: string;
  descricao: string | null;
  arquivo_url: string;
  nome_arquivo: string;
  tipo: string | null;
  tamanho_bytes: number | null;
  criado_em: string;
}

function extensaoDoArquivo(nome: string): string {
  const parts = nome.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
}

function tipoDoArquivo(ext: string): string {
  const map: Record<string, string> = {
    pdf: "PDF",
    xlsx: "Excel", xls: "Excel", csv: "CSV",
    docx: "Word", doc: "Word",
    pptx: "PowerPoint", ppt: "PowerPoint",
    txt: "Texto",
    zip: "Zip",
  };
  return map[ext] ?? "Arquivo";
}

export async function buscarMateriais(curso_id: string): Promise<Material[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("materiais")
    .select("*")
    .eq("curso_id", curso_id)
    .order("criado_em", { ascending: true });
  return (data ?? []) as Material[];
}

export async function adicionarMaterial(params: {
  curso_id: string;
  aula_id?: string | null;
  titulo: string;
  descricao?: string;
  arquivo: File;
}): Promise<Material> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");
  if (!params.titulo.trim()) throw new Error("Título é obrigatório");
  if (!params.arquivo) throw new Error("Envie um arquivo");
  if (params.arquivo.size > 50 * 1024 * 1024) throw new Error("Arquivo muito grande (máx 50MB)");

  const ext = extensaoDoArquivo(params.arquivo.name);
  const path = `${user.id}/${params.curso_id}/${Date.now()}-${params.arquivo.name}`;

  const { error: uploadError } = await supabase.storage
    .from("materiais")
    .upload(path, params.arquivo, { cacheControl: "3600", contentType: params.arquivo.type });
  if (uploadError) throw new Error(uploadError.message);

  const { data: { publicUrl } } = supabase.storage.from("materiais").getPublicUrl(path);

  const { data, error } = await supabase
    .from("materiais")
    .insert({
      curso_id: params.curso_id,
      aula_id: params.aula_id ?? null,
      titulo: params.titulo.trim(),
      descricao: params.descricao?.trim() || null,
      arquivo_url: publicUrl,
      nome_arquivo: params.arquivo.name,
      tipo: tipoDoArquivo(ext),
      tamanho_bytes: params.arquivo.size,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Material;
}

export async function deletarMaterial(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("materiais").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function buscarAulas(curso_id: string): Promise<Aula[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("aulas")
    .select("*")
    .eq("curso_id", curso_id)
    .order("ordem", { ascending: true });
  if (!data) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return data as Aula[];

  const aulaIds = data.map((a: Aula) => a.id);
  const { data: progresso } = await supabase
    .from("aula_progresso")
    .select("aula_id, concluida")
    .in("aula_id", aulaIds)
    .eq("morador_id", user.id);
  const map = new Map((progresso ?? []).map((p: { aula_id: string; concluida: boolean }) => [p.aula_id, p.concluida]));
  return (data as Aula[]).map((a) => ({ ...a, concluida: map.get(a.id) ?? false }));
}

export async function criarAula(
  curso_id: string,
  titulo: string,
  params: { descricao?: string; video?: File | null; ao_vivo?: boolean; agendado_para?: string | null; link_ao_vivo?: string }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  // Determina próxima ordem
  const { data: existentes } = await supabase
    .from("aulas")
    .select("ordem")
    .eq("curso_id", curso_id)
    .order("ordem", { ascending: false })
    .limit(1);
  const proximaOrdem = ((existentes?.[0] as { ordem: number } | undefined)?.ordem ?? -1) + 1;

  let video_url: string | null = null;
  if (params.video) {
    const ext = params.video.name.split(".").pop() ?? "mp4";
    const path = `${user.id}/aula-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("videos").upload(path, params.video, { cacheControl: "3600", contentType: params.video.type });
    if (error) throw new Error(`Vídeo: ${error.message}`);
    video_url = supabase.storage.from("videos").getPublicUrl(path).data.publicUrl;
  }

  const { data, error } = await supabase
    .from("aulas")
    .insert({
      curso_id, titulo,
      descricao: params.descricao ?? null,
      ordem: proximaOrdem,
      video_url,
      ao_vivo: params.ao_vivo ?? false,
      agendado_para: params.agendado_para ?? null,
      link_ao_vivo: params.link_ao_vivo ?? null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function marcarAulaConcluida(aula_id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");
  await supabase
    .from("aula_progresso")
    .upsert({ aula_id, morador_id: user.id, concluida: true, atualizado_em: new Date().toISOString() }, { onConflict: "aula_id,morador_id" });
}

export async function deletarAula(aula_id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("aulas").delete().eq("id", aula_id);
  if (error) throw new Error(error.message);
}

export async function buscarCurso(curso_id: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("cursos")
    .select("*")
    .eq("id", curso_id)
    .maybeSingle();
  if (!data) return null;
  const curso = data as {
    id: string;
    instrutor_id: string;
    titulo: string;
    descricao: string | null;
    nivel: string;
    preco: number;
    total_alunos: number;
    apagado_em: string | null;
    apagado_por: string | null;
    motivo_remocao: string | null;
  };
  const { data: instrutor } = await supabase
    .from("perfis")
    .select("id, nome, cidade, urban_score, foto_url")
    .eq("id", curso.instrutor_id)
    .maybeSingle();
  let removido_por: { nome: string } | null = null;
  if (curso.apagado_por) {
    const { data: removedor } = await supabase
      .from("perfis").select("nome").eq("id", curso.apagado_por).maybeSingle();
    removido_por = removedor ? { nome: (removedor as { nome: string }).nome } : null;
  }
  return { ...curso, instrutor, removido_por };
}

export async function matricularCurso(curso_id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");
  const { error } = await supabase
    .from("curso_alunos")
    .insert({ curso_id, morador_id: user.id });
  if (error && !error.message.includes("duplicate")) throw new Error(error.message);
  if (!error) track(EVENTS.COURSE_ENROLLED, { curso_id });
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

  track(EVENTS.PURCHASE_COMPLETED, {
    valor: valorFinal,
    valor_original: valor,
    descricao,
    vendedor_id,
    via: "mercado",
    tem_cupom: !!cupom_id,
    desconto_aplicado,
  });

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

// ── EMPRESAS — Pessoa Jurídica ──────────────────────────────────────

export interface Empresa {
  id: string;
  dono_id: string;
  nome_fantasia: string;
  razao_social: string | null;
  cnpj: string | null;
  segmento: string | null;
  descricao: string | null;
  foto_url: string | null;
  capa_url: string | null;
  cidade: string | null;
  estado: string | null;
  pais: string | null;
  site: string | null;
  email_contato: string | null;
  telefone: string | null;
  ativa: boolean;
  total_seguidores: number;
  total_produtos: number;
  total_cursos: number;
  urban_score: number;
  criado_em: string;
  dono?: { id: string; nome: string; foto_url: string | null } | null;
}

export const SEGMENTOS_EMPRESA = [
  "Tecnologia",
  "Educação",
  "Comércio",
  "Serviços",
  "Saúde",
  "Alimentação",
  "Moda",
  "Beleza",
  "Construção",
  "Marketing",
  "Consultoria",
  "Arte e Cultura",
  "Esporte",
  "Outro",
];

export async function buscarEmpresas(termo = ""): Promise<Empresa[]> {
  const supabase = createClient();
  let query = supabase
    .from("empresas")
    .select("*")
    .eq("ativa", true);
  if (termo.trim()) {
    query = query.or(`nome_fantasia.ilike.%${termo}%,razao_social.ilike.%${termo}%,segmento.ilike.%${termo}%,descricao.ilike.%${termo}%`);
  }
  const { data } = await query.order("total_seguidores", { ascending: false }).limit(50);
  if (!data) return [];

  const donoIds = [...new Set(data.map((e: { dono_id: string }) => e.dono_id))];
  const { data: perfis } = await supabase
    .from("perfis")
    .select("id, nome, foto_url")
    .in("id", donoIds);
  const map = new Map((perfis ?? []).map((p: { id: string; nome: string; foto_url: string | null }) => [p.id, p]));
  return (data as Empresa[]).map((e) => ({ ...e, dono: map.get(e.dono_id) ?? null }));
}

export async function buscarEmpresa(id: string): Promise<Empresa | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("empresas")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  const empresa = data as Empresa;
  const { data: dono } = await supabase
    .from("perfis")
    .select("id, nome, foto_url")
    .eq("id", empresa.dono_id)
    .maybeSingle();
  return { ...empresa, dono: dono as { id: string; nome: string; foto_url: string | null } | null };
}

export async function minhasEmpresas(): Promise<Empresa[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("empresas")
    .select("*")
    .eq("dono_id", user.id)
    .order("criado_em", { ascending: false });
  return (data ?? []) as Empresa[];
}

export async function criarEmpresa(params: {
  nome_fantasia: string;
  razao_social?: string;
  cnpj?: string;
  segmento?: string;
  descricao?: string;
  cidade?: string;
  estado?: string;
  site?: string;
  email_contato?: string;
  telefone?: string;
  foto?: File | null;
}): Promise<Empresa> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");
  if (!params.nome_fantasia.trim()) throw new Error("Nome fantasia obrigatório");

  let foto_url: string | null = null;
  if (params.foto) {
    const ext = params.foto.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/logo-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("empresas").upload(path, params.foto, { cacheControl: "3600" });
    if (error) throw new Error(`Logo: ${error.message}`);
    foto_url = supabase.storage.from("empresas").getPublicUrl(path).data.publicUrl;
  }

  const { data, error } = await supabase
    .from("empresas")
    .insert({
      dono_id: user.id,
      nome_fantasia: params.nome_fantasia.trim(),
      razao_social: params.razao_social?.trim() || null,
      cnpj: params.cnpj?.trim() || null,
      segmento: params.segmento || null,
      descricao: params.descricao?.trim() || null,
      cidade: params.cidade?.trim() || null,
      estado: params.estado?.trim() || null,
      site: params.site?.trim() || null,
      email_contato: params.email_contato?.trim() || null,
      telefone: params.telefone?.trim() || null,
      foto_url,
    })
    .select()
    .single();
  if (error) {
    if (error.message.includes("idx_empresas_cnpj_unique") || error.code === "23505") {
      throw new Error("Esse CNPJ já está cadastrado");
    }
    throw new Error(error.message);
  }
  return data as Empresa;
}

export async function atualizarEmpresa(id: string, params: Partial<Empresa>) {
  const supabase = createClient();
  const { error } = await supabase.from("empresas").update(params).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deletarEmpresa(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("empresas").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function seguirEmpresa(empresa_id: string): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  const { data: existe } = await supabase
    .from("empresa_seguidores")
    .select("empresa_id")
    .eq("empresa_id", empresa_id)
    .eq("morador_id", user.id)
    .maybeSingle();

  if (existe) {
    await supabase
      .from("empresa_seguidores")
      .delete()
      .eq("empresa_id", empresa_id)
      .eq("morador_id", user.id);
    return false;
  } else {
    await supabase
      .from("empresa_seguidores")
      .insert({ empresa_id, morador_id: user.id });
    return true;
  }
}

export async function meusSeguindoEmpresas(): Promise<Set<string>> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Set();
  const { data } = await supabase
    .from("empresa_seguidores")
    .select("empresa_id")
    .eq("morador_id", user.id);
  return new Set((data ?? []).map((e: { empresa_id: string }) => e.empresa_id));
}

export interface BairroComContagem {
  id: string;
  label: string;
  descricao: string | null;
  total_membros: number;
}

export async function todosBairrosComContagem(busca = ""): Promise<BairroComContagem[]> {
  const supabase = createClient();
  let query = supabase
    .from("bairros")
    .select("id, label, descricao");
  if (busca.trim()) {
    query = query.or(`label.ilike.%${busca}%,descricao.ilike.%${busca}%`);
  }
  const { data: bairros } = await query;
  if (!bairros) return [];

  // Conta membros de cada bairro
  const ids = bairros.map((b: { id: string }) => b.id);
  const { data: membros } = await supabase
    .from("bairro_membros")
    .select("bairro_id")
    .in("bairro_id", ids);

  const contagem = new Map<string, number>();
  (membros ?? []).forEach((m: { bairro_id: string }) => {
    contagem.set(m.bairro_id, (contagem.get(m.bairro_id) ?? 0) + 1);
  });

  return (bairros as { id: string; label: string; descricao: string | null }[]).map((b) => ({
    ...b,
    total_membros: contagem.get(b.id) ?? 0,
  }));
}

export async function buscarLojasComBusca(termo = "") {
  const supabase = createClient();
  let query = supabase
    .from("lojas")
    .select("id, nome, descricao, total_vendas, dono_id");
  if (termo.trim()) {
    query = query.or(`nome.ilike.%${termo}%,descricao.ilike.%${termo}%`);
  }
  const { data } = await query.order("total_vendas", { ascending: false }).limit(50);
  if (!data) return [];

  const donoIds = data.map((l: { dono_id: string }) => l.dono_id);
  const { data: perfis } = await supabase
    .from("perfis")
    .select("id, nome, foto_url, cidade")
    .in("id", donoIds);
  const map = new Map((perfis ?? []).map((p: { id: string; nome: string; foto_url: string | null; cidade: string | null }) => [p.id, p]));

  return data.map((l: { id: string; nome: string; descricao: string | null; total_vendas: number; dono_id: string }) => ({
    ...l,
    dono: map.get(l.dono_id) ?? null,
  }));
}

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

// ── MODERAÇÃO ───────────────────────────────────────────────────

export interface ModeradorInfo {
  morador_id: string;
  criado_em: string;
  criado_por: string | null;
  morador?: {
    id: string;
    nome: string;
    cidade: string | null;
    foto_url: string | null;
    urban_score: number;
  } | null;
}

export async function ehAdmin(): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase.rpc("is_admin");
  return Boolean(data);
}

export async function ehModerador(): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase.rpc("is_moderador");
  return Boolean(data);
}

export async function listarModeradores(): Promise<ModeradorInfo[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("moderadores")
    .select("*")
    .order("criado_em", { ascending: false });
  if (error || !data) return [];
  if (data.length === 0) return [];

  const ids = data.map((m: { morador_id: string }) => m.morador_id);
  const { data: perfis } = await supabase
    .from("perfis")
    .select("id, nome, cidade, foto_url, urban_score")
    .in("id", ids);

  type Perfil = { id: string; nome: string; cidade: string | null; foto_url: string | null; urban_score: number };
  const map = new Map((perfis ?? []).map((p: Perfil) => [p.id, p]));

  return data.map((m: { morador_id: string; criado_em: string; criado_por: string | null }) => ({
    ...m,
    morador: (map.get(m.morador_id) as Perfil | undefined) ?? null,
  }));
}

export async function adicionarModerador(morador_id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  const { error } = await supabase
    .from("moderadores")
    .insert({ morador_id, criado_por: user.id });
  if (error) throw new Error(error.message);
}

export async function removerModerador(morador_id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("moderadores")
    .delete()
    .eq("morador_id", morador_id);
  if (error) throw new Error(error.message);
}

export async function removerPostPorModeracao(post_id: string, motivo: string) {
  const supabase = createClient();
  const { error } = await supabase.rpc("remover_post", { post_id, motivo });
  if (error) throw new Error(error.message);
}

export async function removerCursoPorModeracao(curso_id: string, motivo: string) {
  const supabase = createClient();
  const { error } = await supabase.rpc("remover_curso", { curso_id, motivo });
  if (error) throw new Error(error.message);
}

export async function removerComentarioPorModeracao(comentario_id: string, motivo: string) {
  const supabase = createClient();
  const { error } = await supabase.rpc("remover_comentario", { comentario_id, motivo });
  if (error) throw new Error(error.message);
}

export async function removerAvaliacaoPorModeracao(avaliacao_id: string, motivo: string) {
  const supabase = createClient();
  const { error } = await supabase.rpc("remover_avaliacao", { avaliacao_id, motivo });
  if (error) throw new Error(error.message);
}

async function buscarRemovedores(ids: (string | null)[]): Promise<Map<string, { nome: string }>> {
  const filtrados = [...new Set(ids.filter(Boolean) as string[])];
  if (filtrados.length === 0) return new Map();
  const supabase = createClient();
  const { data } = await supabase
    .from("perfis")
    .select("id, nome")
    .in("id", filtrados);
  return new Map((data ?? []).map((p: { id: string; nome: string }) => [p.id, { nome: p.nome }]));
}
