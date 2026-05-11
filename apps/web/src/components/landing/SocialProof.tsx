const STATS = [
  { value: "6", label: "criadores ativos", emoji: "👥" },
  { value: "3+", label: "produtos publicados", emoji: "🛍️" },
  { value: "R$ 4.8k", label: "em transações", emoji: "💰" },
  { value: "100%", label: "satisfação", emoji: "⭐" },
];

const TESTIMONIALS = [
  {
    name: "João Silva",
    role: "Designer",
    initials: "JS",
    color: "#EC4899",
    quote: "Vendi 12 templates em 2 meses. Recebi R$1.200 limpo. O processo de payment é automático. Muito bom!",
    earned: "R$ 1.200",
    period: "em 2 meses",
  },
  {
    name: "Maria Santos",
    role: "Professora",
    initials: "MS",
    color: "#3B82F6",
    quote: "Criei um curso de português para estrangeiros. 15 alunos inscritos, R$450 em vendas já. Urban funciona!",
    earned: "R$ 450",
    period: "primeiras vendas",
  },
  {
    name: "Carlos Oliveira",
    role: "Criador de Conteúdo",
    initials: "CO",
    color: "#FF5C2E",
    quote: "Fiz 3 lives esse mês. A monetização é simples. Já ganhei com super chats. Recomendo muito!",
    earned: "3 lives",
    period: "esse mês",
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
            <div key={label} className="um-card" style={{ padding: "24px", textAlign: "center" }}>
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
                  <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill="#F59E0B">
                    <path d="M8 1l1.9 3.9L14 5.6l-3 2.9.7 4.1L8 10.5l-3.7 2.1.7-4.1L2 5.6l4.1-.7L8 1z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <blockquote style={{ fontSize: "15px", color: "#262626", lineHeight: 1.7, margin: 0, flex: 1 }}>
                &ldquo;{quote}&rdquo;
              </blockquote>

              {/* Footer */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "16px", borderTop: "1px solid #F5F5F5" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      background: `${color}18`,
                      border: `2px solid ${color}30`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                      fontWeight: 800,
                      color: color,
                    }}
                  >
                    {initials}
                  </div>
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: 700, color: "#111111" }}>{name}</p>
                    <p style={{ fontSize: "12px", color: "#A3A3A3" }}>{role}</p>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "15px", fontWeight: 800, color: "#111111" }}>{earned}</p>
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
