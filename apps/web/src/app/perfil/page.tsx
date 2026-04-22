"use client";

import { useEffect, useState } from "react";
import ScoreBadge from "@/components/ui/ScoreBadge";
import Avatar from "@/components/ui/Avatar";
import BotaoConvite from "@/components/ui/BotaoConvite";
import { createClient, supabaseConfigured } from "@/lib/supabase";
import { meusProdutos, meusCursos, minhasVendasResumo } from "@/lib/queries";

interface ProdutoMeu {
  id: string; nome: string; preco: number; categoria: string; total_vendas: number;
}

interface CursoMeu {
  id: string; titulo: string; preco: number; nivel: string; total_alunos: number;
}

interface LojaMinha {
  id: string; nome: string; total_vendas: number;
}

interface Resumo {
  total_recebido: number; total_vendas: number; ticket_medio: number; taxa_paga: number;
}

interface Perfil {
  nome: string;
  cidade: string;
  estado: string;
  pais: string;
  cidade_visita?: string | null;
  ocupacao?: string;
  urban_score: number;
  criado_em?: string;
}

const MOCK: Perfil = {
  nome: "João Medeiros",
  cidade: "São Paulo", estado: "São Paulo", pais: "Brasil",
  cidade_visita: "Lisboa · Portugal",
  ocupacao: "Empreendedor(a)",
  urban_score: 320,
  criado_em: "2026-01-01",
};

const stats = [
  { label: "Posts",    value: "24"  },
  { label: "Conexões", value: "138" },
  { label: "Bairros",  value: "3"   },
];

const recentPosts = [
  { id: 1, content: "Acabei de fechar meu primeiro negócio pelo Mercado Urbano. Esse lugar funciona de verdade.", time: "2h",  likes: 18 },
  { id: 2, content: "Quem mais está no bairro Negócios e quer conectar? Vamos trocar ideia sobre vendas digitais.", time: "1d", likes: 31 },
];

