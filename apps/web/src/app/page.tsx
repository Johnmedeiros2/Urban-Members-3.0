import ContadorMoradores from "@/components/ui/ContadorMoradores";

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", display: "flex", fontFamily: "Inter, sans-serif" }}>

      {/* Painel esquerdo — escuro */}
      <div
        style={{
          flex: 1,
          background: "#111111",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px",
          position: "relative",
          overflow: "hidden",
        }}
        className="hidden md:flex"
      >
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 30% 70%, rgba(255,92,46,0.15) 0%, transparent 60%)" }} />

        {/* Skyline */}
        <svg
          style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "260px", pointerEvents: "none" }}
          viewBox="0 0 900 260"
          preserveAspectRatio="xMidYMax meet"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Silhueta dos prédios */}
          <path
            d="M0,260 L0,200 L55,200 L55,170 L100,170 L100,230 L140,230 L140,140 L175,140 L175,198 L215,198 L215,158 L255,158 L255,235 L285,235 L285,162 L325,162 L325,108 L370,108 L370,182 L410,182 L410,148 L450,148 L450,212 L485,212 L485,95 L535,95 L535,228 L570,228 L570,158 L615,158 L615,185 L655,185 L655,128 L700,128 L700,208 L740,208 L740,155 L780,155 L780,202 L820,202 L820,238 L860,238 L860,188 L900,188 L900,260 Z"
            fill="white"
            opacity="0.06"
          />
          {/* Antenas nos prédios mais altos */}
          <rect x="344" y="88" width="2" height="22" fill="white" opacity="0.08" />
          <rect x="347" y="82" width="2" height="8" fill="white" opacity="0.06" />
          <rect x="508" y="74" width="2" height="23" fill="white" opacity="0.08" />
          <rect x="511" y="67" width="2" height="9" fill="white" opacity="0.06" />
          {/* Janelas — prédio alto esquerdo (325-370) */}
          <rect x="330" y="118" width="5" height="6" fill="white" opacity="0.12" />
          <rect x="340" y="118" width="5" height="6" fill="white" opacity="0.12" />
          <rect x="350" y="118" width="5" height="6" fill="white" opacity="0.12" />
          <rect x="360" y="118" width="5" height="6" fill="white" opacity="0.08" />
          <rect x="330" y="132" width="5" height="6" fill="white" opacity="0.08" />
          <rect x="340" y="132" width="5" height="6" fill="white" opacity="0.12" />
          <rect x="350" y="132" width="5" height="6" fill="white" opacity="0.06" />
          <rect x="360" y="132" width="5" height="6" fill="white" opacity="0.12" />
          <rect x="330" y="146" width="5" height="6" fill="white" opacity="0.12" />
          <rect x="350" y="146" width="5" height="6" fill="white" opacity="0.08" />
          {/* Janelas — prédio alto direito (485-535) */}
          <rect x="492" y="105" width="5" height="6" fill="white" opacity="0.12" />
          <rect x="502" y="105" width="5" height="6" fill="white" opacity="0.08" />
          <rect x="512" y="105" width="5" height="6" fill="white" opacity="0.12" />
          <rect x="522" y="105" width="5" height="6" fill="white" opacity="0.06" />
          <rect x="492" y="119" width="5" height="6" fill="white" opacity="0.06" />
          <rect x="502" y="119" width="5" height="6" fill="white" opacity="0.12" />
          <rect x="512" y="119" width="5" height="6" fill="white" opacity="0.08" />
          <rect x="522" y="119" width="5" height="6" fill="white" opacity="0.12" />
          <rect x="492" y="133" width="5" height="6" fill="white" opacity="0.10" />
          <rect x="512" y="133" width="5" height="6" fill="white" opacity="0.06" />
          <rect x="522" y="133" width="5" height="6" fill="white" opacity="0.12" />
          {/* Janelas — prédio alto centro-direito (655-700) */}
          <rect x="662" y="138" width="5" height="6" fill="white" opacity="0.10" />
          <rect x="672" y="138" width="5" height="6" fill="white" opacity="0.06" />
          <rect x="682" y="138" width="5" height="6" fill="white" opacity="0.12" />
          <rect x="662" y="152" width="5" height="6" fill="white" opacity="0.08" />
          <rect x="672" y="152" width="5" height="6" fill="white" opacity="0.12" />
          <rect x="682" y="152" width="5" height="6" fill="white" opacity="0.06" />
        </svg>

        <img src="/logo.svg" alt="Urban Members" width={48} height={48} style={{ position: "relative", filter: "invert(1)" }} />

        <div style={{ position: "relative" }}>
          <p style={{ fontSize: "13px", color: "#FF5C2E", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>
            Dia 1
          </p>
          <h2 style={{ fontSize: "40px", fontWeight: 800, color: "#FFFFFF", lineHeight: 1.15, letterSpacing: "-0.03em", marginBottom: "20px" }}>
            A primeira cidade<br />digital brasileira.
          </h2>
          <p style={{ fontSize: "15px", color: "#A3A3A3", lineHeight: 1.7, marginBottom: "32px" }}>
            Os primeiros moradores ajudam a construir a cidade que querem morar.
          </p>
          <ContadorMoradores dark />
        </div>

        <p style={{ position: "relative", fontSize: "12px", color: "#525252" }}>urbanicsa.com</p>
      </div>

      {/* Painel direito — claro */}
      <div style={{ width: "100%", maxWidth: "520px", padding: "48px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "28px" }}>

        {/* Mobile: logo */}
        <div className="flex md:hidden" style={{ alignItems: "center", gap: "12px" }}>
          <img src="/logo.svg" alt="Urban Members" width={40} height={40} />
          <span style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#111111" }}>Urban Members</span>
        </div>

        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111111", letterSpacing: "-0.03em" }}>Reserve seu endereço</h1>
          <p style={{ fontSize: "14px", color: "#A3A3A3", marginTop: "6px" }}>
            Já tem conta?{" "}
            <a href="/login" style={{ color: "#FF5C2E", fontWeight: 600, textDecoration: "none" }}>Entrar na cidade</a>
          </p>
        </div>

        {/* Mobile: contador */}
        <div className="flex md:hidden">
          <ContadorMoradores />
        </div>

        {/* Botão Google */}
        <a
          href="/cadastro"
          style={{
            width: "100%", height: "52px",
            background: "#FFFFFF", border: "1.5px solid #E5E5E5",
            borderRadius: "14px", display: "flex", alignItems: "center",
            justifyContent: "center", gap: "12px",
            fontSize: "14px", fontWeight: 600, color: "#111111",
            cursor: "pointer", fontFamily: "Inter, sans-serif",
            textDecoration: "none", transition: "border-color 0.2s",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continuar com Google
        </a>

        {/* Divisor */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ flex: 1, height: "1px", background: "#E5E5E5" }} />
          <span style={{ fontSize: "12px", color: "#A3A3A3", fontWeight: 500 }}>ou</span>
          <div style={{ flex: 1, height: "1px", background: "#E5E5E5" }} />
        </div>

        {/* CTA principal */}
        <a
          href="/cadastro"
          className="um-btn-accent"
          style={{ width: "100%", height: "52px", fontSize: "15px", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}
        >
          Criar meu endereço →
        </a>

        <p style={{ fontSize: "12px", color: "#A3A3A3", textAlign: "center", lineHeight: 1.6 }}>
          Cadastro gratuito · 30 segundos · sem cartão
        </p>

      </div>
    </div>
  );
}
