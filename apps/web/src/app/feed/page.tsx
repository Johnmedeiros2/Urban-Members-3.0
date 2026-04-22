"use client";

import { useState, useEffect, useCallback } from "react";
import ScoreBadge from "@/components/ui/ScoreBadge";
import Avatar from "@/components/ui/Avatar";
import Notificacoes from "@/components/ui/Notificacoes";
import BotaoConvite from "@/components/ui/BotaoConvite";
import { buscarPosts, criarPost, curtirPost, descurtirPost, minhasCurtidas, type PostReal } from "@/lib/queries";
import { createClient } from "@/lib/supabase";

const neighborhoods = [
  { label: "Início",       active: true,  href: "/feed"             },
  { label: "Bairros",      active: false, href: "/bairros/negocios" },
  { label: "Aprender",     active: false, href: "/sala-de-aula"     },
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
  const [usuario, setUsuario] = useState<{ nome: string; score: number } | null>(null);

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
        .select("nome, urban_score")
        .eq("id", user.data.user.id)
        .single();
      if (data) setUsuario({ nome: data.nome, score: data.urban_score });
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
    if (!conteudo.trim() || postando) return;
    setPostando(true);
    try {
      await criarPost(conteudo, bairroSelecionado);
      setConteudo("");
      await carregar();
    } catch (e) {
      console.error(e);
      alert("Erro ao postar. Tente novamente.");
    } finally {
      setPostando(false);
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
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img src="/logo.svg" alt="Urban Members" width={36} height={36} />
            <span style={{ fontSize: "15px", fontWeight: 800, letterSpacing: "-0.03em", color: "#111111" }}>Urban Members</span>
          </div>

          <div style={{ flex: 1, maxWidth: "360px", margin: "0 32px", background: "#F5F5F5", borderRadius: "999px", padding: "0 16px", height: "40px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "13px", color: "#A3A3A3", fontFamily: "Inter, sans-serif" }}>Buscar na cidade...</span>
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
            <a href="/perfil"><Avatar name={meuNome} size={36} /></a>
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
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Avatar name={meuNome} size={40} />
              <textarea
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                placeholder="O que está acontecendo na sua cidade?"
                rows={1}
                style={{
                  flex: 1, border: "none", outline: "none", resize: "none",
                  fontSize: "14px", color: "#111111",
                  fontFamily: "Inter, sans-serif", background: "transparent",
                  padding: "8px 0",
                }}
              />
            </div>
            {conteudo.trim() && (
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
            const nome = post.perfis?.nome ?? "Morador";
            return (
              <article key={post.id} style={{ background: "#FFFFFF", borderRadius: "20px", padding: "20px", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <Avatar name={nome} size={44} />
                    <div>
                      <p style={{ fontSize: "14px", fontWeight: 700, color: "#111111" }}>{nome}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "3px" }}>
                        <span style={{ fontSize: "12px", color: "#525252" }}>{post.perfis?.cidade ?? ""}</span>
                        <span style={{ fontSize: "11px", color: "#FF5C2E", fontWeight: 600, background: "#FFF3EF", padding: "1px 7px", borderRadius: "999px" }}>
                          {post.bairro_id}
                        </span>
                        <span style={{ fontSize: "12px", color: "#A3A3A3" }}>{tempoRelativo(post.criado_em)}</span>
                      </div>
                    </div>
                  </div>
                  <ScoreBadge score={post.perfis?.urban_score ?? 10} compact />
                </div>

                <p style={{ fontSize: "15px", color: "#111111", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{post.conteudo}</p>

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
                  <button style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 12px", borderRadius: "999px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600, background: "transparent", color: "#A3A3A3", fontFamily: "Inter, sans-serif" }}>
                    <span>💬</span> {post.total_comentarios}
                  </button>
                </div>
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
