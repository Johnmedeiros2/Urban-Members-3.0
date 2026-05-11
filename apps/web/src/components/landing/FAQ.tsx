"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "Quanto custa usar Urban?",
    a: "Grátis para criar conta e começar. Você paga apenas 10% quando vende — e só em vendas concluídas. Sem mensalidade, sem taxa de setup.",
  },
  {
    q: "Como recebo meu dinheiro?",
    a: "Transferência automática todo final de mês para sua conta bancária. Sem burocracia — você vende, nós transferimos.",
  },
  {
    q: "Posso vender de tudo?",
    a: "Produtos digitais, cursos, serviços e itens físicos. Proibido: itens ilegais e conteúdo protegido por direitos autorais sem autorização.",
  },
  {
    q: "Preciso de experiência para ensinar?",
    a: "Não. Se você sabe algo valioso, pode criar um curso. Nossa equipe pedagógica valida o conteúdo e a IA adapta o aprendizado para cada aluno.",
  },
  {
    q: "Como começar?",
    a: "",
    steps: [
      "Crie conta com Google (30 segundos)",
      "Complete seu perfil de criador",
      "Comece a criar e vender",
    ],
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" aria-label="Perguntas frequentes" style={{ background: "#F7F7F8", padding: "clamp(64px, 10vw, 100px) 24px" }}>
      <div style={{ maxWidth: "760px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#FF5C2E", marginBottom: "12px" }}>
            Dúvidas frequentes
          </p>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 900,
              color: "#111111",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}
          >
            Perguntas frequentes
          </h2>
        </div>

        {/* Accordion */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {FAQS.map(({ q, a, steps }, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className="um-card"
                style={{
                  overflow: "hidden",
                  border: isOpen ? "1px solid rgba(255,92,46,0.25)" : "1px solid rgba(0,0,0,0.06)",
                  transition: "border-color 200ms",
                }}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  style={{
                    width: "100%",
                    padding: "20px 24px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "16px",
                    textAlign: "left",
                    fontFamily: "Inter, sans-serif",
                  }}
                  aria-expanded={isOpen}
                >
                  <span
                    style={{
                      fontSize: "15px",
                      fontWeight: 700,
                      color: isOpen ? "#FF5C2E" : "#111111",
                      lineHeight: 1.4,
                      transition: "color 200ms",
                    }}
                  >
                    {q}
                  </span>
                  <span
                    style={{
                      flexShrink: 0,
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: isOpen ? "#FF5C2E" : "#F5F5F5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: isOpen ? "#fff" : "#525252",
                      transition: "background 200ms, transform 200ms",
                      transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </span>
                </button>

                {isOpen && (
                  <div style={{ padding: "0 24px 20px", borderTop: "1px solid rgba(255,92,46,0.1)" }}>
                    {a && (
                      <p style={{ fontSize: "14px", color: "#525252", lineHeight: 1.75, marginTop: "14px" }}>{a}</p>
                    )}
                    {steps && (
                      <ol style={{ marginTop: "14px", paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
                        {steps.map((step, idx) => (
                          <li key={idx} style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", color: "#525252" }}>
                            <span
                              style={{
                                width: "24px",
                                height: "24px",
                                borderRadius: "50%",
                                background: "#FF5C2E",
                                color: "#fff",
                                fontSize: "12px",
                                fontWeight: 800,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              {idx + 1}
                            </span>
                            <strong style={{ color: "#111111", fontWeight: 600 }}>{step}</strong>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div style={{ textAlign: "center", marginTop: "48px" }}>
          <p style={{ fontSize: "14px", color: "#A3A3A3", marginBottom: "16px" }}>
            Ainda tem dúvidas? Fale com a gente.
          </p>
          <a
            href="mailto:contato@urbanicsa.com"
            style={{ fontSize: "14px", fontWeight: 600, color: "#FF5C2E", textDecoration: "none" }}
            className="um-link"
          >
            contato@urbanicsa.com →
          </a>
        </div>
      </div>
    </section>
  );
}
