const FEATURES = [
  "Marketplace de produtos",
  "Cursos e trilhas",
  "Monetização de lives",
  "Urban Score (gamificação)",
  "IA Adaptive Learning",
  "Taxa: só no sucesso",
  "Sem taxa mensal",
  "Comunidade + networking",
  "Suporte em português",
];

const PLATFORMS = [
  {
    name: "Urban Members",
    logo: "🏙️",
    accent: "#FF5C2E",
    isUrban: true,
    checks: [true, true, true, true, true, true, true, true, true],
  },
  {
    name: "Discord",
    logo: "🎮",
    accent: "#5865F2",
    isUrban: false,
    checks: [false, false, false, false, false, false, false, true, false],
  },
  {
    name: "Telegram",
    logo: "✈️",
    accent: "#2CA5E0",
    isUrban: false,
    checks: [false, false, false, false, false, false, false, true, false],
  },
  {
    name: "Instagram",
    logo: "📸",
    accent: "#E1306C",
    isUrban: false,
    checks: [false, false, false, false, false, false, false, true, false],
  },
];

function Check({ ok, isUrban }: { ok: boolean; isUrban: boolean }) {
  if (ok) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "22px",
          height: "22px",
          borderRadius: "50%",
          background: isUrban ? "#FF5C2E" : "#111111",
          color: "#fff",
          fontSize: "12px",
          fontWeight: 700,
        }}
      >
        ✓
      </span>
    );
  }
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "22px", height: "22px", borderRadius: "50%", background: "#F5F5F5", color: "#D4D4D4", fontSize: "14px", fontWeight: 700 }}>
      —
    </span>
  );
}

export default function ComparisonTable() {
  return (
    <section style={{ background: "#F7F7F8", padding: "100px 24px" }}>
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#FF5C2E", marginBottom: "12px" }}>
            Por que Urban
          </p>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 900,
              color: "#111111",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              marginBottom: "16px",
            }}
          >
            O único que tem{" "}
            <span style={{ color: "#FF5C2E" }}>tudo junto</span>
          </h2>
          <p style={{ fontSize: "15px", color: "#525252", maxWidth: "440px", margin: "0 auto" }}>
            Compare e veja por que criadores escolhem Urban em vez de juntar 4 plataformas diferentes.
          </p>
        </div>

        {/* Table */}
        <div
          className="um-card"
          style={{ overflow: "hidden", padding: 0 }}
        >
          {/* Header row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr repeat(4, minmax(90px, 1fr))",
              background: "#111111",
              padding: "16px 24px",
            }}
          >
            <div />
            {PLATFORMS.map(({ name, logo, isUrban }) => (
              <div key={name} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "20px", marginBottom: "4px" }}>{logo}</div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: isUrban ? "#FF5C2E" : "rgba(255,255,255,0.6)",
                    letterSpacing: isUrban ? "-0.01em" : 0,
                  }}
                >
                  {name}
                  {isUrban && (
                    <span
                      style={{
                        display: "block",
                        fontSize: "9px",
                        background: "#FF5C2E",
                        color: "#fff",
                        padding: "1px 6px",
                        borderRadius: "999px",
                        marginTop: "4px",
                        letterSpacing: "0.04em",
                      }}
                    >
                      MELHOR
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Feature rows */}
          {FEATURES.map((feature, i) => (
            <div
              key={feature}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr repeat(4, minmax(90px, 1fr))",
                padding: "14px 24px",
                background: i % 2 === 0 ? "#FFFFFF" : "#FAFAFA",
                borderBottom: "1px solid #F0F0F0",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "13px", color: "#262626", fontWeight: 500 }}>{feature}</span>
              {PLATFORMS.map(({ name, isUrban, checks }) => (
                <div key={name} style={{ textAlign: "center" }}>
                  <Check ok={checks[i]} isUrban={isUrban} />
                </div>
              ))}
            </div>
          ))}

          {/* Footer CTA row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr repeat(4, minmax(90px, 1fr))",
              padding: "20px 24px",
              background: "#FFF8F5",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "13px", color: "#111111", fontWeight: 700 }}>Comece agora</span>
            {PLATFORMS.map(({ name, isUrban }) => (
              <div key={name} style={{ textAlign: "center" }}>
                {isUrban ? (
                  <a
                    href="/cadastro"
                    className="lp-cta"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      height: "34px",
                      padding: "0 14px",
                      background: "#FF5C2E",
                      color: "#fff",
                      borderRadius: "10px",
                      fontSize: "12px",
                      fontWeight: 700,
                      textDecoration: "none",
                    }}
                  >
                    Criar conta
                  </a>
                ) : (
                  <span style={{ fontSize: "12px", color: "#A3A3A3" }}>—</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
