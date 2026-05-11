const STATS = [
  { value: "6", label: "criadores ativos", emoji: "👥" },
  { value: "3+", label: "produtos publicados", emoji: "🛍️" },
  { value: "R$ 4.8k", label: "em transações", emoji: "💰" },
  { value: "100%", label: "satisfação", emoji: "⭐" },
];

const TESTIMONIALS = [
  {
    name: "Rafaela M.",
    role: "Designer UI/UX",
    initials: "RM",
    color: "#EC4899",
    quote: "Finalmente uma plataforma que me deixa vender meus templates E criar cursos em um só lugar. Antes eu ficava pulando entre 4 ferramentas diferentes. No Urban, tudo tá integrado.",
    earned: "R$ 2.800",
    period: "primeiro mês",
  },
  {
    name: "Marcos T.",
    role: "Professor de Marketing",
    initials: "MT",
    color: "#3B82F6",
    quote: "Coloquei meu primeiro curso no ar em 2 horas. A plataforma é simples, o suporte em português faz diferença e a taxa de 10% só quando vendo é honesta. Recomendo pra qualquer professor.",
    earned: "R$ 1.200",
    period: "na primeira semana",
  },
  {
    name: "Juliana F.",
    role: "Criadora de Conteúdo",
    initials: "JF",
    color: "#FF5C2E",
    quote: "O Urban Score me motivou a postar mais. Subi do Bronze pro Gold em 3 semanas só criando conteúdo de valor. É diferente de qualquer plataforma que já usei — parece uma cidade de verdade.",
    earned: "Gold tier",
    period: "em 3 semanas",
  },
];

export default function SocialProof() {
  return (
    <section style={{ background: "#FFFFFF", padding: "100px 24px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#FF5C2E", marginBottom: "12px" }}>
            Resultados reais
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
            Criadores que já{" "}
            <span style={{ color: "#FF5C2E" }}>estão na cidade</span>
          </h2>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            marginBottom: "64px",
          }}
        >
          {STATS.map(({ value, label, emoji }) => (
            <div
              key={label}
              className="um-card"
              style={{ padding: "24px", textAlign: "center" }}
            >
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>{emoji}</div>
              <div style={{ fontSize: "32px", fontWeight: 900, color: "#111111", letterSpacing: "-0.04em", marginBottom: "6px" }}>{value}</div>
              <div style={{ fontSize: "13px", color: "#A3A3A3", fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Testimonials grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
          {TESTIMONIALS.map(({ name, role, initials, color, quote, earned, period }) => (
            <div
              key={name}
              className="um-card"
              style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {/* Stars */}
              <div style={{ display: "flex", gap: "3px" }}>
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill="#F59E0B"><path d="M8 1l1.9 3.9L14 5.6l-3 2.9.7 4.1L8 10.5l-3.7 2.1.7-4.1L2 5.6l4.1-.7L8 1z" /></svg>
                ))}
              </div>

              {/* Quote */}
              <blockquote
                style={{
                  fontSize: "14px",
                  color: "#262626",
                  lineHeight: 1.7,
                  margin: 0,
                  fontStyle: "italic",
                  flex: 1,
                }}
              >
                &ldquo;{quote}&rdquo;
              </blockquote>

              {/* Footer */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "16px", borderTop: "1px solid #F5F5F5" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: `${color}18`,
                      border: `2px solid ${color}30`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "13px",
                      fontWeight: 800,
                      color: color,
                    }}
                  >
                    {initials}
                  </div>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 700, color: "#111111" }}>{name}</p>
                    <p style={{ fontSize: "11px", color: "#A3A3A3" }}>{role}</p>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "14px", fontWeight: 800, color: "#111111" }}>{earned}</p>
                  <p style={{ fontSize: "11px", color: "#A3A3A3" }}>{period}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
