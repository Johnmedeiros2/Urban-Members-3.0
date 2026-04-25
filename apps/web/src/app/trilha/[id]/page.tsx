"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import BotaoConvite from "@/components/ui/BotaoConvite";
import { buscarTrilha, buscarAtomos, progressoTrilha, matricularTrilha, type Trilha, type Atomo } from "@/lib/queries";
import { createClient } from "@/lib/supabase";

export default function TrilhaPage() {
  const params = useParams();
  const id = params.id as string;

  const [trilha, setTrilha] = useState<Trilha | null>(null);
  const [atomos, setAtomos] = useState<Atomo[]>([]);
  const [progresso, setProgresso] = useState({ totalAtomos: 0, dominados: 0, em_progresso: 0, percentual: 0 });
  const [matriculado, setMatriculado] = useState(false);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    if (!id) return;
    setCarregando(true);
    const supabase = createClient();
    const [t, a, p, userData] = await Promise.all([
      buscarTrilha(id),
      buscarAtomos(id),
      progressoTrilha(id),
      supabase.auth.getUser(),
    ]);
    setTrilha(t);
    setAtomos(a);
    setProgresso(p);
    if (userData.data.user) {
      const { data: m } = await supabase
        .from("trilha_alunos")
        .select("trilha_id")
        .eq("trilha_id", id)
        .eq("aluno_id", userData.data.user.id)
        .maybeSingle();
      setMatriculado(!!m);
    }
    setCarregando(false);
  }, [id]);

  useEffect(() => { carregar(); }, [carregar]);

  async function handleMatricular() {
    try {
      await matricularTrilha(id);
      setMatriculado(true);
      await carregar();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro");
    }
  }

  if (carregando) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", color: "#A3A3A3" }}>Carregando trilha...</div>;
  if (!trilha) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>Trilha não encontrada</div>;

  return (
    <div style={{ minHeight: "100vh", background: "#F7F7F8", fontFamily: "Inter, sans-serif" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <a href="/trilhas" style={{ textDecoration: "none" }}>
              <button style={{ width: "36px", height: "36px", borderRadius: "999px", background: "#F5F5F5", border: "none", cursor: "pointer", fontSize: "14px" }}>←</button>
            </a>
            <a href="/feed" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
              <img src="/logo.svg" alt="Urban" width={32} height={32} />
              <span style={{ fontSize: "15px", fontWeight: 800, color: "#111111" }}>Urban Academy</span>
            </a>
          </div>
          <BotaoConvite variant="ghost" />
        </div>
      </header>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px 80px" }}>

        {/* Hero da trilha */}
        <div style={{ background: "#FFFFFF", borderRadius: "24px", padding: "32px", marginBottom: "24px", border: "1px solid rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            {trilha.publico_alvo && (
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#FF5C2E", background: "#FFF3EF", padding: "4px 10px", borderRadius: "999px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {trilha.publico_alvo}
              </span>
            )}
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#525252", background: "#F5F5F5", padding: "4px 10px", borderRadius: "999px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              {trilha.nivel}
            </span>
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111111", letterSpacing: "-0.03em", marginBottom: "8px" }}>{trilha.titulo}</h1>
          {trilha.descricao && <p style={{ fontSize: "14px", color: "#525252", lineHeight: 1.6, marginBottom: "20px" }}>{trilha.descricao}</p>}

          {matriculado && progresso.totalAtomos > 0 && (
            <div style={{ background: "#F7F7F8", borderRadius: "14px", padding: "16px 18px", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <p style={{ fontSize: "12px", fontWeight: 700, color: "#525252", textTransform: "uppercase", letterSpacing: "0.06em" }}>Seu progresso</p>
                <span style={{ fontSize: "18px", fontWeight: 800, color: "#111111" }}>{progresso.percentual}%</span>
              </div>
              <div style={{ background: "#E5E5E5", borderRadius: "999px", height: "6px", overflow: "hidden", marginBottom: "8px" }}>
                <div style={{ width: `${progresso.percentual}%`, height: "100%", background: "linear-gradient(90deg, #FF5C2E, #FF8C5A)", transition: "width 0.6s" }} />
              </div>
              <p style={{ fontSize: "11px", color: "#A3A3A3" }}>
                {progresso.dominados} dominados · {progresso.em_progresso} em progresso · {progresso.totalAtomos - progresso.dominados - progresso.em_progresso} pendentes
              </p>
            </div>
          )}

          {!matriculado ? (
            <button onClick={handleMatricular} style={{ height: "48px", padding: "0 24px", background: "#FF5C2E", color: "#FFFFFF", border: "none", borderRadius: "999px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
              Começar trilha grátis
            </button>
          ) : (
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <a href={`/trilha/${trilha.id}/atomo/${atomos[0]?.id}`} style={{ textDecoration: "none" }}>
                <button style={{ height: "44px", padding: "0 22px", background: "#111111", color: "#FFFFFF", border: "none", borderRadius: "999px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                  {progresso.dominados > 0 ? "Continuar trilha" : "Começar a primeira aula"}
                </button>
              </a>
            </div>
          )}
        </div>

        {/* Lista de átomos */}
        <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#111111", letterSpacing: "-0.02em", marginBottom: "16px" }}>
          Tópicos da trilha ({atomos.length})
        </h2>

        {atomos.length === 0 ? (
          <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "32px", textAlign: "center", border: "1px solid rgba(0,0,0,0.05)" }}>
            <p style={{ fontSize: "13px", color: "#A3A3A3" }}>Esta trilha ainda não tem tópicos publicados.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {atomos.map((a, i) => {
              const dominio = a.dominio_pct ?? 0;
              const status = dominio >= 80 ? "dominado" : dominio > 0 ? "em_progresso" : "pendente";
              const cor = status === "dominado" ? "#10B981" : status === "em_progresso" ? "#FF5C2E" : "#A3A3A3";

              return (
                <a key={a.id} href={matriculado ? `/trilha/${trilha.id}/atomo/${a.id}` : "#"} style={{ textDecoration: "none" }}
                  onClick={(e) => { if (!matriculado) { e.preventDefault(); handleMatricular(); } }}
                >
                  <div style={{ background: "#FFFFFF", borderRadius: "14px", padding: "14px 18px", display: "flex", alignItems: "center", gap: "14px", border: "1px solid rgba(0,0,0,0.05)", cursor: "pointer", transition: "transform 0.15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateX(2px)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "translateX(0)"; }}
                  >
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "50%",
                      background: cor, color: "#FFFFFF",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "12px", fontWeight: 800, flexShrink: 0,
                    }}>
                      {!matriculado ? "🔒" : status === "dominado" ? "✓" : i + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "14px", fontWeight: 700, color: "#111111" }}>{a.titulo}</p>
                      {a.descricao && <p style={{ fontSize: "12px", color: "#A3A3A3", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.descricao}</p>}
                      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "4px" }}>
                        <span style={{ fontSize: "10px", color: "#A3A3A3" }}>{a.tempo_estimado_min} min</span>
                        {a.nivel_bloom && <span style={{ fontSize: "10px", color: "#A3A3A3", textTransform: "capitalize" }}>· {a.nivel_bloom}</span>}
                        {matriculado && dominio > 0 && (
                          <span style={{ fontSize: "10px", color: cor, fontWeight: 700 }}>· {dominio}% domínio</span>
                        )}
                      </div>
                    </div>
                    <span style={{ color: "#A3A3A3", fontSize: "16px", flexShrink: 0 }}>→</span>
                  </div>
                </a>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
