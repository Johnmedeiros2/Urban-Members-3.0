"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import ScoreBadge from "@/components/ui/ScoreBadge";
import BotaoConvite from "@/components/ui/BotaoConvite";
import { buscarMorador, contagemConexoes, conectarCom, desconectarDe, minhasConexoesIds } from "@/lib/queries";
import { createClient } from "@/lib/supabase";

interface Perfil {
  id: string;
  nome: string;
  cidade: string | null;
  estado: string | null;
  pais: string | null;
  cidade_visita: string | null;
  ocupacao: string | null;
  urban_score: number;
  foto_url: string | null;
  criado_em: string;
}

interface PostPublico {
  id: string;
  conteudo: string;
  criado_em: string;
  total_curtidas: number;
  bairro_id: string;
}

interface Loja {
  id: string;
  nome: string;
  total_vendas: number;
}

export default function PerfilPublico() {
  const params = useParams();
  const id = params.id as string;

  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [contagem, setContagem] = useState({ seguidores: 0, seguindo: 0 });
  const [conectado, setConectado] = useState(false);
  const [acao, setAcao] = useState(false);
  const [posts, setPosts] = useState<PostPublico[]>([]);
  const [souEu, setSouEu] = useState(false);
  const [loja, setLoja] = useState<Loja | null>(null);
  const [temCursos, setTemCursos] = useState(false);

  const carregar = useCallback(async () => {
    if (!id) return;
    setCarregando(true);
    const supabase = createClient();
    const [m, c, conn, userData, postsRes, lojaRes, cursosRes] = await Promise.all([
      buscarMorador(id),
      contagemConexoes(id),
      minhasConexoesIds(),
      supabase.auth.getUser(),
      supabase.from("posts").select("*").eq("autor_id", id).order("criado_em", { ascending: false }).limit(10),
      supabase.from("lojas").select("id, nome, total_vendas").eq("dono_id", id).maybeSingle(),
      supabase.from("cursos").select("id", { count: "exact", head: true }).eq("instrutor_id", id),
    ]);
    setPerfil(m as Perfil | null);
    setContagem(c);
    setConectado(conn.has(id));
    setSouEu(userData.data.user?.id === id);
    setPosts((postsRes.data as PostPublico[]) ?? []);
    setLoja(lojaRes.data as Loja | null);
    setTemCursos((cursosRes.count ?? 0) > 0);
    setCarregando(false);
  }, [id]);

  useEffect(() => { carregar(); }, [carregar]);

  async function toggleConexao() {
    setAcao(true);
    try {
      if (conectado) {
        await desconectarDe(id);
        setConectado(false);
        setContagem((c) => ({ ...c, seguidores: c.seguidores - 1 }));
      } else {
        await conectarCom(id);
        setConectado(true);
        setContagem((c) => ({ ...c, seguidores: c.seguidores + 1 }));
      }
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro");
    } finally {
      setAcao(false);
    }
  }

  if (carregando) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", color: "#A3A3A3", fontSize: "14px" }}>
        Carregando perfil...
      </div>
    );
  }

  if (!perfil) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", flexDirection: "column", gap: "12px" }}>
        <p style={{ fontSize: "16px", fontWeight: 700 }}>Morador não encontrado</p>
        <a href="/moradores" style={{ fontSize: "13px", color: "#FF5C2E" }}>Voltar para Moradores</a>
      </div>
    );
  }

  const anoEntrada = new Date(perfil.criado_em).getFullYear();

  return (
    <div style={{ minHeight: "100vh", background: "#F7F7F8", fontFamily: "Inter, sans-serif" }}>

      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 24px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <a href="/moradores" style={{ textDecoration: "none" }}>
              <button style={{ width: "36px", height: "36px", borderRadius: "999px", background: "#F5F5F5", border: "none", cursor: "pointer", fontSize: "14px" }}>←</button>
            </a>
            <a href="/feed" style={{ textDecoration: "none" }}>
              <img src="/logo.svg" alt="Urban Members" width={32} height={32} />
            </a>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#111111" }}>{perfil.nome}</span>
          </div>
          <BotaoConvite variant="ghost" />
        </div>
      </header>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 24px 80px" }}>

        {/* Cartão de perfil */}
        <div style={{ background: "#FFFFFF", borderRadius: "20px", marginTop: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.05)" }}>
          <div style={{ height: "100px", background: "#111111", position: "relative", borderRadius: "20px 20px 0 0", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 60%, rgba(255,92,46,0.3) 0%, transparent 60%)" }} />
          </div>

          <div style={{ padding: "0 24px 24px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginTop: "-48px", marginBottom: "20px" }}>
              {perfil.foto_url ? (
                <img src={perfil.foto_url} alt={perfil.nome}
                  style={{ width: "96px", height: "96px", borderRadius: "50%", border: "4px solid #FFFFFF", objectFit: "cover", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", display: "block" }} />
              ) : (
                <div style={{ width: "96px", height: "96px", borderRadius: "50%", background: "linear-gradient(135deg, #FF5C2E, #FF8C5A)", border: "4px solid #FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                  <span style={{ color: "#FFFFFF", fontSize: "34px", fontWeight: 800 }}>{perfil.nome.charAt(0).toUpperCase()}</span>
                </div>
              )}

              {!souEu && (
                <div style={{ display: "flex", gap: "8px", marginTop: "56px" }}>
                  <button onClick={toggleConexao} disabled={acao} style={{
                    height: "38px", padding: "0 20px",
                    background: conectado ? "#F5F5F5" : "#111111",
                    color: conectado ? "#111111" : "#FFFFFF",
                    border: conectado ? "1.5px solid #E5E5E5" : "none",
                    borderRadius: "999px", fontSize: "13px", fontWeight: 700,
                    cursor: "pointer", fontFamily: "Inter, sans-serif",
                  }}>
                    {acao ? "..." : conectado ? "✓ Conectado" : "Conectar"}
                  </button>
                </div>
              )}
              {souEu && (
                <a href="/perfil" style={{ textDecoration: "none", marginTop: "56px" }}>
                  <button style={{ height: "38px", padding: "0 20px", background: "#111111", color: "#FFFFFF", border: "none", borderRadius: "999px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                    Editar perfil
                  </button>
                </a>
              )}
            </div>

            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#111111", letterSpacing: "-0.03em" }}>{perfil.nome}</h1>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>
              {perfil.cidade && (
                <span style={{ fontSize: "13px", color: "#525252", background: "#F5F5F5", padding: "5px 12px", borderRadius: "999px", fontWeight: 500 }}>
                  📍 {perfil.cidade}{perfil.pais ? ` · ${perfil.pais}` : ""}
                </span>
              )}
              {perfil.cidade_visita && (
                <span style={{ fontSize: "13px", color: "#FF5C2E", background: "#FFF3EF", padding: "5px 12px", borderRadius: "999px", fontWeight: 600 }}>
                  🗺️ Visitando: {perfil.cidade_visita.split(" · ")[0]}
                </span>
              )}
              {perfil.ocupacao && (
                <span style={{ fontSize: "13px", color: "#111111", background: "#F5F5F5", padding: "5px 12px", borderRadius: "999px", fontWeight: 600 }}>
                  {perfil.ocupacao}
                </span>
              )}
              <span style={{ fontSize: "13px", color: "#A3A3A3", background: "#F5F5F5", padding: "5px 12px", borderRadius: "999px" }}>
                Morador desde {anoEntrada}
              </span>
            </div>

            {/* CTAs contextuais — só aparecem se tem loja ou cursos */}
            {!souEu && (loja || temCursos) && (
              <div style={{ display: "flex", gap: "10px", marginTop: "16px", flexWrap: "wrap" }}>
                {loja && (
                  <a href="/mercado" style={{ textDecoration: "none", flex: 1, minWidth: "200px" }}>
                    <div style={{
                      background: "#F7F7F8", borderRadius: "14px",
                      padding: "12px 16px",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      cursor: "pointer", transition: "background 0.15s",
                      border: "1px solid transparent",
                    }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#F0F0F0"; e.currentTarget.style.borderColor = "#E5E5E5"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "#F7F7F8"; e.currentTarget.style.borderColor = "transparent"; }}
                    >
                      <div>
                        <p style={{ fontSize: "11px", color: "#A3A3A3", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                          Loja no Mercado
                        </p>
                        <p style={{ fontSize: "14px", fontWeight: 700, color: "#111111", marginTop: "2px" }}>
                          {loja.nome}
                        </p>
                      </div>
                      <span style={{ fontSize: "14px", color: "#A3A3A3" }}>→</span>
                    </div>
                  </a>
                )}
                {temCursos && (
                  <a href="/sala-de-aula" style={{ textDecoration: "none", flex: 1, minWidth: "200px" }}>
                    <div style={{
                      background: "#F7F7F8", borderRadius: "14px",
                      padding: "12px 16px",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      cursor: "pointer", transition: "background 0.15s",
                      border: "1px solid transparent",
                    }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#F0F0F0"; e.currentTarget.style.borderColor = "#E5E5E5"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "#F7F7F8"; e.currentTarget.style.borderColor = "transparent"; }}
                    >
                      <div>
                        <p style={{ fontSize: "11px", color: "#A3A3A3", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                          Ensina na cidade
                        </p>
                        <p style={{ fontSize: "14px", fontWeight: 700, color: "#111111", marginTop: "2px" }}>
                          Ver cursos
                        </p>
                      </div>
                      <span style={{ fontSize: "14px", color: "#A3A3A3" }}>→</span>
                    </div>
                  </a>
                )}
              </div>
            )}

            {/* Stats */}
            <div style={{ display: "flex", marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #F5F5F5" }}>
              <div style={{ flex: 1, textAlign: "center", borderRight: "1px solid #F5F5F5" }}>
                <p style={{ fontSize: "20px", fontWeight: 800, color: "#111111" }}>{contagem.seguidores}</p>
                <p style={{ fontSize: "12px", color: "#A3A3A3" }}>Conexões</p>
              </div>
              <div style={{ flex: 1, textAlign: "center", borderRight: "1px solid #F5F5F5" }}>
                <p style={{ fontSize: "20px", fontWeight: 800, color: "#111111" }}>{contagem.seguindo}</p>
                <p style={{ fontSize: "12px", color: "#A3A3A3" }}>Seguindo</p>
              </div>
              <div style={{ flex: 1, textAlign: "center" }}>
                <ScoreBadge score={perfil.urban_score} />
              </div>
            </div>
          </div>
        </div>

        {/* Posts */}
        <div style={{ marginTop: "16px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111111", marginBottom: "12px" }}>Posts</h3>
          {posts.length === 0 ? (
            <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "24px", textAlign: "center", border: "1px solid rgba(0,0,0,0.05)" }}>
              <p style={{ fontSize: "13px", color: "#A3A3A3" }}>Ainda não publicou nada na cidade.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {posts.map((p) => (
                <div key={p.id} style={{ background: "#FFFFFF", borderRadius: "16px", padding: "16px 20px", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "11px", color: "#FF5C2E", background: "#FFF3EF", padding: "2px 8px", borderRadius: "999px", fontWeight: 600 }}>
                      {p.bairro_id}
                    </span>
                    <span style={{ fontSize: "11px", color: "#A3A3A3" }}>
                      {new Date(p.criado_em).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <p style={{ fontSize: "14px", color: "#111111", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{p.conteudo}</p>
                  <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #F5F5F5" }}>
                    <span style={{ fontSize: "12px", color: "#A3A3A3", fontWeight: 600 }}>♡ {p.total_curtidas}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
