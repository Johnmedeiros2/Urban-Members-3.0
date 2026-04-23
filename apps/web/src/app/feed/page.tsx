"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import ScoreBadge from "@/components/ui/ScoreBadge";
import Avatar from "@/components/ui/Avatar";
import Notificacoes from "@/components/ui/Notificacoes";
import BotaoConvite from "@/components/ui/BotaoConvite";
import BuscaGlobal from "@/components/ui/BuscaGlobal";
import Comentarios from "@/components/ui/Comentarios";
import BotaoCompartilhar from "@/components/ui/BotaoCompartilhar";
import { buscarPosts, criarPost, curtirPost, descurtirPost, minhasCurtidas, deletarPost, type PostReal } from "@/lib/queries";
import { createClient } from "@/lib/supabase";

const neighborhoods = [
  { label: "Início",       active: true,  href: "/feed"             },
  { label: "Moradores",    active: false, href: "/moradores"        },
  { label: "Bairros",      active: false, href: "/bairros/negocios" },
  { label: "Mercado",      active: false, href: "/mercado"          },
  { label: "Negócios",     active: false, href: "/bairros/negocios" },
  { label: "Arte",         active: false, href: "/bairros/arte"     },
  { label: "Sala de Aula", active: false, href: "/sala-de-aula"     },
];

const BAIRROS = [
  { id: "negocios",    label: "Negócios"    },
  { id: "educacao",    label: "Educação"    },
  { id: "arte",        label: "Arte"        },
  { id: "mercado",     label: "Mercado"     },
  { id: "tecnologia",  label: "Tecnologia"  },
  { id: "sala-de-aula",label: "Sala de Aula"},
];