export default function Perfil() {
  const [perfil, setPerfil] = useState<Perfil>(MOCK);
  const [carregando, setCarregando] = useState(true);
  const [editando, setEditando] = useState(false);
  const [nomeEdit, setNomeEdit] = useState("");
  const [salvando, setSalvando] = useState(false);

  // Meu comércio
  const [minhaLoja, setMinhaLoja] = useState<LojaMinha | null>(null);
  const [produtos, setProdutos] = useState<ProdutoMeu[]>([]);
  const [cursos, setCursos] = useState<CursoMeu[]>([]);
  const [resumo, setResumo] = useState<Resumo>({ total_recebido: 0, total_vendas: 0, ticket_medio: 0, taxa_paga: 0 });

  useEffect(() => {
    async function carregar() {
      // 1. Tenta Supabase
      if (supabaseConfigured) {
        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data } = await supabase
              .from("perfis")
              .select("*")
              .eq("id", user.id)
              .single();
            if (data) {
              setPerfil(data as Perfil);
              setCarregando(false);
              return;
            }
          }
        } catch {}
      }
      // 2. Fallback: localStorage
      const stored = localStorage.getItem("urban_user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setPerfil({
            nome: parsed.name ?? MOCK.nome,
            cidade: parsed.location?.city ?? MOCK.cidade,
            estado: parsed.location?.state ?? MOCK.estado,
            pais: parsed.location?.country ?? MOCK.pais,
            cidade_visita: parsed.visitCity ?? null,
            ocupacao: parsed.biografia?.ocupacao ?? MOCK.ocupacao,
            urban_score: 10,
          });
        } catch {}
      }
      setCarregando(false);
    }
    carregar();

    // Carrega dados de comércio em paralelo
    (async () => {
      const [mp, mc, r] = await Promise.all([meusProdutos(), meusCursos(), minhasVendasResumo()]);
      setMinhaLoja(mp.loja as LojaMinha | null);
      setProdutos(mp.produtos as ProdutoMeu[]);
      setCursos(mc as CursoMeu[]);
      setResumo(r);
    })();
  }, []);

  async function salvarNome() {
    if (!nomeEdit.trim()) return;
    setSalvando(true);
    if (supabaseConfigured) {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("perfis").update({ nome: nomeEdit }).eq("id", user.id);
          setPerfil((p) => ({ ...p, nome: nomeEdit }));
        }
      } catch {}
    } else {
      setPerfil((p) => ({ ...p, nome: nomeEdit }));
    }
    setSalvando(false);
    setEditando(false);
  }

  if (carregando) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>
        <p style={{ fontSize: "14px", color: "#A3A3A3" }}>Carregando perfil...</p>
      </div>
    );
  }

  const anoEntrada = perfil.criado_em ? new Date(perfil.criado_em).getFullYear() : 2026;

  return (
    <div style={{ minHeight: "100vh", background: "#F7F7F8", fontFamily: "Inter, sans-serif" }}>

      {/* Header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}>
        <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 24px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img src="/logo.svg" alt="Urban Members" width={32} height={32} />
            <span style={{ fontSize: "15px", fontWeight: 800, letterSpacing: "-0.03em", color: "#111111" }}>Urban Members</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <BotaoConvite variant="ghost" />
            <ScoreBadge score={perfil.urban_score} compact />
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 24px 80px" }}>

        {/* Cartão de perfil */}
        <div style={{ background: "#FFFFFF", borderRadius: "20px", overflow: "hidden", marginTop: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.05)" }}>
          <div style={{ height: "120px", background: "#111111", position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 60%, rgba(255,92,46,0.25) 0%, transparent 60%)" }} />
          </div>
          <div style={{ padding: "0 24px 24px" }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: "-36px", marginBottom: "16px" }}>
              <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "linear-gradient(135deg, #FF5C2E, #FF8C5A)", border: "3px solid #FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                <span style={{ color: "#FFFFFF", fontSize: "26px", fontWeight: 800 }}>{perfil.nome.charAt(0).toUpperCase()}</span>
              </div>
              <button onClick={() => { setEditando(!editando); setNomeEdit(perfil.nome); }} style={{ height: "36px", padding: "0 20px", background: "#111111", color: "#FFFFFF", border: "none", borderRadius: "999px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                {editando ? "Cancelar" : "Editar perfil"}
              </button>
            </div>

            {/* Nome editável */}
            {editando ? (
              <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                <input value={nomeEdit} onChange={(e) => setNomeEdit(e.target.value)}
                  style={{ flex: 1, height: "40px", border: "1.5px solid #111111", borderRadius: "10px", padding: "0 12px", fontSize: "16px", fontWeight: 700, color: "#111111", outline: "none", fontFamily: "Inter, sans-serif" }} />
                <button onClick={salvarNome} disabled={salvando} style={{ height: "40px", padding: "0 18px", background: "#FF5C2E", color: "#FFFFFF", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                  {salvando ? "..." : "Salvar"}
                </button>
              </div>
            ) : (
              <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#111111", letterSpacing: "-0.03em" }}>{perfil.nome}</h1>
            )}

            {/* Localização atual */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#F5F5F5", borderRadius: "999px", padding: "5px 12px", marginTop: "6px" }}>
              <span style={{ fontSize: "12px" }}>📍</span>
              <span style={{ fontSize: "13px", color: "#525252", fontWeight: 500 }}>
                {perfil.cidade}{perfil.estado && perfil.estado !== perfil.cidade ? `, ${perfil.estado}` : ""} · {perfil.pais}
              </span>
            </div>

            {/* Cidade visitando */}
            {perfil.cidade_visita && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#FFF3EF", borderRadius: "999px", padding: "5px 12px", marginTop: "6px", marginLeft: "6px" }}>
                <span style={{ fontSize: "12px" }}>🗺️</span>
                <span style={{ fontSize: "13px", color: "#FF5C2E", fontWeight: 600 }}>
                  Visitando: {perfil.cidade_visita.split(" · ")[0]}
                </span>
              </div>
            )}

            {/* Tags */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "10px" }}>
              {perfil.ocupacao && (
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#FF5C2E", background: "#FFF3EF", padding: "3px 12px", borderRadius: "999px" }}>
                  {perfil.ocupacao}
                </span>
              )}
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#525252", background: "#F5F5F5", padding: "3px 12px", borderRadius: "999px" }}>
                Morador desde {anoEntrada}
              </span>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", marginTop: "20px", borderTop: "1px solid #F5F5F5", paddingTop: "20px" }}>
              {stats.map((s, i) => (
                <div key={s.label} style={{ flex: 1, textAlign: "center", borderRight: i < stats.length - 1 ? "1px solid #F5F5F5" : "none" }}>
                  <p style={{ fontSize: "20px", fontWeight: 800, color: "#111111", letterSpacing: "-0.03em" }}>{s.value}</p>
                  <p style={{ fontSize: "12px", color: "#A3A3A3", marginTop: "2px" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Urban Score */}
        <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "20px 24px", marginTop: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111111" }}>Urban Score</h3>
            <ScoreBadge score={perfil.urban_score} />
          </div>
          <div style={{ background: "#F5F5F5", borderRadius: "999px", height: "6px", overflow: "hidden" }}>
            <div style={{ width: `${Math.min((perfil.urban_score / 900) * 100, 100)}%`, height: "100%", background: "linear-gradient(90deg, #FF5C2E, #FF8C5A)", borderRadius: "999px" }} />
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            {[{ label: "Starter", pts: "0" }, { label: "Rising", pts: "100" }, { label: "Urban", pts: "300" }, { label: "Elite", pts: "600" }, { label: "Legend", pts: "900" }].map((tier) => {
              const ativo = (perfil.urban_score >= parseInt(tier.pts)) && (tier.label === "Legend" || perfil.urban_score < (["0","100","300","600","900"].map(Number)[["Starter","Rising","Urban","Elite","Legend"].indexOf(tier.label) + 1] ?? 9999));
              return (
                <div key={tier.label} style={{ flex: 1, textAlign: "center", padding: "8px 4px", borderRadius: "10px", background: ativo ? "#111111" : "#F5F5F5" }}>
                  <p style={{ fontSize: "11px", fontWeight: 700, color: ativo ? "#FFFFFF" : "#A3A3A3" }}>{tier.label}</p>
                  <p style={{ fontSize: "10px", color: ativo ? "rgba(255,255,255,0.6)" : "#C4C4C4" }}>{tier.pts}pts</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Meu comércio — aparece apenas se tem loja ou cursos */}
        {(minhaLoja || cursos.length > 0) && (
          <div style={{ marginTop: "16px", background: "#FFFFFF", borderRadius: "20px", padding: "20px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111111" }}>Meu comércio</h3>
              <span style={{ fontSize: "11px", fontWeight: 600, color: "#FF5C2E", background: "#FFF3EF", padding: "3px 10px", borderRadius: "999px" }}>
                {resumo.total_vendas} vendas
              </span>
            </div>

            {/* Resumo financeiro */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
              <div style={{ background: "#F7F7F8", borderRadius: "12px", padding: "14px" }}>
                <p style={{ fontSize: "11px", color: "#A3A3A3", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Recebido</p>
                <p style={{ fontSize: "20px", fontWeight: 800, color: "#10B981", letterSpacing: "-0.03em", marginTop: "4px" }}>
                  R$ {resumo.total_recebido.toFixed(2).replace(".", ",")}
                </p>
              </div>
              <div style={{ background: "#F7F7F8", borderRadius: "12px", padding: "14px" }}>
                <p style={{ fontSize: "11px", color: "#A3A3A3", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Ticket médio</p>
                <p style={{ fontSize: "20px", fontWeight: 800, color: "#111111", letterSpacing: "-0.03em", marginTop: "4px" }}>
                  R$ {resumo.ticket_medio.toFixed(2).replace(".", ",")}
                </p>
              </div>
              <div style={{ background: "#F7F7F8", borderRadius: "12px", padding: "14px" }}>
                <p style={{ fontSize: "11px", color: "#A3A3A3", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Taxa Urban</p>
                <p style={{ fontSize: "20px", fontWeight: 800, color: "#FF5C2E", letterSpacing: "-0.03em", marginTop: "4px" }}>
                  R$ {resumo.taxa_paga.toFixed(2).replace(".", ",")}
                </p>
              </div>
            </div>

            {/* Loja e produtos */}
            {minhaLoja && produtos.length > 0 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                  <p style={{ fontSize: "12px", fontWeight: 700, color: "#525252" }}>{minhaLoja.nome} · Produtos</p>
                  <a href="/mercado" style={{ fontSize: "11px", color: "#A3A3A3", textDecoration: "none" }}>Gerenciar →</a>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {produtos.map((p, i) => {
                    const receita = p.total_vendas * Number(p.preco) * 0.9;
                    const maisVendido = i === 0 && p.total_vendas > 0;
                    return (
                      <div key={p.id} style={{
                        display: "flex", alignItems: "center", gap: "12px",
                        padding: "12px 14px", borderRadius: "12px",
                        background: maisVendido ? "#FFF3EF" : "#F7F7F8",
                        border: maisVendido ? "1px solid rgba(255,92,46,0.2)" : "1px solid transparent",
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <p style={{ fontSize: "13px", fontWeight: 700, color: "#111111" }}>{p.nome}</p>
                            {maisVendido && (
                              <span style={{ fontSize: "9px", fontWeight: 700, color: "#FF5C2E", background: "#FFFFFF", padding: "2px 6px", borderRadius: "999px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                                Mais vendido
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: "11px", color: "#A3A3A3", marginTop: "2px" }}>
                            {p.categoria} · R$ {Number(p.preco).toFixed(2).replace(".", ",")}
                          </p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ fontSize: "13px", fontWeight: 800, color: "#10B981" }}>R$ {receita.toFixed(2).replace(".", ",")}</p>
                          <p style={{ fontSize: "10px", color: "#A3A3A3" }}>{p.total_vendas} vendas</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Cursos */}
            {cursos.length > 0 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px", marginTop: minhaLoja ? "8px" : "0", paddingTop: minhaLoja ? "16px" : "0", borderTop: minhaLoja ? "1px solid #F5F5F5" : "none" }}>
                  <p style={{ fontSize: "12px", fontWeight: 700, color: "#525252" }}>Meus cursos</p>
                  <a href="/sala-de-aula" style={{ fontSize: "11px", color: "#A3A3A3", textDecoration: "none" }}>Gerenciar →</a>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {cursos.map((c, i) => {
                    const maisPopular = i === 0 && c.total_alunos > 0;
                    return (
                      <div key={c.id} style={{
                        display: "flex", alignItems: "center", gap: "12px",
                        padding: "12px 14px", borderRadius: "12px",
                        background: maisPopular ? "#F0FDF4" : "#F7F7F8",
                        border: maisPopular ? "1px solid rgba(16,185,129,0.2)" : "1px solid transparent",
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <p style={{ fontSize: "13px", fontWeight: 700, color: "#111111" }}>{c.titulo}</p>
                            {maisPopular && (
                              <span style={{ fontSize: "9px", fontWeight: 700, color: "#10B981", background: "#FFFFFF", padding: "2px 6px", borderRadius: "999px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                                Mais procurado
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: "11px", color: "#A3A3A3", marginTop: "2px" }}>
                            {c.nivel} · {c.preco > 0 ? `R$ ${Number(c.preco).toFixed(2)}` : "Gratuito"}
                          </p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ fontSize: "14px", fontWeight: 800, color: "#111111" }}>{c.total_alunos}</p>
                          <p style={{ fontSize: "10px", color: "#A3A3A3" }}>alunos</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CTA para abrir comércio caso não tenha nada */}
        {!minhaLoja && cursos.length === 0 && (
          <div style={{ marginTop: "16px", background: "#111111", borderRadius: "20px", padding: "24px", display: "flex", flexDirection: "column", gap: "14px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 80% 30%, rgba(255,92,46,0.15) 0%, transparent 60%)" }} />
            <div style={{ position: "relative" }}>
              <p style={{ fontSize: "11px", color: "#FF5C2E", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Comece a vender
              </p>
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#FFFFFF", marginTop: "4px" }}>
                Transforme seu conhecimento em renda.
              </h3>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 1.5, marginTop: "6px", marginBottom: "14px" }}>
                Abra sua loja ou crie um curso. Urban só ganha quando você ganhar.
              </p>
              <div style={{ display: "flex", gap: "8px" }}>
                <a href="/mercado" style={{ textDecoration: "none", flex: 1 }}>
                  <button style={{ width: "100%", height: "40px", background: "#FF5C2E", color: "#FFFFFF", border: "none", borderRadius: "999px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                    Abrir loja
                  </button>
                </a>
                <a href="/sala-de-aula" style={{ textDecoration: "none", flex: 1 }}>
                  <button style={{ width: "100%", height: "40px", background: "rgba(255,255,255,0.1)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "999px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                    Criar curso
                  </button>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Posts recentes */}
        <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111111" }}>Posts recentes</h3>
          {recentPosts.map((post) => (
            <div key={post.id} style={{ background: "#FFFFFF", borderRadius: "16px", padding: "16px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Avatar name={perfil.nome} size={36} />
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "#111111" }}>{perfil.nome}</p>
                  <p style={{ fontSize: "11px", color: "#A3A3A3" }}>{post.time}</p>
                </div>
              </div>
              <p style={{ fontSize: "14px", color: "#111111", lineHeight: 1.6 }}>{post.content}</p>
              <div style={{ display: "flex", gap: "16px", paddingTop: "8px", borderTop: "1px solid #F5F5F5" }}>
                <span style={{ fontSize: "12px", color: "#A3A3A3", fontWeight: 600 }}>♡ {post.likes}</span>
                <span style={{ fontSize: "12px", color: "#A3A3A3", fontWeight: 600 }}>Responder</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
