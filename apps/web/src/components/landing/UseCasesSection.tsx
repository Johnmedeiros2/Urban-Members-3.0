const PERSONAS = [
  {
    emoji: "🎨",
    role: "Designer Gráfico",
    name: "Para designers",
    description: "Venda seus templates e designs.",
    highlight: "Criadores urbanics já ganham R$500+ por mês.",
    actions: ["Templates e UI kits no marketplace", "Portfolios e serviços de design", "Cursos de design e criatividade"],
    earning: "R$500+",
    period: "por mês",
    color: "#EC4899",
  },
  {
    emoji: "📖",
    role: "Professor / Educador",
    name: "Para educadores",
    description: "Ofereça seus cursos com certificado.",
    highlight: "A IA adapta o conteúdo para cada aluno.",
    actions: ["Trilhas de aprendizado estruturadas", "Certificados automáticos", "Aulas ao vivo com monetização"],
    earning: "R$4.200",
    period: "por mês",
    color: "#3B82F6",
  },
  {
    emoji: "🎥",
    role: "Criador de Conteúdo",
    name: "Para criadores",
    description: "Faça lives, venda produtos, construa comunidade.",
    highlight: "Monetize cada aspecto do seu talento.",
    actions: ["Lives com super chats e doações", "Produtos vendidos ao vivo", "Comunidade exclusiva"],
    earning: "R$1.600",
    period: "por semana",
    color: "#FF5C2E",
  },
  {
    emoji: "🚀",
    role: "Empreendedor",
    name: "Para empreendedores",
    description: "Venda serviços, produtos, conhecimento.",
    highlight: "Urban é sua plataforma de crescimento.",
    actions: ["Loja no marketplace integrado", "Serviços e mentorias", "Networking com criadores"],
    earning: "R$8.400",
    period: "em 2 meses",
    color: "#10B981",
  },
];

export default function UseCasesSection() {
  return (
    <section aria-label="Casos de uso por perfil de criador" style={{ background: "#FFFFFF", padding: "100px 24px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#FF5C2E", marginBottom: "12px" }}>
            Para quem é o Urban
          </p>
          <h2
            style={{
              fontSize: "clamp(30px, 4vw, 46px)",
              fontWeight: 900,
              color: "#111111",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}
          >
            Qualquer criador pode{" "}
            <span style={{ color: "#FF5C2E" }}>ganhar aqui</span>
          </h2>
        </div>

        {/* Cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
          {PERSONAS.map(({ emoji, role, name, description, highlight, actions, earning, period, color }) => (
            <div
              key={name}
              className="um-card"
              style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {/* Avatar */}
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "50%",
                    background: `${color}14`,
                    border: `2px solid ${color}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                  }}
                >
                  {emoji}
                </div>
                <div>
                  <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: color, marginBottom: "2px" }}>{role}</p>
                  <p style={{ fontSize: "15px", fontWeight: 800, color: "#111111", letterSpacing: "-0.02em" }}>{name}</p>
                </div>
              </div>

              {/* Description */}
              <p style={{ fontSize: "14px", color: "#525252", lineHeight: 1.65 }}>
                {description}{" "}
                <strong style={{ color: "#111111", fontWeight: 700 }}>{highlight}</strong>
              </p>

              {/* Actions */}
              <ul style={{ display: "flex", flexDirection: "column", gap: "8px", listStyle: "none", padding: 0, margin: 0 }}>
                {actions.map((action) => (
                  <li
                    key={action}
                    style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "13px", color: "#525252" }}
                  >
                    <span style={{ color: color, fontWeight: 700, marginTop: "1px", flexShrink: 0 }}>✓</span>
                    {action}
                  </li>
                ))}
              </ul>

              {/* Earning */}
              <div
                style={{
                  marginTop: "auto",
                  padding: "14px 16px",
                  background: `${color}08`,
                  border: `1px solid ${color}18`,
                  borderRadius: "14px",
                  display: "flex",
                  alignItems: "baseline",
                  gap: "6px",
                }}
              >
                <span style={{ fontSize: "22px", fontWeight: 900, color: "#111111", letterSpacing: "-0.03em" }}>{earning}</span>
                <span style={{ fontSize: "12px", color: "#A3A3A3" }}>{period}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
