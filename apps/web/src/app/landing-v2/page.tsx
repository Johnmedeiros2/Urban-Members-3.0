import LandingCTA from "@/components/ui/LandingCTA";

export default function LandingV1() {
  return (
    <div style={{ minHeight: "100vh", background: "#F7F7F8", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", padding: "48px 24px" }}>
      <div style={{ maxWidth: "1100px", width: "100%", display: "flex", alignItems: "center", gap: "72px" }}>

        {/* ── ESQUERDA: CTA + Login inline ── */}
        <div style={{ flex: "0 0 420px", display: "flex", flexDirection: "column", gap: "28px" }}>

          {/* Logo */}
          <a href="/" className="lp-logo">
            <img src="/logo.svg" alt="Urban Members" width={52} height={52} />
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span className="lp-logo-text" style={{ fontSize: "18px", fontWeight: 800, letterSpacing: "-0.01em", color: "#111111", lineHeight: 1 }}>Urban Members</span>
              <span style={{ fontSize: "11px", color: "#A3A3A3", letterSpacing: "0.04em" }}>A cidade digital brasileira</span>
            </div>
          </a>

          <LandingCTA />
        </div>

        {/* ── DIREITA: Ilustração ── */}
        <div className="hidden md:flex" style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <svg viewBox="0 0 500 480" fill="none" style={{ width: "100%", maxWidth: "500px" }} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="card-shadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#000000" floodOpacity="0.09"/>
              </filter>
              <clipPath id="circle-clip">
                <circle cx="252" cy="225" r="138"/>
              </clipPath>
            </defs>

            {/* Brilho externo */}
            <circle cx="252" cy="225" r="188" fill="#FF5C2E" opacity="0.06"/>
            <circle cx="252" cy="225" r="160" fill="#FF5C2E" opacity="0.09"/>

            {/* Círculo principal laranja */}
            <circle cx="252" cy="225" r="138" fill="#FF5C2E"/>

            {/* Skyline dentro do círculo */}
            <g clipPath="url(#circle-clip)">
              <path d="M114,363 L114,298 L132,298 L132,268 L150,268 L150,302 L163,302 L163,248 L170,248 L170,238 L172,233 L174,238 L174,248 L192,248 L192,288 L208,288 L208,268 L224,268 L224,310 L238,310 L238,252 L245,252 L245,243 L247,236 L249,243 L249,252 L265,252 L265,278 L280,278 L280,260 L296,260 L296,298 L310,298 L310,270 L326,270 L326,253 L333,253 L333,246 L335,240 L337,246 L337,253 L352,253 L352,286 L366,286 L366,305 L390,305 L390,363 Z" fill="white" opacity="0.22"/>

              {/* Janelas */}
              <rect x="165" y="255" width="5" height="5" rx="1" fill="white" opacity="0.5"/>
              <rect x="175" y="255" width="5" height="5" rx="1" fill="white" opacity="0.35"/>
              <rect x="165" y="265" width="5" height="5" rx="1" fill="white" opacity="0.4"/>
              <rect x="175" y="265" width="5" height="5" rx="1" fill="white" opacity="0.55"/>
              <rect x="240" y="260" width="5" height="5" rx="1" fill="white" opacity="0.45"/>
              <rect x="250" y="260" width="5" height="5" rx="1" fill="white" opacity="0.3"/>
              <rect x="240" y="270" width="5" height="5" rx="1" fill="white" opacity="0.55"/>
              <rect x="250" y="270" width="5" height="5" rx="1" fill="white" opacity="0.4"/>
              <rect x="327" y="260" width="5" height="5" rx="1" fill="white" opacity="0.45"/>
              <rect x="337" y="260" width="5" height="5" rx="1" fill="white" opacity="0.3"/>
              <rect x="327" y="270" width="5" height="5" rx="1" fill="white" opacity="0.5"/>
            </g>

            {/* ── PESSOA ── */}
            <circle cx="408" cy="212" r="23" fill="#111111"/>
            <path d="M385,206 Q387,189 408,189 Q429,189 431,206" fill="#1a1a1a"/>
            <rect x="389" y="234" width="38" height="56" rx="9" fill="#FF5C2E"/>
            <path d="M390,248 Q370,252 336,260" stroke="#111111" strokeWidth="13" strokeLinecap="round"/>
            <circle cx="332" cy="261" r="8" fill="#111111"/>
            <path d="M427,250 Q442,262 450,278" stroke="#111111" strokeWidth="12" strokeLinecap="round"/>
            <rect x="389" y="286" width="15" height="50" rx="7" fill="#222222"/>
            <rect x="410" y="286" width="15" height="50" rx="7" fill="#222222"/>
            <rect x="382" y="331" width="24" height="10" rx="5" fill="#111111"/>
            <rect x="406" y="331" width="24" height="10" rx="5" fill="#111111"/>

            {/* ── CARD 1: Endereço reservado ── */}
            <rect x="38" y="62" width="152" height="54" rx="14" fill="white" filter="url(#card-shadow)"/>
            <circle cx="66" cy="89" r="16" fill="#FF5C2E" opacity="0.12"/>
            <path d="M66,80 C62.5,80 60,82.8 60,86.2 C60,91 66,98 66,98 C66,98 72,91 72,86.2 C72,82.8 69.5,80 66,80 Z" fill="#FF5C2E"/>
            <circle cx="66" cy="86" r="2.5" fill="white"/>
            <text x="90" y="85" fontSize="10" fontWeight="700" fill="#111111" fontFamily="Inter,sans-serif">Seu endereço</text>
            <text x="90" y="99" fontSize="10" fill="#A3A3A3" fontFamily="Inter,sans-serif">reservado ✓</text>

            {/* ── CARD 2: Cidade ao vivo ── */}
            <rect x="288" y="372" width="158" height="54" rx="14" fill="white" filter="url(#card-shadow)"/>
            <circle cx="316" cy="399" r="16" fill="#FF5C2E" opacity="0.12"/>
            <circle cx="316" cy="399" r="6" fill="#FF5C2E"/>
            <circle cx="316" cy="399" r="10" fill="#FF5C2E" opacity="0.3"/>
            <text x="340" y="395" fontSize="10" fontWeight="700" fill="#111111" fontFamily="Inter,sans-serif">Cidade ao vivo</text>
            <text x="340" y="409" fontSize="10" fill="#A3A3A3" fontFamily="Inter,sans-serif">6 moradores</text>

            {/* ── ÍCONE CHAVE ── */}
            <circle cx="448" cy="88" r="30" fill="white" filter="url(#card-shadow)"/>
            <circle cx="440" cy="84" r="9" fill="none" stroke="#FF5C2E" strokeWidth="2.5"/>
            <line x1="447" y1="84" x2="462" y2="84" stroke="#FF5C2E" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="458" y1="84" x2="458" y2="90" stroke="#FF5C2E" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="454" y1="84" x2="454" y2="88" stroke="#FF5C2E" strokeWidth="2.5" strokeLinecap="round"/>

            {/* Pontos decorativos */}
            <circle cx="88" cy="168" r="9" fill="#FF5C2E" opacity="0.14"/>
            <circle cx="72" cy="185" r="4" fill="#FF5C2E" opacity="0.1"/>
            <circle cx="466" cy="185" r="7" fill="#FF5C2E" opacity="0.12"/>
            <circle cx="480" cy="202" r="3" fill="#FF5C2E" opacity="0.08"/>
            <circle cx="65" cy="308" r="6" fill="#FF5C2E" opacity="0.12"/>
            <circle cx="52" cy="325" r="3" fill="#FF5C2E" opacity="0.08"/>
          </svg>
        </div>

      </div>
    </div>
  );
}
