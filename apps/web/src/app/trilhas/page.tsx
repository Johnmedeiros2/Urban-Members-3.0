"use client";

import { useState, useEffect, useCallback } from "react";
import BotaoConvite from "@/components/ui/BotaoConvite";
import AvatarMenu from "@/components/ui/AvatarMenu";
import { buscarTrilhas, type Trilha } from "@/lib/queries";

const AREA_COR: Record<string, { bg: string; cor: string; emoji: string }> = {
  matematica:   { bg: "#FFF3EF", cor: "#FF5C2E", emoji: "🔢" },
  portugues:    { bg: "#E0F2FE", cor: "#0369A1", emoji: "📝" },
  historia:     { bg: "#FEF3C7", cor: "#92400E", emoji: "🏛️" },
  geografia:    { bg: "#F0FDF4", cor: "#059669", emoji: "🌍" },
  fisica:       { bg: "#EDE9FE", cor: "#6D28D9", emoji: "⚛️" },
  quimica:      { bg: "#FFE4E6", cor: "#BE123C", emoji: "🧪" },
  biologia:     { bg: "#DCFCE7", cor: "#15803D", emoji: "🧬" },
  redacao:      { bg: "#F5F5F5", cor: "#525252", emoji: "✍️" },
  raciocinio:   { bg: "#F3E8FF", cor: "#7C3AED", emoji: "🧠" },
};

export default function TrilhasPage() {
  const [trilhas, setTrilhas] = useState<Trilha[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState<string>("todos");

  const carregar = useCallback(async () => {
    setCarregando(true);
    setTrilhas(await buscarTrilhas());
    setCarregando(false);
  }, []);

  useEffect(() => {
    carregar();
    const _t = setTimeout(() => setCarregando(false), 8000);
    return () => clearTimeout(_t);
  }, [carregar]);

  const publicos = ["todos", ...Array.from(new Set(trilhas.map((t) => t.publico_alvo).filter(Boolean) as string[]))];
  const filtradas = filtro === "todos" ? trilhas : trilhas.filter((t) => t.publico_alvo === filtro);

  return (
    <div style={{ minHeight: "100vh", background: "#F7F7F8", fontFamily: "Inter, sans-serif" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <a href="/feed" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
              <img src="/logo.svg" alt="Urban Members" width={32} height={32} />
              <span style={{ fontSize: "15px", fontWeight: 800, color: "#111111" }}>Urban Members</span>
            </a>
            <span style={{ fontSize: "13px", color: "#A3A3A3", margin: "0 4px" }}>/</span>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#525252" }}>Urban Academy</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <BotaoConvite variant="ghost" />
            <AvatarMenu size={32} />
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px 80px" }}>

        {/* Hero */}
        <div style={{ background: "linear-gradient(135deg, #111111, #1F1F1F)", borderRadius: "24px", padding: "40px 48px", marginBottom: "32px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 80% 50%, rgba(255,92,46,0.15) 0%, transparent 55%)" }} />
          <div style={{ position: "relative" }}>
            <p style={{ fontSize: "11px", color: "#FF5C2E", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px" }}>
              Urban Academy AI · Beta
            </p>
            <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.03em", lineHeight: 1.2, marginBottom: "12px", maxWidth: "600px" }}>
              Trilhas adaptativas com tutor de IA.
            </h1>
            <p style={{ fontSize: "15px", color: "#A3A3A3", lineHeight: 1.6, maxWidth: "600px" }}>
              Aprenda no seu ritmo. Cada trilha entende o que você sabe, identifica seus pontos fracos e te leva direto pro que importa. Validado por nossa equipe pedagógica.
            </p>
          </div>
        </div>

        {/* Filtros */}
        {publicos.length > 2 && (
          <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
            {publicos.map((p) => (
              <button key={p} onClick={() => setFiltro(p)}
                className={`um-chip ${filtro === p ? "active" : ""}`}
                style={{ height: "36px", padding: "0 16px", fontSize: "12px", textTransform: "capitalize" }}>
                {p === "todos" ? "Todas" : p}
              </button>
            ))}
          </div>
        )}

        {/* Lista */}
        {carregando ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#A3A3A3" }}>Carregando trilhas...</div>
        ) : filtradas.length === 0 ? (
          <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "48px 24px", textAlign: "center", border: "1px solid rgba(0,0,0,0.05)" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#FFF3EF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", margin: "0 auto 14px" }}>🎓</div>
            <p style={{ fontSize: "15px", fontWeight: 700, color: "#111111" }}>Trilhas chegando em breve</p>
            <p style={{ fontSize: "13px", color: "#A3A3A3", marginTop: "6px", maxWidth: "400px", margin: "6px auto 0" }}>
              A equipe pedagógica está produzindo as primeiras trilhas. Volte logo.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
            {filtradas.map((t) => {
              const cor = AREA_COR[t.area ?? ""] ?? { bg: "#F5F5F5", cor: "#525252", emoji: "📚" };
              return (
                <a key={t.id} href={`/trilha/${t.id}`} style={{ textDecoration: "none" }}>
                  <div className="um-card um-clickable" style={{ overflow: "hidden", display: "flex", flexDirection: "column", height: "100%" }}>
                    <div style={{ height: "100px", background: cor.bg, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                      <span style={{ fontSize: "44px" }}>{cor.emoji}</span>
                      {t.publico_alvo && (
                        <span style={{ position: "absolute", top: "12px", right: "12px", background: "#FFFFFF", color: cor.cor, fontSize: "10px", fontWeight: 700, padding: "3px 10px", borderRadius: "999px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                          {t.publico_alvo}
                        </span>
                      )}
                    </div>
                    <div style={{ padding: "18px 20px 20px", display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                      <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#111111", lineHeight: 1.3, letterSpacing: "-0.02em" }}>{t.titulo}</h3>
                      {t.descricao && (
                        <p style={{ fontSize: "12px", color: "#525252", lineHeight: 1.5 }}>{t.descricao}</p>
                      )}
                      <div style={{ marginTop: "auto", paddingTop: "10px", borderTop: "1px solid #F5F5F5", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "11px", color: "#A3A3A3", fontWeight: 600 }}>
                          {t.total_atomos} {t.total_atomos === 1 ? "tópico" : "tópicos"}
                        </span>
                        <span style={{ fontSize: "11px", color: cor.cor, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                          {t.nivel}
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}

        {/* Como funciona */}
        <div style={{ marginTop: "48px", background: "#FFFFFF", borderRadius: "20px", padding: "32px", border: "1px solid rgba(0,0,0,0.05)" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#111111", letterSpacing: "-0.02em", marginBottom: "20px" }}>Como funciona</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
            {[
              { num: "1", titulo: "Diagnóstico inicial", texto: "10-15 perguntas pra mapear o que você já sabe. Em 5 minutos, sabemos seu ponto de partida." },
              { num: "2", titulo: "Trilha personalizada", texto: "Pula o que já domina. Foca no que precisa. Caminho diferente pra cada aluno." },
              { num: "3", titulo: "Tutor IA 24/7", texto: "Não entendeu? Pergunta. A IA explica de outro jeito até clicar." },
              { num: "4", titulo: "Domínio comprovado", texto: "Só avança quando atinge 80% de acerto. Sem decoreba — entendeu de verdade." },
            ].map((passo) => (
              <div key={passo.num}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#FF5C2E", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 800, marginBottom: "12px" }}>
                  {passo.num}
                </div>
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111111" }}>{passo.titulo}</h3>
                <p style={{ fontSize: "12px", color: "#525252", lineHeight: 1.5, marginTop: "4px" }}>{passo.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
