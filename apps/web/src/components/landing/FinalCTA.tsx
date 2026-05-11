export default function FinalCTA() {
  return (
    <section
      style={{
        background: "linear-gradient(160deg, #FF5C2E 0%, #CC3D1A 100%)",
        padding: "100px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative circles */}
      <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-80px", left: "-40px", width: "240px", height: "240px", borderRadius: "50%", background: "rgba(0,0,0,0.08)", pointerEvents: "none" }} />

      <div style={{ maxWidth: "680px", margin: "0 auto", textAlign: "center", position: "relative" }}>
        {/* Eyebrow */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: "999px",
            padding: "6px 14px",
            marginBottom: "28px",
          }}
        >
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#FFFFFF", display: "inline-block" }} />
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Gratuito para começar
          </span>
        </div>

        <h2
          style={{
            fontSize: "clamp(34px, 5vw, 58px)",
            fontWeight: 900,
            color: "#FFFFFF",
            lineHeight: 1.07,
            letterSpacing: "-0.035em",
            marginBottom: "22px",
          }}
        >
          Está pronto para começar<br />a ganhar?
        </h2>

        <p
          style={{
            fontSize: "17px",
            color: "rgba(255,255,255,0.8)",
            lineHeight: 1.65,
            marginBottom: "44px",
            maxWidth: "480px",
            margin: "0 auto 44px",
          }}
        >
          Junte-se aos primeiros moradores da cidade digital brasileira. Sem custo fixo, sem risco — só você e sua criatividade.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
          <a
            href="/cadastro"
            style={{
              height: "60px",
              padding: "0 48px",
              background: "#FFFFFF",
              color: "#FF5C2E",
              borderRadius: "18px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
              fontSize: "17px",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              transition: "transform 150ms, box-shadow 150ms",
              gap: "8px",
            }}
            className="lp-cta"
          >
            Crie sua conta grátis
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 9h12M11 5l4 4-4 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>

          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>
            30 segundos · Sem cartão · Cancele quando quiser
          </p>
        </div>

        {/* 3 steps */}
        <div
          style={{
            marginTop: "56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          {[
            { step: "1", text: "Crie sua conta grátis" },
            { step: "→", text: "" },
            { step: "2", text: "Monte sua loja ou curso" },
            { step: "→", text: "" },
            { step: "3", text: "Comece a ganhar" },
          ].map(({ step, text }, i) =>
            step === "→" ? (
              <span key={i} style={{ fontSize: "18px", color: "rgba(255,255,255,0.4)" }}>→</span>
            ) : (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.2)",
                    border: "1.5px solid rgba(255,255,255,0.35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: 800,
                    color: "#FFFFFF",
                    flexShrink: 0,
                  }}
                >
                  {step}
                </div>
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>{text}</span>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
