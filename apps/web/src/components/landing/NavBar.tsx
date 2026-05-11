import Link from "next/link";

export default function NavBar() {
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: "rgba(13,13,13,0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "0 24px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link href="/" aria-label="Urban Members — Página inicial" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <img src="/logo.svg" alt="Logotipo Urban Members" width={36} height={36} />
          <span style={{ fontSize: "15px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em" }}>
            Urban Members
          </span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex" style={{ gap: "32px", alignItems: "center" }}>
          {[
            { label: "Marketplace", href: "#features" },
            { label: "Cursos", href: "#features" },
            { label: "Lives", href: "#features" },
            { label: "Preços", href: "#faq" },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              style={{
                fontSize: "14px",
                fontWeight: 500,
                color: "rgba(255,255,255,0.6)",
                textDecoration: "none",
                transition: "color 150ms",
              }}
              className="lp-link"
            >
              {label}
            </a>
          ))}
        </div>

        {/* CTAs */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <a
            href="/login"
            className="lp-login-btn"
            style={{
              height: "38px",
              padding: "0 16px",
              border: "1.5px solid rgba(255,255,255,0.15)",
              borderRadius: "10px",
              color: "rgba(255,255,255,0.7)",
              fontSize: "13px",
              fontWeight: 600,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              background: "transparent",
              cursor: "pointer",
              transition: "border-color 0.2s, color 0.2s",
            }}
          >
            Entrar
          </a>
          <a
            href="/cadastro"
            className="lp-cta"
            style={{
              height: "38px",
              padding: "0 18px",
              background: "#FF5C2E",
              borderRadius: "10px",
              color: "#FFFFFF",
              fontSize: "13px",
              fontWeight: 700,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              transition: "background 0.15s, transform 0.15s, box-shadow 0.15s",
            }}
          >
            Criar conta grátis
          </a>
        </div>
      </div>
    </nav>
  );
}
