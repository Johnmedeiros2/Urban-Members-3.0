"use client";

import { useState, useEffect, useCallback } from "react";
import Avatar from "@/components/ui/Avatar";
import ScoreBadge from "@/components/ui/ScoreBadge";
import BotaoConvite from "@/components/ui/BotaoConvite";
import AvatarMenu from "@/components/ui/AvatarMenu";
import { todosMoradores, minhasConexoesIds, conectarCom, desconectarDe } from "@/lib/queries";

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

export default function Moradores() {
  const [moradores, setMoradores] = useState<Morador[]>([]);
  const [conexoes, setConexoes] = useState<Set<string>>(new Set());
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [acao, setAcao] = useState<string | null>(null);

  const carregar = useCallback(async (termo = "") => {
    setCarregando(true);
    try {
      const [m, c] = await Promise.all([todosMoradores(termo), minhasConexoesIds()]);
      setMoradores(m as Morador[]);
      setConexoes(c);
    } catch {
      // falha silenciosa
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setBusca(q);
    else carregar();
  }, [carregar]);

  useEffect(() => {
    const t = setTimeout(() => carregar(busca), 300);
    return () => clearTimeout(t);
  }, [busca, carregar]);

  async function toggleConexao(id: string) {
    const jaConectado = conexoes.has(id);
    setAcao(id);
    // Otimista
    setConexoes((prev) => {
      const nova = new Set(prev);
      if (jaConectado) nova.delete(id); else nova.add(id);
      return nova;
    });
    try {
      if (jaConectado) await desconectarDe(id);
      else await conectarCom(id);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro");
      // Reverter
      setConexoes((prev) => {
        const nova = new Set(prev);
        if (jaConectado) nova.add(id); else nova.delete(id);
        return nova;
      });
    } finally {
      setAcao(null);
    }
  }

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
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#525252" }}>Moradores</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <BotaoConvite variant="ghost" />
            <AvatarMenu size={32} />
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 24px 80px" }}>

        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111111", letterSpacing: "-0.03em" }}>
            Moradores da cidade
          </h1>
          <p style={{ fontSize: "14px", color: "#A3A3A3", marginTop: "4px" }}>
            {moradores.length} {moradores.length === 1 ? "pessoa" : "pessoas"} esperando por você.
          </p>
        </div>

        <div style={{ marginBottom: "20px", display: "flex", gap: "12px" }}>
          <input
            type="text"
            placeholder="Buscar por nome ou cidade..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{
              flex: 1, height: "48px",
              border: "1.5px solid #E5E5E5", borderRadius: "999px",
              padding: "0 20px", fontSize: "14px", color: "#111111", outline: "none",
              fontFamily: "Inter, sans-serif", background: "#FFFFFF",
              transition: "border-color 150ms cubic-bezier(0.2, 0, 0, 1), box-shadow 150ms cubic-bezier(0.2, 0, 0, 1)",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "#FF5C2E"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,92,46,0.10)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "#E5E5E5"; e.currentTarget.style.boxShadow = "none"; }}
          />
        </div>

        {carregando ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#A3A3A3", fontSize: "14px" }}>
            Carregando moradores...
          </div>
        ) : moradores.length === 0 ? (
          <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "48px 24px", textAlign: "center", border: "1px solid rgba(0,0,0,0.05)" }}>
            <p style={{ fontSize: "15px", fontWeight: 700, color: "#111111" }}>
              {busca ? "Nenhum morador encontrado" : "Ainda não há outros moradores"}
            </p>
            <p style={{ fontSize: "13px", color: "#A3A3A3", marginTop: "6px" }}>
              {busca ? "Tente outro termo de busca." : "Convide alguém para a cidade!"}
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
            {moradores.map((m) => {
              const conectado = conexoes.has(m.id);
              return (
                <div key={m.id} className="um-card" style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <a href={`/morador/${m.id}`} style={{ textDecoration: "none", display: "flex", gap: "12px", alignItems: "center", flex: 1 }}>
                      <Avatar name={m.nome} foto={m.foto_url} size={48} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "14px", fontWeight: 700, color: "#111111" }}>{m.nome}</p>
                        <p style={{ fontSize: "12px", color: "#A3A3A3" }}>
                          {m.cidade ? `${m.cidade}${m.pais ? ` · ${m.pais}` : ""}` : "—"}
                        </p>
                      </div>
                    </a>
                    <ScoreBadge score={m.urban_score} compact />
                  </div>

                  {m.ocupacao && (
                    <span style={{ fontSize: "12px", color: "#525252", background: "#F5F5F5", padding: "3px 10px", borderRadius: "999px", alignSelf: "flex-start", fontWeight: 600 }}>
                      {m.ocupacao}
                    </span>
                  )}

                  <button
                    onClick={() => toggleConexao(m.id)}
                    disabled={acao === m.id}
                    className={conectado ? "um-btn-secondary" : "um-btn-accent"}
                    style={{ width: "100%", height: "38px", fontSize: "13px" }}
                  >
                    {acao === m.id ? "..." : conectado ? "✓ Conectado" : "Conectar"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
