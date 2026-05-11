"use client";
import { useState, useEffect } from "react";

const STORAGE_KEY = "urban_onboarding_v1";

const STEPS = [
  {
    visual: "city" as const,
    title: "Bem-vindo à cidade digital",
    body: "Você entrou na primeira cidade digital brasileira. Aqui criadores ganham com o que sabem, criam e vendem — sem mensalidade.",
    cta: "Conhecer a cidade",
  },
  {
    visual: "features" as const,
    title: "Tudo que você precisa",
    body: "Marketplace, cursos e lives com monetização em um só lugar. Você fica com 90% de cada venda.",
    features: [
      { icon: "🛍️", label: "Mercado", desc: "Venda produtos" },
      { icon: "📚", label: "Cursos", desc: "Ensine e monetize" },
      { icon: "🎬", label: "Lives", desc: "Ganhe ao vivo" },
    ],
    cta: "Próximo",
  },
  {
    visual: "score" as const,
    title: "Urban Score",
    body: "Cada ação na plataforma aumenta seu score. Suba de nível e ganhe visibilidade premium e oportunidades exclusivas.",
    levels: ["Starter", "Resident", "Builder", "Leader", "Legend"],
    cta: "Explorar a cidade",
  },
] as const;

export default function WelcomeModal() {
  const [passo, setPasso] = useState(0);
  const [visivel, setVisivel] = useState(false);
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const t = setTimeout(() => setVisivel(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  function avancar() {
    if (passo < STEPS.length - 1) {
      setPasso((p) => p + 1);
    } else {
      fechar();
    }
  }

  function fechar() {
    setSaindo(true);
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, "done");
      setVisivel(false);
      setSaindo(false);
    }, 300);
  }

  if (!visivel) return null;

  const step = STEPS[passo];
  const progresso = ((passo + 1) / STEPS.length) * 100;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Bem-vindo ao Urban Members"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        opacity: saindo ? 0 : 1,
        transition: "opacity 300ms ease",
      }}
      onClick={(e) => e.target === e.currentTarget && fechar()}
    >
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "24px",
          padding: "36px 32px 28px",
          maxWidth: "400px",
          width: "100%",
          boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
          transform: saindo ? "scale(0.95)" : "scale(1)",
          transition: "transform 300ms ease",
          position: "relative",
        }}
      >
        {/* Fechar */}
        <button
          onClick={fechar}
          aria-label="Fechar boas-vindas"
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            background: "#F5F5F5",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#737373",
            fontSize: "16px",
            fontFamily: "Inter, sans-serif",
          }}
        >
          ×
        </button>

        {/* Visual */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          {step.visual === "city" && (
            <div style={{ width: "72px", height: "72px", borderRadius: "20px", background: "linear-gradient(135deg, #FF5C2E, #CC3D1A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", margin: "0 auto 4px" }}>
              🏙️
            </div>
          )}

          {step.visual === "features" && (
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "4px" }}>
              {step.features.map(({ icon, label, desc }) => (
                <div key={label} style={{ flex: 1, background: "#F7F7F8", borderRadius: "14px", padding: "14px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: "24px", marginBottom: "6px" }}>{icon}</div>
                  <p style={{ fontSize: "12px", fontWeight: 700, color: "#111111", margin: "0 0 2px" }}>{label}</p>
                  <p style={{ fontSize: "11px", color: "#737373", margin: 0 }}>{desc}</p>
                </div>
              ))}
            </div>
          )}

          {step.visual === "score" && (
            <div style={{ margin: "0 auto 4px" }}>
              <div style={{ width: "72px", height: "72px", borderRadius: "20px", background: "linear-gradient(135deg, #F59E0B, #D97706)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", margin: "0 auto 16px" }}>
                🎮
              </div>
              <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                {step.levels.map((level, i) => (
                  <div key={level} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                    <div style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: i === 0 ? "#FF5C2E" : "#E5E5E5",
                    }} />
                    <span style={{ fontSize: "9px", color: i === 0 ? "#FF5C2E" : "#A3A3A3", fontWeight: 600 }}>{level}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Texto */}
        <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#111111", letterSpacing: "-0.03em", lineHeight: 1.2, marginBottom: "10px", textAlign: "center" }}>
          {step.title}
        </h2>
        <p style={{ fontSize: "14px", color: "#525252", lineHeight: 1.65, textAlign: "center", marginBottom: "28px" }}>
          {step.body}
        </p>

        {/* Barra de progresso */}
        <div style={{ height: "3px", background: "#F0F0F0", borderRadius: "999px", marginBottom: "20px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progresso}%`, background: "#FF5C2E", borderRadius: "999px", transition: "width 300ms ease" }} />
        </div>

        {/* CTA */}
        <button
          onClick={avancar}
          style={{
            width: "100%",
            height: "48px",
            background: "#FF5C2E",
            color: "#111111",
            border: "none",
            borderRadius: "14px",
            fontSize: "15px",
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
            letterSpacing: "-0.01em",
            transition: "opacity 150ms",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          {step.cta}
        </button>

        {/* Pular */}
        {passo < STEPS.length - 1 && (
          <button
            onClick={fechar}
            style={{
              width: "100%",
              marginTop: "10px",
              background: "none",
              border: "none",
              fontSize: "12px",
              color: "#A3A3A3",
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              padding: "6px",
            }}
          >
            Pular tour
          </button>
        )}

        {/* Indicadores de passo */}
        <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginTop: "14px" }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === passo ? "18px" : "6px",
                height: "6px",
                borderRadius: "999px",
                background: i === passo ? "#FF5C2E" : "#E5E5E5",
                transition: "width 300ms ease, background 300ms ease",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
