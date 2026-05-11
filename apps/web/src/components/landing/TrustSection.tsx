const TRUST_ITEMS = [
  {
    icon: "🔒",
    title: "Login seguro com Google",
    description: "Autenticação OAuth 2.0 via Google. Sem senhas fracas, sem vulnerabilidades de credencial.",
    tag: "Seguro",
  },
  {
    icon: "💳",
    title: "Pagamentos protegidos",
    description: "Processado com criptografia de ponta a ponta. Seus dados financeiros nunca ficam expostos.",
    tag: "Pagamentos",
  },
  {
    icon: "🛡️",
    title: "Seus dados nunca são vendidos",
    description: "Privacidade total. Conforme a Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018).",
    tag: "Privado",
  },
  {
    icon: "✅",
    title: "Conforme LGPD e regulamentações",
    description: "Operamos dentro de todas as normas brasileiras de proteção de dados e regulamentações digitais.",
    tag: "LGPD",
  },
];

export default function TrustSection() {
  return (
    <section aria-label="Segurança e privacidade" style={{ background: "#111111", padding: "clamp(56px, 8vw, 80px) 24px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "52px" }}>
          <h2
            style={{
              fontSize: "clamp(24px, 3vw, 36px)",
              fontWeight: 900,
              color: "#FFFFFF",
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              marginBottom: "12px",
            }}
          >
            Sua segurança é{" "}
            <span style={{ color: "#FF5C2E" }}>prioridade</span>
          </h2>
          <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.5)", maxWidth: "420px", margin: "0 auto" }}>
            Construímos Urban com segurança e privacidade desde o primeiro dia.
          </p>
        </div>

        {/* Trust grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
          {TRUST_ITEMS.map(({ icon, title, description, tag }) => (
            <div
              key={title}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "20px",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "14px",
                    background: "rgba(255,92,46,0.12)",
                    border: "1px solid rgba(255,92,46,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "22px",
                    flexShrink: 0,
                  }}
                >
                  {icon}
                </div>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "#FF5C2E",
                    background: "rgba(255,92,46,0.1)",
                    border: "1px solid rgba(255,92,46,0.2)",
                    padding: "2px 8px",
                    borderRadius: "999px",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  {tag}
                </span>
              </div>
              <div>
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginBottom: "6px" }}>{title}</h3>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", lineHeight: 1.65 }}>{description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Partners row */}
        <div
          style={{
            marginTop: "52px",
            paddingTop: "40px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "40px",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Tecnologias
          </span>
          {["Supabase", "Mercado Pago", "LiveKit", "Google Auth", "Next.js"].map((tech) => (
            <span
              key={tech}
              style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.65)", letterSpacing: "-0.01em" }}
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
