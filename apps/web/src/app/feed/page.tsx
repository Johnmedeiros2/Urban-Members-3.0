"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import ScoreBadge from "@/components/ui/ScoreBadge";
import Avatar from "@/components/ui/Avatar";
import Notificacoes from "@/components/ui/Notificacoes";
import BotaoConvite from "@/components/ui/BotaoConvite";
import BuscaGlobal from "@/components/ui/BuscaGlobal";
import Comentarios from "@/components/ui/Comentarios";
import BotaoCompartilhar from "@/components/ui/BotaoCompartilhar";
import ConteudoFormatado from "@/components/ui/ConteudoFormatado";
import Stories from "@/components/ui/Stories";
import { buscarPosts, buscarPostsPersonalizado, criarPost, curtirPost, descurtirPost, minhasCurtidas, deletarPost, minhasEmpresas, type PostReal, type Empresa } from "@/lib/queries";
import { createClient } from "@/lib/supabase";

const neighborhoods = [
  { label: "Início",       active: true,  href: "/feed",              icon: "home"     },
  { label: "Buscar",       active: false, href: "/buscar",            icon: "search"   },
  { label: "Bairros",      active: false, href: "/bairros/negocios",  icon: "map"      },
  { label: "Pulse",        active: false, href: "/pulse",             icon: "pulse"    },
  { label: "Arte",         active: false, href: "/bairros/arte",      icon: "art"      },
  { label: "Trilhas",      active: false, href: "/trilhas",           icon: "trail"    },
  { label: "Lives",        active: false, href: "/lives",             icon: "live"     },
  { label: "Agenda",       active: false, href: "/agenda",            icon: "agenda"   },
  { label: "Mercado",      active: false, href: "/mercado",           icon: "market"   },
  { label: "Sala de Aula", active: false, href: "/sala-de-aula",      icon: "school"   },
];

