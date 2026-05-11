const FEATURES = [
  "Vender Produtos",
  "Criar Cursos",
  "Live com Monetização",
  "Community / Social",
  "Payment Integrado",
  "Gamification",
  "IA Adaptive Learning",
  "TUDO EM UM",
];

type Check = true | false | "partial";

const PLATFORMS: { name: string; logo: string; isUrban: boolean; checks: Check[] }[] = [
  {
    name: "Urban Members",
    logo: "🏙️",
    isUrban: true,
    checks: [true, true, true, true, true, true, true, true],
  },
  {
    name: "Discord",
    logo: "🎮",
    isUrban: false,
    checks: [false, false, false, true, false, false, false, false],
  },
  {
    name: "Telegram",
    logo: "✈️",
    isUrban: false,
    checks: [false, false, false, true, false, false, false, false],
  },
  {
    name: "Instagram",
    logo: "📸",
    isUrban: false,
    checks: ["partial", false, "partial", true, "partial", false, false, false],
  },
];

function Check({ ok, isUrban, label }: { ok: Check; isUrban: boolean; label: string }) {
  if (ok === true) {
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
        title={label}
      >
        ✓
      </span>
    );
  }
  if (ok === "partial") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "22px",
          height: "22px",
          borderRadius: "50%",
          background: "#FEF3C7",
          color: "#D97706",
          fontSize: "10px",
          fontWeight: 700,
          border: "1px solid #FDE68A",
        }}
        title="Parcial / isolado"
      >
        ~
      </span>
    );
  }
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "22px",
        height: "22px",
        borderRadius: "50%",
        background: "#F5F5F5",
        color: "#D4D4D4",
        fontSize: "14px",
        fontWeight: 700,
      }}
    >
      —
    </span>
  );
}

export default function ComparisonTable() {
  return (
    <section style={{ background: "#F7F7F8", padding: "clamp(64px, 10vw, 100px) 24px" }}>
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
        <div className="lp-table-scroll">
        <div className="um-card" style={{ overflow: "hidden", padding: 0 }}>
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
                    fontSize: "11px",
                    fontWeight: 700,
                    color: isUrban ? "#FF5C2E" : "rgba(255,255,255,0.6)",
                  }}
                >
                  {isUrban ? "Urban Members" : name}
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
          {FEATURES.map((feature, i) => {
            const isLast = i === FEATURES.length - 1;
            return (
              <div
                key={feature}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr repeat(4, minmax(90px, 1fr))",
                  padding: "14px 24px",
                  background: isLast ? "#FFF8F5" : i % 2 === 0 ? "#FFFFFF" : "#FAFAFA",
                  borderBottom: "1px solid #F0F0F0",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    color: isLast ? "#FF5C2E" : "#262626",
                    fontWeight: isLast ? 800 : 500,
                  }}
                >
                  {feature}
                </span>
                {PLATFORMS.map(({ name, isUrban, checks }) => (
                  <div key={name} style={{ textAlign: "center" }}>
                    <Check ok={checks[i]} isUrban={isUrban} label={feature} />
                  </div>
                ))}
              </div>
            );
          })}

          {/* Footer CTA */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr repeat(4, minmax(90px, 1fr))",
              padding: "20px 24px",
              background: "#FFF3EF",
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
        {/* Legend */}
        <div style={{ display: "flex", gap: "20px", justifyContent: "center", marginTop: "16px", flexWrap: "wrap" }}>
          {[
            { symbol: "✓", color: "#111111", bg: "#F5F5F5", label: "Disponível" },
            { symbol: "~", color: "#D97706", bg: "#FEF3C7", label: "Parcial / isolado" },
            { symbol: "—", color: "#D4D4D4", bg: "#F5F5F5", label: "Não disponível" },
          ].map(({ symbol, label }) => (
            <span key={label} style={{ fontSize: "12px", color: "#A3A3A3", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontWeight: 700 }}>{symbol}</span> {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
