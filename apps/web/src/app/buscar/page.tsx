"use client";

import { useState, useEffect, useCallback } from "react";
import Avatar from "@/components/ui/Avatar";
import ScoreBadge from "@/components/ui/ScoreBadge";
import BotaoConvite from "@/components/ui/BotaoConvite";
import { todosMoradores, buscarLojasComBusca, todosBairrosComContagem, minhasConexoesIds, conectarCom, desconectarDe, type BairroComContagem } from "@/lib/queries";

interface Morador {
  id: string;
  nome: string;
  cidade: string | null;
  estado: string | null;
  pais: string | null;
  urban_score: number;
  ocupacao: string | null;
  foto_url: string | null;
}

interface Loja {
  id: string;
  nome: string;
  descricao: string | null;
  total_vendas: number;
  dono_id: string;
  dono: { id: string; nome: string; foto_url: string | null; cidade: string | null } | null;
}

type Aba = "pessoas" | "empresas" | "grupos";

export default function BuscarPage() {
  const [aba, setAba] = useState<Aba>("pessoas");
  const [busca, setBusca] = useState("");
  const [moradores, setMoradores] = useState<Morador[]>([]);
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [bairros, setBairros] = useState<BairroComContagem[]>([]);
  const [conexoes, setConexoes] = useState<Set<string>>(new Set());
  const [carregando, setCarregando] = useState(true);
  const [acao, setAcao] = useState<string | null>(null);

  const carregar = useCallback(async (termo = "") => {
    setCarregando(true);
    const [m, l, b, c] = await Promise.all([
      todosMoradores(termo),
      buscarLojasComBusca(termo),
      todosBairrosComContagem(termo),
      minhasConexoesIds(),
    ]);
    setMoradores(m as Morador[]);
    setLojas(l as Loja[]);
    setBairros(b);
    setConexoes(c);
    setCarregando(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  useEffect(() => {
    const t = setTimeout(() => carregar(busca), 300);
    return () => clearTimeout(t);
  }, [busca, carregar]);

  async function toggleConexao(id: string) {
    const jaConectado = conexoes.has(id);
    setAcao(id);
    setConexoes((prev) => {
      const nova = new Set(prev);
      if (jaConectado) nova.delete(id); else nova.add(id);
      return nova;
    });
    try {
      if (jaConectado) await desconectarDe(id);
      else await conectarCom(id);
    } catch {
      setConexoes((prev) => {
        const nova = new Set(prev);
        if (jaConectado) nova.add(id); else nova.delete(id);
        return nova;
      });
    } finally {
      setAcao(null);
    }
  }

  const totalResultados = moradores.length + lojas.length + bairros.length;

  return (
    <div style={{ minHeight: "100vh", background: "#F7F7F8", fontFamily: "Inter, sans-serif" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <a href="/feed" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
              <img src="/logo.svg" alt="Urban Members" width={32} height={32} />
              <span style={{ fontSize: "15px", fontWeight: 800, color: "#111111" }}>Urban Members</span>
            </a>
            <span style={{ fontSize: "13px", color: "#A3A3A3", margin: "0 4px" }}>/</span>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#525252" }}>Buscar</span>
          </div>
          <BotaoConvite variant="ghost" />
        </div>
      </header>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 24px 80px" }}>

        <div style={{ marginBottom: "20px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111111", letterSpacing: "-0.03em" }}>Buscar na cidade</h1>
          <p style={{ fontSize: "14px", color: "#A3A3A3", marginTop: "4px" }}>Encontre pessoas, empresas e grupos que combinam com você.</p>
        </div>

        {/* Campo de busca */}
        <div style={{ position: "relative", marginBottom: "20px" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A3A3A3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, cidade, ocupação..."
            style={{
              width: "100%", height: "52px", paddingLeft: "44px", paddingRight: "16px",
              background: "#FFFFFF", border: "1px solid #E5E5E5",
              borderRadius: "14px", fontSize: "14px",
              fontFamily: "Inter, sans-serif", color: "#111111",
              outline: "none", boxSizing: "border-box",
            }}
          />
        </div>

        {/* Abas */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "20px", borderBottom: "1px solid #E5E5E5", overflowX: "auto" }}>
          {([
            { id: "pessoas"  as const, label: "👤 Pessoas",  count: moradores.length },
            { id: "empresas" as const, label: "🏪 Empresas", count: lojas.length     },
            { id: "grupos"   as const, label: "🏘️ Grupos",   count: bairros.length   },
          ]).map((t) => (
            <button key={t.id} onClick={() => setAba(t.id)} style={{
              padding: "12px 18px",
              background: "none", border: "none", cursor: "pointer",
              fontSize: "13px", fontWeight: 700,
              color: aba === t.id ? "#111111" : "#A3A3A3",
              borderBottom: aba === t.id ? "2px solid #FF5C2E" : "2px solid transparent",
              fontFamily: "Inter, sans-serif", whiteSpace: "nowrap",
              transition: "all 0.15s",
            }}>
              {t.label} {t.count > 0 && <span style={{ color: "#FF5C2E", marginLeft: "4px" }}>{t.count}</span>}
            </button>
          ))}
        </div>

        {/* Resultados */}
        {carregando ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#A3A3A3" }}>Buscando...</div>
        ) : totalResultados === 0 ? (
          <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "48px 24px", textAlign: "center", border: "1px solid rgba(0,0,0,0.05)" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", margin: "0 auto 14px" }}>🔍</div>
            <p style={{ fontSize: "15px", fontWeight: 700, color: "#111111" }}>Nada encontrado</p>
            <p style={{ fontSize: "13px", color: "#A3A3A3", marginTop: "6px" }}>{busca ? `Nenhum resultado para "${busca}".` : "Tente buscar por nome, cidade ou tema."}</p>
          </div>
        ) : aba === "pessoas" ? (
          moradores.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#A3A3A3", textAlign: "center", padding: "32px" }}>Nenhuma pessoa encontrada.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
              {moradores.map((m) => {
                const conectado = conexoes.has(m.id);
                return (
                  <div key={m.id} style={{ background: "#FFFFFF", borderRadius: "16px", padding: "18px", border: "1px solid rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <a href={`/morador/${m.id}`} style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
                      <Avatar name={m.nome} foto={m.foto_url} size={44} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "14px", fontWeight: 700, color: "#111111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.nome}</p>
                        <p style={{ fontSize: "11px", color: "#A3A3A3" }}>{m.cidade || "Sem cidade"} · {m.ocupacao || "Morador"}</p>
                      </div>
                      <ScoreBadge score={m.urban_score} compact />
                    </a>
                    <button onClick={() => toggleConexao(m.id)} disabled={acao === m.id} style={{
                      height: "36px", padding: "0 16px",
                      background: conectado ? "#F5F5F5" : "#111111",
                      color: conectado ? "#111111" : "#FFFFFF",
                      border: conectado ? "1.5px solid #E5E5E5" : "none",
                      borderRadius: "999px", fontSize: "12px", fontWeight: 700,
                      cursor: "pointer", fontFamily: "Inter, sans-serif",
                    }}>
                      {acao === m.id ? "..." : conectado ? "✓ Conectado" : "Conectar"}
                    </button>
                  </div>
                );
              })}
            </div>
          )
        ) : aba === "empresas" ? (
          lojas.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#A3A3A3", textAlign: "center", padding: "32px" }}>Nenhuma empresa encontrada.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
              {lojas.map((l) => (
                <a key={l.id} href="/mercado" style={{ textDecoration: "none" }}>
                  <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "18px", border: "1px solid rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "10px", cursor: "pointer", height: "100%" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "#FFF3EF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🏪</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "14px", fontWeight: 700, color: "#111111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.nome}</p>
                        <p style={{ fontSize: "11px", color: "#A3A3A3" }}>por {l.dono?.nome ?? "Vendedor"}</p>
                      </div>
                    </div>
                    {l.descricao && <p style={{ fontSize: "12px", color: "#525252", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{l.descricao}</p>}
                    <div style={{ marginTop: "auto", paddingTop: "8px", borderTop: "1px solid #F5F5F5", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "11px", color: "#A3A3A3" }}>{l.total_vendas} vendas</span>
                      <span style={{ fontSize: "11px", color: "#FF5C2E", fontWeight: 700 }}>Ver loja →</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )
        ) : (
          // Grupos / Bairros
          bairros.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#A3A3A3", textAlign: "center", padding: "32px" }}>Nenhum grupo encontrado.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
              {bairros.map((b) => (
                <a key={b.id} href={`/bairros/${b.id}`} style={{ textDecoration: "none" }}>
                  <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "20px", border: "1px solid rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "10px", cursor: "pointer", height: "100%", transition: "transform 0.15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "linear-gradient(135deg, #FFF3EF, #FFD4C4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🏘️</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "15px", fontWeight: 700, color: "#111111" }}>{b.label}</p>
                        <p style={{ fontSize: "11px", color: "#A3A3A3" }}>{b.total_membros} {b.total_membros === 1 ? "morador" : "moradores"}</p>
                      </div>
                    </div>
                    {b.descricao && <p style={{ fontSize: "12px", color: "#525252", lineHeight: 1.5 }}>{b.descricao}</p>}
                    <div style={{ marginTop: "auto", paddingTop: "8px", borderTop: "1px solid #F5F5F5" }}>
                      <span style={{ fontSize: "11px", color: "#FF5C2E", fontWeight: 700 }}>Entrar no bairro →</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
