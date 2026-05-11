"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "Quanto custa usar o Urban Members?",
    a: "Criar sua conta e usar a plataforma é completamente grátis. A Urban cobra apenas 10% de comissão sobre vendas concluídas — ou seja, você só paga quando ganha. Sem mensalidade, sem taxa de setup, sem pegadinha.",
  },
  {
    q: "Como recebo meu dinheiro?",
    a: "Os pagamentos são processados automaticamente. Quando uma venda é concluída, o valor (menos os 10% de comissão) fica disponível no seu saldo Urban Pay. Você pode solicitar transferência para sua conta bancária a qualquer momento.",
  },
  {
    q: "Posso vender qualquer tipo de produto?",
    a: "Sim! O marketplace aceita produtos digitais (ebooks, templates, presets, softwares), cursos e trilhas de aprendizado, serviços (consultoria, mentoria, freelance) e também produtos físicos. Desde que seja legal e dentro dos termos de uso.",
  },
  {
    q: "Como começar no Urban Members?",
    a: "É simples: 1️⃣ Crie sua conta grátis com Google (30 segundos). 2️⃣ Configure seu perfil e escolha seu bairro na cidade. 3️⃣ Publique seu primeiro produto, curso ou live. Pronto — você já é um morador ativo da cidade digital.",
  },
  {
    q: "O que é o Urban Score?",
    a: "Urban Score é nosso sistema de gamificação. Você ganha pontos por ações reais na plataforma — vender, criar conteúdo, completar cursos, fazer lives. Existem 5 tiers: Bronze → Silver → Gold → Platinum → Diamond. Moradores com score mais alto têm destaque na plataforma.",
  },
  {
    q: "Preciso ter muitos seguidores para começar?",
    a: "Não. O Urban é pensado para criadores em qualquer estágio. A plataforma oferece descoberta orgânica pelo marketplace e pelos bairros temáticos — você pode vender para moradores que ainda não te conhecem, desde o primeiro dia.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" style={{ background: "#F7F7F8", padding: "100px 24px" }}>
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
          {FAQS.map(({ q, a }, i) => {
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
                    <p style={{ fontSize: "14px", color: "#525252", lineHeight: 1.75, marginTop: "14px" }}>{a}</p>
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
