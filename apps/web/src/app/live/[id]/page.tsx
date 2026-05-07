"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Avatar from "@/components/ui/Avatar";
import BotaoConvite from "@/components/ui/BotaoConvite";
import AvatarMenu from "@/components/ui/AvatarMenu";
import BotaoCompartilhar from "@/components/ui/BotaoCompartilhar";
import ViewerLiveNativa from "@/components/ui/ViewerLiveNativa";
import {
  buscarItensLive, vincularItemLive, desvincularItemLive, comprarDaLive,
  resumoConversaoLive, buscarProdutos, buscarCursos,
  type ItemLive, type Produto, type Curso
} from "@/lib/queries";
import { createClient } from "@/lib/supabase";

interface LiveInfo {
  id: string;
  autor_id: string;
  titulo: string;
  descricao: string | null;
  ao_vivo: boolean;
  agendado_para: string | null;
  link: string | null;
  tipo: "externa" | "nativa";
  nome_sala: string | null;
  autor: { id: string; nome: string; foto_url: string | null; cidade: string | null; urban_score: number } | null;
}

// Extrai ID do vídeo do YouTube para embed
function extrairYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
  return match ? match[1] : null;
}

export default function LivePage() {
  const params = useParams();
  const id = params.id as string;

  const [live, setLive] = useState<LiveInfo | null>(null);
  const [itens, setItens] = useState<ItemLive[]>([]);
  const [meuId, setMeuId] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [comprando, setComprando] = useState<string | null>(null);
  const [resumo, setResumo] = useState({ total_vendas: 0, total_valor: 0, total_liquido: 0 });

  const [modalVincular, setModalVincular] = useState(false);
  const [produtosDisponiveis, setProdutosDisponiveis] = useState<Produto[]>([]);
  const [cursosDisponiveis, setCursosDisponiveis] = useState<Curso[]>([]);
  const [abaVincular, setAbaVincular] = useState<"produtos" | "cursos">("produtos");

  const carregar = useCallback(async () => {
    if (!id) return;
    setCarregando(true);
    const supabase = createClient();
    const [liveRes, it, userData, res] = await Promise.all([
      supabase.from("lives").select("*").eq("id", id).maybeSingle(),
      buscarItensLive(id),
      supabase.auth.getUser(),
      resumoConversaoLive(id),
    ]);
    if (liveRes.data) {
      const l = liveRes.data as { id: string; autor_id: string; titulo: string; descricao: string | null; ao_vivo: boolean; agendado_para: string | null; link: string | null; tipo: "externa" | "nativa" | null; nome_sala: string | null };
      const { data: autor } = await supabase
        .from("perfis").select("id, nome, foto_url, cidade, urban_score")
        .eq("id", l.autor_id).maybeSingle();
      setLive({ ...l, tipo: l.tipo ?? "externa", autor });
    }
    setItens(it);
    setMeuId(userData.data.user?.id ?? null);
    setResumo(res);
    setCarregando(false);
  }, [id]);

  useEffect(() => {
    carregar();
    const _t = setTimeout(() => setCarregando(false), 8000);
    return () => clearTimeout(_t);
  }, [carregar]);

  async function abrirVincular() {
    const [p, c] = await Promise.all([buscarProdutos(50), buscarCursos(50)]);
    // Filtra só os próprios itens do autor
    if (!live) return;
    setProdutosDisponiveis(p.filter((x) => x.loja?.dono_id === live.autor_id));
    setCursosDisponiveis(c.filter((x) => x.instrutor_id === live.autor_id));
    setModalVincular(true);
  }

  async function vincularProduto(produto_id: string) {
    try {
      await vincularItemLive({ live_id: id, produto_id });
      setModalVincular(false);
      await carregar();
    } catch (e: unknown) { alert(e instanceof Error ? e.message : "Erro"); }
  }

  async function vincularCurso(curso_id: string) {
    try {
      await vincularItemLive({ live_id: id, curso_id });
      setModalVincular(false);
      await carregar();
    } catch (e: unknown) { alert(e instanceof Error ? e.message : "Erro"); }
  }

  async function desvincular(vinculoId: string) {
    await desvincularItemLive(vinculoId);
    await carregar();
  }

  async function comprar(item: ItemLive) {
    try {
      if (item.produto) {
        if (!item.produto.loja) throw new Error("Produto sem loja");
        if (!confirm(`Comprar "${item.produto.nome}" por R$ ${item.produto.preco}?`)) return;
        setComprando(item.id);
        await comprarDaLive(item.produto.loja.dono_id, Number(item.produto.preco), item.produto.nome, id);
        alert("Compra realizada! O vendedor foi notificado.");
        await carregar();
      } else if (item.curso) {
        if (!confirm(`Matricular em "${item.curso.titulo}" por R$ ${item.curso.preco}?`)) return;
        setComprando(item.id);
        if (Number(item.curso.preco) === 0) {
          alert("Curso gratuito — abra a Sala de Aula pra matricular.");
          return;
        }
        await comprarDaLive(item.curso.instrutor_id, Number(item.curso.preco), item.curso.titulo, id);
        alert("Matrícula realizada!");
        await carregar();
      }
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro");
    } finally {
      setComprando(null);
    }
  }

  if (carregando) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", color: "#A3A3A3" }}>Carregando live...</div>;
  if (!live) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>Live não encontrada</div>;

  const ehAutor = meuId === live.autor_id;
  const youtubeId = live.link ? extrairYouTubeId(live.link) : null;

  return (
    <div style={{ minHeight: "100vh", background: "#F7F7F8", fontFamily: "Inter, sans-serif" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <a href="/lives" style={{ textDecoration: "none" }}>
              <button className="um-icon-btn" aria-label="Voltar">←</button>
            </a>
            <a href="/feed" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
              <img src="/logo.svg" alt="Urban" width={32} height={32} />
              <span style={{ fontSize: "15px", fontWeight: 800, color: "#111111" }}>Urban Members</span>
            </a>
            <span style={{ fontSize: "13px", color: "#A3A3A3", margin: "0 4px" }}>/</span>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#525252" }}>Live</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <BotaoConvite variant="ghost" />
            <AvatarMenu size={32} />
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px 24px 80px", display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px" }}>

        {/* Player + info */}
        <div>
          <div style={{ background: "#000000", borderRadius: "16px", overflow: "hidden", aspectRatio: "16/9", position: "relative" }}>
            {live.tipo === "nativa" ? (
              live.ao_vivo ? (
                ehAutor ? (
                  <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#FFFFFF", textAlign: "center", padding: "24px", gap: "12px", background: "linear-gradient(135deg, #1F1F1F, #111111)" }}>
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "#FF5C2E", letterSpacing: "0.1em", textTransform: "uppercase" }}>Você está no ar</span>
                    <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)" }}>O estúdio abre em outra aba pra evitar interferência.</p>
                    <a href={`/live/${id}/transmitir`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                      <button className="um-btn-accent" style={{ height: "44px", padding: "0 24px", fontSize: "13px" }}>
                        Voltar pro estúdio →
                      </button>
                    </a>
                  </div>
                ) : (
                  <ViewerLiveNativa liveId={id} />
                )
              ) : ehAutor ? (
                <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#FFFFFF", textAlign: "center", padding: "24px", gap: "12px", background: "linear-gradient(135deg, #1F1F1F, #111111)" }}>
                  <span style={{ fontSize: "32px" }}>🎥</span>
                  <p style={{ fontSize: "16px", fontWeight: 700 }}>Pronto pra começar</p>
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>Abra o estúdio, configure câmera e microfone, e entre no ar.</p>
                  <a href={`/live/${id}/transmitir`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                    <button className="um-btn-accent" style={{ marginTop: "8px", height: "44px", padding: "0 24px", fontSize: "13px" }}>
                      Abrir estúdio →
                    </button>
                  </a>
                </div>
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.6)", textAlign: "center", padding: "24px", gap: "10px" }}>
                  <span style={{ fontSize: "28px" }}>⏳</span>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>Aguardando o transmissor</p>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>A live ainda não começou. Volte mais tarde.</p>
                </div>
              )
            ) : youtubeId ? (
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ width: "100%", height: "100%", border: "none" }}
              />
            ) : live.link ? (
              <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#FFFFFF", textAlign: "center", padding: "24px", gap: "12px" }}>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)" }}>Esta live acontece em uma plataforma externa.</p>
                <a href={live.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                  <button className="um-btn-accent" style={{ height: "44px", padding: "0 24px", fontSize: "13px" }}>
                    Entrar na live →
                  </button>
                </a>
              </div>
            ) : ehAutor ? (
              <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#FFFFFF", textAlign: "center", padding: "24px", gap: "12px", background: "linear-gradient(135deg, #1F1F1F, #111111)" }}>
                <span style={{ fontSize: "28px" }}>⚙️</span>
                <p style={{ fontSize: "15px", fontWeight: 700 }}>Falta o link da transmissão</p>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", maxWidth: "360px" }}>Edite a live e cole o link do Zoom, YouTube, IG Live ou Meet pra começar.</p>
                <a href="/lives" style={{ textDecoration: "none" }}>
                  <button className="um-btn-accent" style={{ marginTop: "8px", height: "44px", padding: "0 24px", fontSize: "13px" }}>
                    Voltar pra editar →
                  </button>
                </a>
              </div>
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.6)", textAlign: "center", padding: "24px", gap: "10px" }}>
                <span style={{ fontSize: "28px" }}>⏳</span>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>Esta live ainda não está disponível</p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", maxWidth: "320px" }}>O criador precisa configurar o link de transmissão. Volte mais tarde.</p>
              </div>
            )}
            {live.ao_vivo && (
              <span style={{ position: "absolute", top: "12px", left: "12px", background: "#FF5C2E", color: "#FFFFFF", padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", zIndex: 10 }}>
                🔴 Ao vivo
              </span>
            )}
          </div>

          <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "20px 24px", border: "1px solid rgba(0,0,0,0.05)", marginTop: "20px" }}>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#111111", letterSpacing: "-0.02em" }}>{live.titulo}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "12px" }}>
              <a href={`/morador/${live.autor_id}`} style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
                <Avatar name={live.autor?.nome ?? "?"} foto={live.autor?.foto_url ?? null} size={40} />
                <div>
                  <p style={{ fontSize: "14px", fontWeight: 700, color: "#111111" }}>{live.autor?.nome ?? "Morador"}</p>
                  {live.autor?.cidade && <p style={{ fontSize: "12px", color: "#A3A3A3" }}>{live.autor.cidade}</p>}
                </div>
              </a>
              <div style={{ marginLeft: "auto" }}>
                <BotaoCompartilhar texto={live.titulo} autor={live.autor?.nome} />
              </div>
            </div>
            {live.descricao && <p style={{ fontSize: "14px", color: "#525252", lineHeight: 1.6, marginTop: "14px", whiteSpace: "pre-wrap" }}>{live.descricao}</p>}
            {live.agendado_para && (
              <p style={{ fontSize: "12px", color: "#A3A3A3", marginTop: "10px" }}>
                📅 {new Date(live.agendado_para).toLocaleString("pt-BR", { dateStyle: "long", timeStyle: "short" })}
              </p>
            )}
          </div>

          {ehAutor && (
            <div style={{ background: "#111111", color: "#FFFFFF", borderRadius: "16px", padding: "20px 24px", marginTop: "20px" }}>
              <p style={{ fontSize: "11px", color: "#FF5C2E", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Painel do host</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginTop: "12px" }}>
                <div>
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Vendas</p>
                  <p style={{ fontSize: "22px", fontWeight: 800, marginTop: "2px" }}>{resumo.total_vendas}</p>
                </div>
                <div>
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Faturado</p>
                  <p style={{ fontSize: "22px", fontWeight: 800, marginTop: "2px" }}>R$ {resumo.total_valor.toFixed(2).replace(".", ",")}</p>
                </div>
                <div>
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Líquido</p>
                  <p style={{ fontSize: "22px", fontWeight: 800, color: "#FF5C2E", marginTop: "2px" }}>R$ {resumo.total_liquido.toFixed(2).replace(".", ",")}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: itens da live */}
        <aside>
          <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "20px", border: "1px solid rgba(0,0,0,0.05)", position: "sticky", top: "84px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111111" }}>Itens da live</h3>
              {ehAutor && (
                <button onClick={abrirVincular} className="um-btn-primary" style={{ height: "30px", padding: "0 12px", fontSize: "11px" }}>
                  + Vincular
                </button>
              )}
            </div>

            {itens.length === 0 ? (
              <p style={{ fontSize: "12px", color: "#A3A3A3", textAlign: "center", padding: "24px 0" }}>
                {ehAutor ? "Vincule produtos ou cursos pra vender durante a live." : "Nenhum item vinculado ainda."}
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {itens.map((item) => {
                  const nome = item.produto?.nome ?? item.curso?.titulo ?? "";
                  const preco = Number(item.produto?.preco ?? item.curso?.preco ?? 0);
                  const ehMeu = meuId === live.autor_id;
                  return (
                    <div key={item.id} style={{ background: "#F7F7F8", borderRadius: "12px", padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: item.produto ? "#FFF3EF" : "#E0F2FE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
                          {item.produto ? "🛒" : "📚"}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: "13px", fontWeight: 700, color: "#111111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nome}</p>
                          <p style={{ fontSize: "14px", fontWeight: 800, color: "#FF5C2E" }}>R$ {preco.toFixed(2).replace(".", ",")}</p>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {!ehMeu && (
                          <button
                            onClick={() => comprar(item)}
                            disabled={comprando === item.id}
                            className="um-btn-accent"
                            style={{ flex: 1, height: "34px", fontSize: "12px" }}
                          >
                            {comprando === item.id ? "..." : item.produto ? "Comprar" : "Matricular"}
                          </button>
                        )}
                        {ehAutor && (
                          <button onClick={() => desvincular(item.id)} className="um-btn-ghost" style={{ height: "34px", padding: "0 12px", fontSize: "11px" }}>
                            Remover
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </div>

      {modalVincular && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "24px" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "24px", maxWidth: "520px", width: "100%", display: "flex", flexDirection: "column", gap: "14px", maxHeight: "80vh" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#111111" }}>Vincular à live</h2>
              <button onClick={() => setModalVincular(false)} className="um-icon-btn" aria-label="Fechar">✕</button>
            </div>
            <div style={{ display: "flex", gap: "6px", borderBottom: "1px solid #F5F5F5" }}>
              {(["produtos", "cursos"] as const).map((aba) => (
                <button key={aba} onClick={() => setAbaVincular(aba)} style={{
                  padding: "10px 14px", background: "none", border: "none", cursor: "pointer",
                  fontSize: "12px", fontWeight: 700, color: abaVincular === aba ? "#111111" : "#A3A3A3",
                  borderBottom: abaVincular === aba ? "2px solid #FF5C2E" : "2px solid transparent",
                  fontFamily: "Inter, sans-serif",
                }}>
                  {aba === "produtos" ? "Produtos" : "Cursos"}
                </button>
              ))}
            </div>
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
              {abaVincular === "produtos" ? (
                produtosDisponiveis.length === 0 ? (
                  <p style={{ fontSize: "12px", color: "#A3A3A3", textAlign: "center", padding: "24px" }}>Você ainda não tem produtos.</p>
                ) : produtosDisponiveis.map((p) => (
                  <div key={p.id} onClick={() => vincularProduto(p.id)}
                    style={{ padding: "10px 12px", borderRadius: "10px", border: "1px solid #E5E5E5", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#F7F7F8")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <span style={{ fontSize: "18px" }}>🛒</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "13px", fontWeight: 700, color: "#111111" }}>{p.nome}</p>
                      <p style={{ fontSize: "11px", color: "#A3A3A3" }}>{p.categoria}</p>
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: 800, color: "#FF5C2E" }}>R$ {Number(p.preco).toFixed(2)}</span>
                  </div>
                ))
              ) : (
                cursosDisponiveis.length === 0 ? (
                  <p style={{ fontSize: "12px", color: "#A3A3A3", textAlign: "center", padding: "24px" }}>Você ainda não tem cursos.</p>
                ) : cursosDisponiveis.map((c) => (
                  <div key={c.id} onClick={() => vincularCurso(c.id)}
                    style={{ padding: "10px 12px", borderRadius: "10px", border: "1px solid #E5E5E5", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#F7F7F8")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <span style={{ fontSize: "18px" }}>📚</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "13px", fontWeight: 700, color: "#111111" }}>{c.titulo}</p>
                      <p style={{ fontSize: "11px", color: "#A3A3A3" }}>{c.nivel}</p>
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: 800, color: "#FF5C2E" }}>R$ {Number(c.preco).toFixed(2)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
