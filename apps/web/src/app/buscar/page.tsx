"use client";

import { useState, useEffect, useCallback } from "react";
import Avatar from "@/components/ui/Avatar";
import ScoreBadge from "@/components/ui/ScoreBadge";
import BotaoConvite from "@/components/ui/BotaoConvite";
import { todosMoradores, buscarEmpresas, todosBairrosComContagem, minhasConexoesIds, conectarCom, desconectarDe, seguirEmpresa, meusSeguindoEmpresas, type BairroComContagem, type Empresa } from "@/lib/queries";

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

type Aba = "pessoas" | "empresas" | "grupos";

export default function BuscarPage() {
  const [aba, setAba] = useState<Aba>("pessoas");
  const [busca, setBusca] = useState("");
  const [moradores, setMoradores] = useState<Morador[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [bairros, setBairros] = useState<BairroComContagem[]>([]);
  const [conexoes, setConexoes] = useState<Set<string>>(new Set());
  const [seguindoEmpresas, setSeguindoEmpresas] = useState<Set<string>>(new Set());
  const [carregando, setCarregando] = useState(true);
  const [acao, setAcao] = useState<string | null>(null);

  const carregar = useCallback(async (termo = "") => {
    setCarregando(true);
    const [m, e, b, c, sE] = await Promise.all([
      todosMoradores(termo),
      buscarEmpresas(termo),
      todosBairrosComContagem(termo),
      minhasConexoesIds(),
      meusSeguindoEmpresas(),
    ]);
    setMoradores(m as Morador[]);
    setEmpresas(e);
    setBairros(b);
    setConexoes(c);
    setSeguindoEmpresas(sE);
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

  async function toggleSeguirEmpresa(id: string) {
    setAcao(id);
    try {
      const novo = await seguirEmpresa(id);
      setSeguindoEmpresas((prev) => {
        const nova = new Set(prev);
        if (novo) nova.add(id); else nova.delete(id);
        return nova;
      });
    } finally {
      setAcao(null);
    }
  }

  const totalResultados = moradores.length + empresas.length + bairros.length;

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
              transition: "border-color 150ms cubic-bezier(0.2, 0, 0, 1), box-shadow 150ms cubic-bezier(0.2, 0, 0, 1)",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "#FF5C2E"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,92,46,0.10)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "#E5E5E5"; e.currentTarget.style.boxShadow = "none"; }}
          />
        </div>

        {/* Abas */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "20px", borderBottom: "1px solid #E5E5E5", overflowX: "auto" }}>
          {([
            { id: "pessoas"  as const, label: "👤 Pessoas",  count: moradores.length },
            { id: "empresas" as const, label: "🏢 Empresas", count: empresas.length  },
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
                  <div key={m.id} className="um-card" style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <a href={`/morador/${m.id}`} style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
                      <Avatar name={m.nome} foto={m.foto_url} size={44} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "14px", fontWeight: 700, color: "#111111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.nome}</p>
                        <p style={{ fontSize: "11px", color: "#A3A3A3" }}>{m.cidade || "Sem cidade"} · {m.ocupacao || "Morador"}</p>
                      </div>
                      <ScoreBadge score={m.urban_score} compact />
                    </a>
                    <button onClick={() => toggleConexao(m.id)} disabled={acao === m.id}
                      className={conectado ? "um-btn-secondary" : "um-btn-accent"}
                      style={{ height: "36px", padding: "0 16px", fontSize: "12px" }}>
                      {acao === m.id ? "..." : conectado ? "✓ Conectado" : "Conectar"}
                    </button>
                  </div>
                );
              })}
            </div>
          )
        ) : aba === "empresas" ? (
          <>
            <div style={{ marginBottom: "16px", display: "flex", justifyContent: "flex-end" }}>
              <a href="/empresa/nova" style={{ textDecoration: "none" }}>
                <button className="um-btn-accent" style={{ height: "36px", padding: "0 16px", fontSize: "12px" }}>
                  + Cadastrar empresa
                </button>
              </a>
            </div>
            {empresas.length === 0 ? (
              <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "40px 24px", textAlign: "center", border: "1px solid rgba(0,0,0,0.05)" }}>
                <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#FFF3EF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", margin: "0 auto 14px" }}>🏢</div>
                <p style={{ fontSize: "15px", fontWeight: 700, color: "#111111" }}>Nenhuma empresa cadastrada</p>
                <p style={{ fontSize: "13px", color: "#A3A3A3", marginTop: "6px" }}>Seja o primeiro a cadastrar sua empresa na cidade.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
                {empresas.map((e) => {
                  const seguindo = seguindoEmpresas.has(e.id);
                  return (
                    <div key={e.id} className="um-card" style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "10px", height: "100%" }}>
                      <a href={`/empresa/${e.id}`} style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
                        {e.foto_url ? (
                          <img src={e.foto_url} alt={e.nome_fantasia} style={{ width: "44px", height: "44px", borderRadius: "10px", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "linear-gradient(135deg, #FF5C2E, #FF8C5A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", color: "#FFFFFF", fontWeight: 800 }}>
                            {e.nome_fantasia.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: "14px", fontWeight: 700, color: "#111111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.nome_fantasia}</p>
                          <p style={{ fontSize: "11px", color: "#A3A3A3" }}>{e.segmento || "Empresa"}{e.cidade ? ` · ${e.cidade}` : ""}</p>
                        </div>
                      </a>
                      {e.descricao && <p style={{ fontSize: "12px", color: "#525252", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{e.descricao}</p>}
                      <div style={{ marginTop: "auto", paddingTop: "10px", borderTop: "1px solid #F5F5F5", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "11px", color: "#A3A3A3" }}>{e.total_seguidores} {e.total_seguidores === 1 ? "seguidor" : "seguidores"}</span>
                        <button onClick={() => toggleSeguirEmpresa(e.id)} disabled={acao === e.id}
                          className={seguindo ? "um-btn-secondary" : "um-btn-accent"}
                          style={{ height: "30px", padding: "0 12px", fontSize: "11px" }}>
                          {acao === e.id ? "..." : seguindo ? "✓ Seguindo" : "Seguir"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          // Grupos / Bairros
          bairros.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#A3A3A3", textAlign: "center", padding: "32px" }}>Nenhum grupo encontrado.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
              {bairros.map((b) => (
                <a key={b.id} href={`/bairros/${b.id}`} style={{ textDecoration: "none" }}>
                  <div className="um-card um-clickable" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px", height: "100%" }}>
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