function tempoRelativo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)   return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export default function Feed() {
  const [posts, setPosts] = useState<PostReal[]>([]);
  const [curtidas, setCurtidas] = useState<Set<string>>(new Set());
  const [carregando, setCarregando] = useState(true);
  const [conteudo, setConteudo] = useState("");
  const [bairroSelecionado, setBairroSelecionado] = useState("negocios");
  const [postando, setPostando] = useState(false);
  const [usuario, setUsuario] = useState<{ id: string; nome: string; score: number; foto_url: string | null } | null>(null);
  const [foto, setFoto] = useState<File | null>(null);
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);
  const fotoInputRef = useRef<HTMLInputElement>(null);
  const [comentariosAbertos, setComentariosAbertos] = useState<Set<string>>(new Set());

  function toggleComentarios(postId: string) {
    setComentariosAbertos((prev) => {
      const nova = new Set(prev);
      if (nova.has(postId)) nova.delete(postId); else nova.add(postId);
      return nova;
    });
  }

  function atualizarContagem(postId: string, n: number) {
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, total_comentarios: n } : p));
  }

  const carregar = useCallback(async () => {
    setCarregando(true);
    const [p, user] = await Promise.all([
      buscarPosts(),
      createClient().auth.getUser(),
    ]);
    setPosts(p);
    if (p.length > 0) {
      const curtidasIds = await minhasCurtidas(p.map((x) => x.id));
      setCurtidas(curtidasIds);
    }
    if (user.data.user) {
      const { data } = await createClient()
        .from("perfis")
        .select("nome, urban_score, foto_url")
        .eq("id", user.data.user.id)
        .single();
      if (data) setUsuario({ id: user.data.user.id, nome: data.nome, score: data.urban_score, foto_url: data.foto_url });
    }
    setCarregando(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  // Realtime: novos posts aparecem automaticamente
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("posts-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "posts" }, () => carregar())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [carregar]);

  async function handlePostar() {
    if ((!conteudo.trim() && !foto) || postando) return;
    setPostando(true);
    try {
      await criarPost(conteudo, bairroSelecionado, foto);
      setConteudo("");
      setFoto(null);
      setPreviewFoto(null);
      await carregar();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro desconhecido";
      console.error("Erro ao postar:", e);
      alert(`Erro ao postar: ${msg}`);
    } finally {
      setPostando(false);
    }
  }

  function handleSelecionarFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    if (arquivo.size > 5 * 1024 * 1024) { alert("Imagem muito grande (máx 5MB)"); return; }
    setFoto(arquivo);
    setPreviewFoto(URL.createObjectURL(arquivo));
  }

  function removerFoto() {
    setFoto(null);
    setPreviewFoto(null);
    if (fotoInputRef.current) fotoInputRef.current.value = "";
  }

  async function handleDeletar(post_id: string) {
    if (!confirm("Tem certeza que quer deletar este post?")) return;
    try {
      await deletarPost(post_id);
      await carregar();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao deletar");
    }
  }

  async function toggleCurtir(post_id: string) {
    const jaCurtiu = curtidas.has(post_id);
    // Otimista — atualiza UI antes da resposta
    setCurtidas((prev) => {
      const nova = new Set(prev);
      if (jaCurtiu) nova.delete(post_id); else nova.add(post_id);
      return nova;
    });
    setPosts((prev) => prev.map((p) =>
      p.id === post_id ? { ...p, total_curtidas: p.total_curtidas + (jaCurtiu ? -1 : 1) } : p
    ));
    try {
      if (jaCurtiu) await descurtirPost(post_id);
      else await curtirPost(post_id);
    } catch (e) { console.error(e); }
  }

  const meuNome = usuario?.nome ?? "Você";
  const meuScore = usuario?.score ?? 10;

  return (
    <div style={{ minHeight: "100vh", background: "#F7F7F8", fontFamily: "Inter, sans-serif" }}>

      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/feed" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <img src="/logo.svg" alt="Urban Members" width={36} height={36} />
            <span style={{ fontSize: "15px", fontWeight: 800, letterSpacing: "-0.03em", color: "#111111" }}>Urban Members</span>
          </a>

          <div style={{ flex: 1, margin: "0 32px", display: "flex", justifyContent: "center" }}>
            <BuscaGlobal />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <BotaoConvite variant="light" />
            <Notificacoes />
            <ScoreBadge score={meuScore} compact />
            <a href="/urban-pay" style={{ textDecoration: "none" }}>
              <button style={{ height: "36px", padding: "0 16px", background: "#FF5C2E", color: "#FFFFFF", border: "none", borderRadius: "999px", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                Urban Pay
              </button>
            </a>
            <a href="/perfil"><Avatar name={meuNome} foto={usuario?.foto_url} size={36} /></a>
          </div>
        </div>
      </header>

      {/* Layout */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px 24px 80px", display: "grid", gridTemplateColumns: "220px 1fr 280px", gap: "24px" }}>

        {/* Sidebar */}
        <aside>
          <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "6px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.05)", position: "sticky", top: "84px" }}>
            <p style={{ fontSize: "10px", fontWeight: 600, color: "#A3A3A3", letterSpacing: "0.08em", textTransform: "uppercase", padding: "10px 14px 6px" }}>Navegação</p>
            {neighborhoods.map((n) => (
              <a key={n.label} href={n.href} style={{ textDecoration: "none" }}>
                <button style={{
                  width: "100%", display: "flex", alignItems: "center", padding: "10px 14px",
                  borderRadius: "10px", border: "none", cursor: "pointer",
                  background: n.active ? "#111111" : "transparent",
                  color: n.active ? "#FFFFFF" : "#6B6B6B",
                  fontSize: "13.5px", fontWeight: n.active ? 600 : 400,
                  fontFamily: "Inter, sans-serif", textAlign: "left",
                }}>{n.label}</button>
              </a>
            ))}
            <div style={{ margin: "10px 6px 6px", background: "#F7F7F8", borderRadius: "12px", padding: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#6B6B6B" }}>Urban Score</span>
                <ScoreBadge score={meuScore} compact />
              </div>
              <div style={{ background: "#E5E5E5", borderRadius: "999px", height: "3px", overflow: "hidden" }}>
                <div style={{ width: `${Math.min((meuScore / 900) * 100, 100)}%`, height: "100%", background: "linear-gradient(90deg, #FF5C2E, #FF8C5A)", borderRadius: "999px", transition: "width 0.6s" }} />
              </div>
            </div>
          </div>
        </aside>

        {/* Feed central */}
        <main style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Composer */}
          <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "16px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Input de arquivo sempre presente no DOM */}
            <input ref={fotoInputRef} type="file" accept="image/*" onChange={handleSelecionarFoto} style={{ display: "none" }} />

            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <Avatar name={meuNome} foto={usuario?.foto_url} size={40} />
              <textarea
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                placeholder="O que está acontecendo na sua cidade?"
                rows={1}
                style={{
                  flex: 1, border: "none", outline: "none", resize: "none",
                  fontSize: "14px", color: "#111111",
                  fontFamily: "Inter, sans-serif", background: "transparent",
                  padding: "8px 0", minHeight: "32px",
                }}
              />
              {/* Ícone de foto sutil sempre visível ao lado do campo */}
              <button onClick={() => fotoInputRef.current?.click()}
                title="Adicionar foto"
                style={{
                  width: "32px", height: "32px",
                  borderRadius: "50%", background: "transparent",
                  border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#A3A3A3", transition: "all 0.15s",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#F5F5F5"; (e.currentTarget as HTMLElement).style.color = "#111111"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#A3A3A3"; }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="9" cy="9" r="2"/>
                  <path d="M21 15l-5-5L5 21"/>
                </svg>
              </button>
            </div>

            {/* Preview da foto selecionada */}
            {previewFoto && (
              <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden", maxHeight: "300px" }}>
                <img src={previewFoto} alt="preview" style={{ width: "100%", objectFit: "cover", display: "block", maxHeight: "300px" }} />
                <button onClick={removerFoto}
                  style={{ position: "absolute", top: "8px", right: "8px", width: "28px", height: "28px", borderRadius: "50%", background: "rgba(0,0,0,0.7)", color: "#FFFFFF", border: "none", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  ×
                </button>
              </div>
            )}

            {(conteudo.trim() || foto) && (
              <div style={{ display: "flex", gap: "8px", alignItems: "center", justifyContent: "space-between", paddingTop: "10px", borderTop: "1px solid #F5F5F5" }}>
                <select value={bairroSelecionado} onChange={(e) => setBairroSelecionado(e.target.value)}
                  style={{ fontSize: "12px", color: "#525252", border: "1px solid #E5E5E5", borderRadius: "999px", padding: "6px 12px", background: "#FFFFFF", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                  {BAIRROS.map((b) => <option key={b.id} value={b.id}>📍 {b.label}</option>)}
                </select>
                <button onClick={handlePostar} disabled={postando}
                  style={{ background: "#111111", color: "#FFFFFF", border: "none", borderRadius: "999px", padding: "8px 18px", fontSize: "13px", fontWeight: 700, cursor: postando ? "not-allowed" : "pointer", opacity: postando ? 0.6 : 1, fontFamily: "Inter, sans-serif" }}>
                  {postando ? "Postando..." : "Postar"}
                </button>
              </div>
            )}
          </div>

          {/* Posts */}
          {carregando && (
            <div style={{ textAlign: "center", padding: "40px", color: "#A3A3A3", fontSize: "14px" }}>
              Carregando feed...
            </div>
          )}

          {!carregando && posts.length === 0 && (
            <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "48px 24px", textAlign: "center", border: "1px solid rgba(0,0,0,0.05)" }}>
              <p style={{ fontSize: "15px", fontWeight: 700, color: "#111111" }}>A cidade ainda está silenciosa</p>
              <p style={{ fontSize: "13px", color: "#A3A3A3", marginTop: "6px" }}>Seja o primeiro a postar algo no seu bairro.</p>
            </div>
          )}

          {posts.map((post) => {
            const curtido = curtidas.has(post.id);
            const nome = post.autor?.nome ?? "Morador";
            const ehMeuPost = usuario?.id === post.autor_id;
            return (
              <article key={post.id} style={{ background: "#FFFFFF", borderRadius: "20px", padding: "20px", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                  <a href={`/morador/${post.autor_id}`} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                    <Avatar name={nome} foto={post.autor?.foto_url} size={44} />
                    <div>
                      <p style={{ fontSize: "14px", fontWeight: 700, color: "#111111" }}>{nome}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "3px" }}>
                        <span style={{ fontSize: "12px", color: "#525252" }}>{post.autor?.cidade ?? ""}</span>
                        <span style={{ fontSize: "11px", color: "#FF5C2E", fontWeight: 600, background: "#FFF3EF", padding: "1px 7px", borderRadius: "999px" }}>
                          {post.bairro_id}
                        </span>
                        <span style={{ fontSize: "12px", color: "#A3A3A3" }}>{tempoRelativo(post.criado_em)}</span>
                      </div>
                    </div>
                  </a>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <ScoreBadge score={post.autor?.urban_score ?? 10} compact />
                    {ehMeuPost && (
                      <button onClick={() => handleDeletar(post.id)}
                        title="Excluir post"
                        style={{ width: "28px", height: "28px", borderRadius: "50%", background: "transparent", border: "none", cursor: "pointer", fontSize: "14px", color: "#A3A3A3" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#FEF2F2"; (e.currentTarget as HTMLElement).style.color = "#DC2626"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#A3A3A3"; }}
                      >
                        🗑
                      </button>
                    )}
                  </div>
                </div>

                {post.conteudo && (
                  <p style={{ fontSize: "15px", color: "#111111", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{post.conteudo}</p>
                )}

                {post.foto_url && (
                  <div style={{ borderRadius: "14px", overflow: "hidden", maxHeight: "500px" }}>
                    <img src={post.foto_url} alt="Foto do post" style={{ width: "100%", objectFit: "cover", display: "block", maxHeight: "500px" }} />
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: "4px", paddingTop: "12px", borderTop: "1px solid #F5F5F5" }}>
                  <button onClick={() => toggleCurtir(post.id)} style={{
                    display: "flex", alignItems: "center", gap: "5px",
                    padding: "7px 12px", borderRadius: "999px", border: "none", cursor: "pointer",
                    fontSize: "13px", fontWeight: 600, background: "transparent",
                    color: curtido ? "#FF5C2E" : "#A3A3A3", fontFamily: "Inter, sans-serif",
                  }}>
                    <span style={{ fontSize: "15px" }}>{curtido ? "♥" : "♡"}</span>
                    {post.total_curtidas}
                  </button>
                  <button
                    onClick={() => toggleComentarios(post.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: "5px",
                      padding: "7px 12px", borderRadius: "999px", border: "none", cursor: "pointer",
                      fontSize: "13px", fontWeight: 600, background: "transparent",
                      color: comentariosAbertos.has(post.id) ? "#111111" : "#A3A3A3",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    <span>💬</span> {post.total_comentarios}
                  </button>
                  <BotaoCompartilhar texto={post.conteudo} autor={post.autor?.nome} />
                </div>

                {comentariosAbertos.has(post.id) && (
                  <Comentarios postId={post.id} onContagem={(n) => atualizarContagem(post.id, n)} />
                )}
              </article>
            );
          })}
        </main>

        {/* Sidebar direita */}
        <aside>
          <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "20px", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", position: "sticky", top: "84px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "#111111" }}>Bem-vindo, {meuNome}</p>
            <p style={{ fontSize: "12px", color: "#A3A3A3", lineHeight: 1.5 }}>
              Seu feed mostra posts reais da cidade. Curta, comente e poste para subir seu Urban Score.
            </p>
            <div style={{ borderTop: "1px solid #F5F5F5", paddingTop: "14px" }}>
              <p style={{ fontSize: "12px", color: "#6B6B6B" }}>
                <strong style={{ color: "#111111" }}>Dica:</strong> cada post dá <span style={{ color: "#FF5C2E", fontWeight: 700 }}>+5 pontos</span>. Cada curtida recebida: <span style={{ color: "#FF5C2E", fontWeight: 700 }}>+2</span>.
              </p>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