function NavIcon({ name }: { name: string }) {
  const c = "currentColor";
  const s = { width: 17, height: 17 };
  switch (name) {
    case "home":   return <svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V21H3V9.5z"/><path d="M9 21v-7h6v7"/></svg>;
    case "search": return <svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>;
    case "map":    return <svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 4l-6 2v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v16M15 6v16"/></svg>;
    case "pulse":  return <svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h4l2-7 4 14 2-7h6"/></svg>;
    case "art":    return <svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="9" r="1"/><circle cx="16" cy="14" r="1"/><path d="M8 16c1 1 2.5 1 4 1"/></svg>;
    case "trail":  return <svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19l5-9 5 5 6-10"/><circle cx="4" cy="19" r="1.5"/><circle cx="20" cy="5" r="1.5"/></svg>;
    case "live":   return <svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" fill={c}/><path d="M5 12a7 7 0 0 1 14 0"/><path d="M2 12a10 10 0 0 1 20 0"/></svg>;
    case "agenda": return <svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></svg>;
    case "market": return <svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16l-1.5 12a2 2 0 0 1-2 1.7H7.5a2 2 0 0 1-2-1.7L4 7z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/></svg>;
    case "school": return <svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10l9-5 9 5-9 5-9-5z"/><path d="M7 12v5c2 1.5 8 1.5 10 0v-5"/></svg>;
    default:       return null;
  }
}

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
  const [video, setVideo] = useState<File | null>(null);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [comentariosAbertos, setComentariosAbertos] = useState<Set<string>>(new Set());
  const [tagFiltro, setTagFiltro] = useState<string | null>(null);
  const [modoFeed, setModoFeed] = useState<"recente" | "voce">("voce");
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [postandoComoEmpresa, setPostandoComoEmpresa] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setTagFiltro(params.get("tag"));
  }, []);

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
    const fetcher = tagFiltro
      ? buscarPosts(20, tagFiltro)
      : modoFeed === "voce"
        ? buscarPostsPersonalizado(30)
        : buscarPosts(20);
    const [p, user] = await Promise.all([
      fetcher,
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
  }, [tagFiltro, modoFeed]);

  useEffect(() => { carregar(); }, [carregar]);

  useEffect(() => {
    minhasEmpresas().then(setEmpresas).catch(() => setEmpresas([]));
  }, []);

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
    if ((!conteudo.trim() && !foto && !video) || postando) return;
    setPostando(true);
    try {
      await criarPost(conteudo, bairroSelecionado, foto, video, postandoComoEmpresa);
      setConteudo("");
      setFoto(null);
      setPreviewFoto(null);
      setVideo(null);
      setPreviewVideo(null);
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

  function handleSelecionarVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    if (arquivo.size > 50 * 1024 * 1024) { alert("Vídeo muito grande (máx 50MB)"); return; }
    setVideo(arquivo);
    setPreviewVideo(URL.createObjectURL(arquivo));
  }

  function removerVideo() {
    setVideo(null);
    setPreviewVideo(null);
    if (videoInputRef.current) videoInputRef.current.value = "";
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
                <button className={`um-nav-item${n.active ? " active" : ""}`} style={{ gap: "10px" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "20px", height: "20px" }}>
                    <NavIcon name={n.icon} />
                  </span>
                  {n.label}
                </button>
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

          {!tagFiltro && (
            <div style={{ display: "flex", gap: "6px", padding: "0 4px" }}>
              {([
                { id: "voce" as const,    label: "Pra você"   },
                { id: "recente" as const, label: "Mais recente" },
              ]).map((opt) => (
                <button key={opt.id} onClick={() => setModoFeed(opt.id)} style={{
                  padding: "8px 16px",
                  background: modoFeed === opt.id ? "#111111" : "#FFFFFF",
                  color: modoFeed === opt.id ? "#FFFFFF" : "#525252",
                  border: `1px solid ${modoFeed === opt.id ? "#111111" : "#E5E5E5"}`,
                  borderRadius: "999px", fontSize: "12px",
                  fontWeight: modoFeed === opt.id ? 700 : 500,
                  cursor: "pointer", fontFamily: "Inter, sans-serif",
                }}>
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {tagFiltro && (
            <div style={{ background: "#FFF3EF", border: "1px solid #FFD4C4", borderRadius: "14px", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", color: "#111111" }}>
                Filtrando por <strong style={{ color: "#FF5C2E" }}>#{tagFiltro}</strong>
              </span>
              <button
                onClick={() => { window.history.replaceState(null, "", "/feed"); setTagFiltro(null); }}
                style={{ background: "none", border: "none", fontSize: "12px", fontWeight: 600, color: "#FF5C2E", cursor: "pointer", fontFamily: "Inter, sans-serif" }}
              >
                Limpar filtro
              </button>
            </div>
          )}

          {/* Composer */}
          <div className="um-composer" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Inputs de arquivo sempre presentes no DOM */}
            <input ref={fotoInputRef} type="file" accept="image/*" onChange={handleSelecionarFoto} style={{ display: "none" }} />
            <input ref={videoInputRef} type="file" accept="video/mp4,video/quicktime,video/webm" onChange={handleSelecionarVideo} style={{ display: "none" }} />

            <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <Avatar name={meuNome} foto={usuario?.foto_url} size={44} />
                <span style={{ position: "absolute", bottom: -2, right: -2, background: "#FF5C2E", color: "#FFFFFF", fontSize: "9px", fontWeight: 800, padding: "2px 6px", borderRadius: "999px", border: "2px solid #FFFFFF", whiteSpace: "nowrap" }}>+5</span>
              </div>
              <textarea
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                placeholder="O que está acontecendo na sua cidade?"
                rows={1}
                style={{
                  flex: 1, border: "none", outline: "none", resize: "none",
                  fontSize: "15px", color: "#111111",
                  fontFamily: "Inter, sans-serif", background: "transparent",
                  padding: "10px 0", minHeight: "36px", fontWeight: 500,
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
              <button onClick={() => videoInputRef.current?.click()}
                title="Adicionar vídeo (Urban Pulse)"
                style={{
                  width: "32px", height: "32px",
                  borderRadius: "50%", background: "transparent",
                  border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#A3A3A3", transition: "all 0.15s",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#F5F5F5"; (e.currentTarget as HTMLElement).style.color = "#FF5C2E"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#A3A3A3"; }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
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

            {/* Preview do vídeo selecionado */}
            {previewVideo && (
              <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden", maxHeight: "400px", background: "#000000" }}>
                <video src={previewVideo} controls style={{ width: "100%", maxHeight: "400px", display: "block" }} />
                <button onClick={removerVideo}
                  style={{ position: "absolute", top: "8px", right: "8px", width: "28px", height: "28px", borderRadius: "50%", background: "rgba(0,0,0,0.7)", color: "#FFFFFF", border: "none", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  ×
                </button>
              </div>
            )}

            {(conteudo.trim() || foto || video) && (
              <div style={{ display: "flex", gap: "8px", alignItems: "center", justifyContent: "space-between", paddingTop: "10px", borderTop: "1px solid #F5F5F5", flexWrap: "wrap" }}>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <select value={bairroSelecionado} onChange={(e) => setBairroSelecionado(e.target.value)}
                    style={{ fontSize: "12px", color: "#525252", border: "1px solid #E5E5E5", borderRadius: "999px", padding: "6px 12px", background: "#FFFFFF", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                    {BAIRROS.map((b) => <option key={b.id} value={b.id}>📍 {b.label}</option>)}
                  </select>
                  {empresas.length > 0 && (
                    <select value={postandoComoEmpresa ?? ""} onChange={(e) => setPostandoComoEmpresa(e.target.value || null)}
                      style={{ fontSize: "12px", color: postandoComoEmpresa ? "#FF5C2E" : "#525252", border: `1px solid ${postandoComoEmpresa ? "#FF5C2E" : "#E5E5E5"}`, borderRadius: "999px", padding: "6px 12px", background: "#FFFFFF", cursor: "pointer", fontFamily: "Inter, sans-serif", fontWeight: postandoComoEmpresa ? 600 : 400 }}>
                      <option value="">Postar como você</option>
                      {empresas.map((e) => <option key={e.id} value={e.id}>Como {e.nome_fantasia}</option>)}
                    </select>
                  )}
                </div>
                <button onClick={handlePostar} disabled={postando} className="um-btn-accent"
                  style={{ padding: "10px 22px", fontSize: "13px" }}>
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
            const ehDeEmpresa = !!post.empresa;
            const tituloPrincipal = ehDeEmpresa ? post.empresa!.nome_fantasia : nome;
            const linkPrincipal = ehDeEmpresa ? `/empresa/${post.empresa!.id}` : `/morador/${post.autor_id}`;
            const fotoPrincipal = ehDeEmpresa ? post.empresa!.foto_url : (post.autor?.foto_url ?? null);
            return (
              <article key={post.id} style={{ background: "#FFFFFF", borderRadius: "20px", padding: "20px", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                  <a href={linkPrincipal} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                    <Avatar name={tituloPrincipal} foto={fotoPrincipal} size={44} />
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <p style={{ fontSize: "14px", fontWeight: 700, color: "#111111" }}>{tituloPrincipal}</p>
                        {ehDeEmpresa && (
                          <span style={{ fontSize: "10px", fontWeight: 700, color: "#FFFFFF", background: "#111111", padding: "2px 7px", borderRadius: "999px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                            Empresa
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "3px" }}>
                        {ehDeEmpresa ? (
                          <span style={{ fontSize: "12px", color: "#525252" }}>
                            {post.empresa?.segmento ?? ""}{post.empresa?.segmento ? " · " : ""}por {nome}
                          </span>
                        ) : (
                          <span style={{ fontSize: "12px", color: "#525252" }}>{post.autor?.cidade ?? ""}</span>
                        )}
                        <a href={`/bairros/${post.bairro_id}`} className="um-tag-bairro" style={{ textDecoration: "none" }}>
                          {post.bairro_id}
                        </a>
                        <span style={{ fontSize: "12px", color: "#A3A3A3" }}>{tempoRelativo(post.criado_em)}</span>
                      </div>
                    </div>
                  </a>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {!ehDeEmpresa && <ScoreBadge score={post.autor?.urban_score ?? 10} compact />}
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
                  <ConteudoFormatado texto={post.conteudo} style={{ fontSize: "15px", color: "#111111", lineHeight: 1.65 }} />
                )}

                {post.foto_url && (
                  <div style={{ borderRadius: "14px", overflow: "hidden", maxHeight: "500px" }}>
                    <img src={post.foto_url} alt="Foto do post" style={{ width: "100%", objectFit: "cover", display: "block", maxHeight: "500px" }} />
                  </div>
                )}

                {post.video_url && (
                  <div style={{ borderRadius: "14px", overflow: "hidden", maxHeight: "600px", background: "#000000" }}>
                    <video src={post.video_url} controls playsInline preload="metadata"
                      style={{ width: "100%", maxHeight: "600px", display: "block" }} />
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
        <aside style={{ display: "flex", flexDirection: "column", gap: "16px", position: "sticky", top: "84px", alignSelf: "flex-start" }}>

          {/* Comece por aqui — missões pra novos moradores */}
          {meuScore < 100 && (
            <div className="um-card" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "16px" }}>🏙️</span>
                <p style={{ fontSize: "14px", fontWeight: 800, color: "#111111", letterSpacing: "-0.01em" }}>Comece por aqui</p>
              </div>
              <p style={{ fontSize: "12px", color: "#A3A3A3", lineHeight: 1.5, marginTop: "-4px" }}>3 passos pra entrar de vez na cidade.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <a href="#composer" className={`um-mission${meuScore >= 15 ? " done" : ""}`} onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                  <span className="um-mission-check">{meuScore >= 15 ? "✓" : "1"}</span>
                  <span style={{ flex: 1, fontSize: "13px", fontWeight: 600 }}>Faz seu primeiro post</span>
                  <span style={{ fontSize: "10px", color: "#FF5C2E", fontWeight: 700 }}>+5</span>
                </a>
                <a href="/buscar" className="um-mission">
                  <span className="um-mission-check">2</span>
                  <span style={{ flex: 1, fontSize: "13px", fontWeight: 600 }}>Conecta com moradores</span>
                  <span style={{ fontSize: "10px", color: "#FF5C2E", fontWeight: 700 }}>+3</span>
                </a>
                <a href="/mercado" className="um-mission">
                  <span className="um-mission-check">3</span>
                  <span style={{ flex: 1, fontSize: "13px", fontWeight: 600 }}>Visita o Mercado</span>
                  <span style={{ fontSize: "10px", color: "#FF5C2E", fontWeight: 700 }}>↗</span>
                </a>
              </div>
            </div>
          )}

          {/* NOW — destaque com gradiente animado */}
          <div className="um-card-live">
            <div className="um-card-live-inner">
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                <span className="um-pulse-dot" />
                <span style={{ fontSize: "10px", fontWeight: 800, color: "#FF5C2E", letterSpacing: "0.08em", textTransform: "uppercase" }}>Now</span>
              </div>
              <Stories layout="lateral" />
            </div>
          </div>

          {/* Score / dicas */}
          <div className="um-card" style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#A3A3A3", letterSpacing: "0.06em", textTransform: "uppercase" }}>Seu Urban Score</p>
              <span style={{ fontSize: "18px", fontWeight: 800, color: "#FF5C2E" }}>{meuScore}</span>
            </div>
            <p style={{ fontSize: "12px", color: "#6B6B6B", lineHeight: 1.55 }}>
              Cada post: <strong style={{ color: "#FF5C2E" }}>+5</strong> · cada curtida recebida: <strong style={{ color: "#FF5C2E" }}>+2</strong> · cada conexão: <strong style={{ color: "#FF5C2E" }}>+3</strong>.
            </p>
          </div>
        </aside>

      </div>
    </div>
  );
}
