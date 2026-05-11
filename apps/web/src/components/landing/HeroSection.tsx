import Image from "next/image";

export default function HeroSection() {
  return (
    <section
      style={{
        background: "linear-gradient(160deg, #0D0D0D 0%, #1A0800 55%, #0D0D0D 100%)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        padding: "0 24px",
        paddingTop: "64px",
      }}
    >
      {/* Background glows */}
      <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "700px", height: "700px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,92,46,0.12) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-120px", left: "-80px", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,92,46,0.07) 0%, transparent 65%)", pointerEvents: "none" }} />

      <div className="hero-inner">
        {/* ── LEFT: Copy + CTAs ── */}
        <div className="hero-copy">
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255,92,46,0.1)",
              border: "1px solid rgba(255,92,46,0.25)",
              borderRadius: "999px",
              padding: "6px 14px",
              marginBottom: "28px",
            }}
          >
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#FF5C2E", display: "inline-block", animation: "um-pulse 1.6s ease-in-out infinite" }} className="um-pulse-dot" />
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#FF5C2E", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              A cidade digital brasileira
            </span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontSize: "clamp(36px, 4.5vw, 62px)",
              fontWeight: 900,
              color: "#FFFFFF",
              lineHeight: 1.06,
              letterSpacing: "-0.035em",
              marginBottom: "22px",
            }}
          >
            Ganhe criando,{" "}
            <span style={{ color: "#FF5C2E" }}>vendendo</span>
            <br />e aprendendo
          </h1>

          {/* Subheader */}
          <p
            style={{
              fontSize: "clamp(15px, 2vw, 17px)",
              color: "rgba(255,255,255,0.6)",
              lineHeight: 1.7,
              marginBottom: "42px",
              maxWidth: "440px",
            }}
          >
            Você merece uma plataforma que recompensa seu talento. Urban é tudo que um criador precisa em um só lugar:{" "}
            <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>marketplace, cursos, lives e comunidade.</span>
          </p>

          {/* CTAs */}
          <div className="hero-cta-group" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <a
              href="/cadastro"
              className="lp-cta"
              style={{
                height: "56px",
                background: "#FF5C2E",
                color: "#FFFFFF",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                fontSize: "16px",
                fontWeight: 700,
                letterSpacing: "-0.01em",
                gap: "8px",
              }}
            >
              Crie sua conta grátis
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </a>
            <a
              href="/login"
              className="lp-login-btn"
              style={{
                height: "50px",
                border: "1.5px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.03)",
                color: "rgba(255,255,255,0.65)",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              Já tenho conta — Entrar na cidade
            </a>
          </div>

          {/* Social proof mini */}
          <div style={{ marginTop: "32px", display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ display: "flex" }}>
              {["#FF5C2E", "#222", "#555", "#888"].map((color, i) => (
                <div
                  key={i}
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: color,
                    border: "2px solid #0D0D0D",
                    marginLeft: i === 0 ? 0 : "-8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "10px",
                    color: "#fff",
                    fontWeight: 700,
                  }}
                >
                  {["J", "M", "A", "R"][i]}
                </div>
              ))}
            </div>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)" }}>
              <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: 700 }}>6 criadores</span> já estão na cidade
            </p>
          </div>

          <p style={{ marginTop: "14px", fontSize: "11px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.02em" }}>
            Cadastro gratuito · Sem cartão de crédito · 10% só em vendas concluídas
          </p>
        </div>

        {/* ── RIGHT: Product screenshot ── */}
        <div className="hidden lg:flex" style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              width: "100%",
              maxWidth: "520px",
              borderRadius: "24px",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,92,46,0.08)",
            }}
          >
            <Image
              src="/images/feature-marketplace.png"
              alt="Plataforma Urban Members — marketplace, cursos e lives em um só lugar"
              width={1200}
              height={800}
              priority
              sizes="(max-width: 1024px) 0vw, 520px"
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
