import HeroEmailForm from "@/components/HeroEmailForm";

function CidadeIlustracao({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 600 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="presentation"
      aria-hidden="true"
    >
      {/* Plano de fundo — círculo sutil */}
      <circle cx="300" cy="280" r="220" fill="#FFF3EF" opacity="0.6" />

      {/* Solo */}
      <ellipse cx="300" cy="430" rx="280" ry="14" fill="#FED7C3" opacity="0.5" />

      {/* PESSOA 1 — esquerda, com smartphone */}
      {/* Cabeça */}
      <circle cx="140" cy="220" r="22" fill="#1A1A1A" />
      {/* Cabelo (cacho) */}
      <path d="M118 215 Q 118 195, 140 192 Q 162 195, 162 215 Q 158 200, 140 200 Q 122 200, 118 215 Z" fill="#292524" />
      {/* Corpo */}
      <path d="M115 245 Q 115 240, 120 240 L 160 240 Q 165 240, 165 245 L 168 320 Q 168 325, 163 325 L 117 325 Q 112 325, 112 320 Z" fill="#FF5C2E" />
      {/* Braço com celular */}
      <rect x="148" y="260" width="8" height="30" rx="3" fill="#FF5C2E" transform="rotate(20 152 275)" />
      <rect x="158" y="278" width="14" height="22" rx="3" fill="#1A1A1A" />
      <rect x="160" y="282" width="10" height="14" rx="1" fill="#FF5C2E" />
      {/* Pernas */}
      <rect x="125" y="325" width="10" height="50" rx="3" fill="#292524" />
      <rect x="145" y="325" width="10" height="50" rx="3" fill="#292524" />
      {/* Sapatos */}
      <ellipse cx="130" cy="380" rx="8" ry="4" fill="#1A1A1A" />
      <ellipse cx="150" cy="380" rx="8" ry="4" fill="#1A1A1A" />

      {/* PESSOA 2 — centro (maior, em destaque) */}
      {/* Cabeça */}
      <circle cx="300" cy="180" r="26" fill="#292524" />
      {/* Cabelo curto */}
      <path d="M275 175 Q 275 152, 300 150 Q 325 152, 325 175 Q 320 162, 300 162 Q 280 162, 275 175 Z" fill="#1A1A1A" />
      {/* Corpo */}
      <path d="M270 213 Q 270 208, 275 208 L 325 208 Q 330 208, 330 213 L 335 305 Q 335 310, 330 310 L 270 310 Q 265 310, 265 305 Z" fill="#1A1A1A" />
      {/* Logo Urban no peito */}
      <rect x="290" y="240" width="20" height="20" rx="5" fill="#FF5C2E" />
      <text x="300" y="255" textAnchor="middle" fontSize="14" fontWeight="800" fill="#FFFFFF" fontFamily="Inter, sans-serif">U</text>
      {/* Braços abertos (acolhendo) */}
      <path d="M270 220 Q 245 245, 240 280 Q 238 290, 246 290 Q 252 280, 254 270 Q 260 245, 280 230" fill="#1A1A1A" />
      <path d="M330 220 Q 355 245, 360 280 Q 362 290, 354 290 Q 348 280, 346 270 Q 340 245, 320 230" fill="#1A1A1A" />
      {/* Pernas */}
      <rect x="280" y="310" width="14" height="60" rx="4" fill="#292524" />
      <rect x="306" y="310" width="14" height="60" rx="4" fill="#292524" />
      {/* Sapatos */}
      <ellipse cx="287" cy="375" rx="10" ry="5" fill="#1A1A1A" />
      <ellipse cx="313" cy="375" rx="10" ry="5" fill="#1A1A1A" />

      {/* PESSOA 3 — direita, com laptop */}
      {/* Cabeça */}
      <circle cx="460" cy="220" r="22" fill="#1A1A1A" />
      {/* Cabelo (longo) */}
      <path d="M438 215 Q 438 192, 460 190 Q 482 192, 482 215 L 484 240 Q 480 235, 478 230 Q 478 215, 460 213 Q 442 215, 442 230 Q 440 235, 436 240 Z" fill="#292524" />
      {/* Corpo */}
      <path d="M435 245 Q 435 240, 440 240 L 480 240 Q 485 240, 485 245 L 488 320 Q 488 325, 483 325 L 437 325 Q 432 325, 432 320 Z" fill="#FF5C2E" />
      {/* Laptop */}
      <rect x="438" y="285" width="44" height="28" rx="2" fill="#1A1A1A" />
      <rect x="442" y="289" width="36" height="20" fill="#FF5C2E" opacity="0.85" />
      <rect x="436" y="313" width="48" height="3" rx="1" fill="#292524" />
      {/* Pernas */}
      <rect x="445" y="325" width="10" height="50" rx="3" fill="#292524" />
      <rect x="465" y="325" width="10" height="50" rx="3" fill="#292524" />
      {/* Sapatos */}
      <ellipse cx="450" cy="380" rx="8" ry="4" fill="#1A1A1A" />
      <ellipse cx="470" cy="380" rx="8" ry="4" fill="#1A1A1A" />

      {/* Linhas de conexão entre as 3 pessoas (community network) */}
      <path
        d="M165 230 Q 230 180, 280 195"
        stroke="#FF5C2E"
        strokeWidth="2"
        strokeDasharray="4 4"
        fill="none"
        opacity="0.55"
      />
      <path
        d="M325 195 Q 380 180, 440 230"
        stroke="#FF5C2E"
        strokeWidth="2"
        strokeDasharray="4 4"
        fill="none"
        opacity="0.55"
      />

      {/* Bolhas de chat acima das pessoas */}
      <g transform="translate(180 145)">
        <rect x="0" y="0" width="40" height="22" rx="11" fill="#FF5C2E" />
        <circle cx="12" cy="11" r="2" fill="#FFFFFF" />
        <circle cx="20" cy="11" r="2" fill="#FFFFFF" />
        <circle cx="28" cy="11" r="2" fill="#FFFFFF" />
        <path d="M10 22 L 14 26 L 18 22 Z" fill="#FF5C2E" />
      </g>

      <g transform="translate(380 145)">
        <rect x="0" y="0" width="40" height="22" rx="11" fill="#1A1A1A" />
        <circle cx="12" cy="11" r="2" fill="#FFFFFF" />
        <circle cx="20" cy="11" r="2" fill="#FFFFFF" />
        <circle cx="28" cy="11" r="2" fill="#FFFFFF" />
        <path d="M22 22 L 26 26 L 30 22 Z" fill="#1A1A1A" />
      </g>

      {/* Estrelas/sparkles decorativos */}
      <g fill="#FF5C2E" opacity="0.7">
        <circle cx="80" cy="120" r="3" />
        <circle cx="520" cy="100" r="3" />
        <circle cx="500" cy="380" r="2.5" />
        <circle cx="100" cy="380" r="2.5" />
      </g>
      <g fill="#FED7C3" opacity="0.8">
        <circle cx="60" cy="280" r="4" />
        <circle cx="540" cy="260" r="4" />
      </g>
    </svg>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-[#1A1A1A] w-full" style={{ fontFamily: "Inter, sans-serif" }}>

      {/* HEADER sticky */}
      <header className="border-b border-[#F0EDE9] bg-white/90 backdrop-blur-md sticky top-0 z-50 w-full flex justify-center">
        <div className="w-full max-w-6xl px-6 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 no-underline">
            <img src="/logo.svg" alt="Urban Members" width={28} height={28} style={{ display: "block" }} />
            <span className="text-[13px] font-bold tracking-widest text-[#1A1A1A] uppercase">Urban Members</span>
          </a>
          <a
            href="/login"
            className="text-[13px] font-medium text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors no-underline"
          >
            Já tenho conta
          </a>
        </div>
      </header>

      {/* HERO 2 colunas — ocupa viewport */}
      <section
        className="relative overflow-hidden flex justify-center w-full bg-gradient-to-br from-[#FFFCF9] via-white to-[#FFF3EF]"
        style={{ minHeight: "calc(100vh - 56px)" }}
      >
        <div className="w-full max-w-6xl px-6 py-10 md:py-14 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 items-center">

          {/* COLUNA ESQUERDA — texto + form */}
          <div className="flex flex-col gap-6 md:gap-7 text-left">
            {/* Badge pré-lançamento */}
            <span className="inline-flex items-center gap-2 self-start px-3 py-1.5 bg-[#FFF3EF] border border-[#FED7C3] rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#FF5C2E] animate-pulse"></span>
              <span className="text-[11px] font-bold tracking-[0.1em] text-[#FF5C2E] uppercase">Pré-lançamento aberto</span>
            </span>

            {/* Headline */}
            <h1
              className="text-[32px] md:text-[44px] lg:text-[52px] font-extrabold leading-[1.05] text-[#1A1A1A]"
              style={{ letterSpacing: "-0.035em" }}
            >
              A primeira <span className="text-[#FF5C2E]">cidade digital</span> brasileira está no dia 1.
            </h1>

            {/* Sub */}
            <p
              className="text-[16px] md:text-[18px] text-[#6B6B6B] leading-[1.55] max-w-[36ch]"
              style={{ fontWeight: 400 }}
            >
              Estamos no início. Os primeiros moradores ajudam a construir a cidade que querem morar.
            </p>

            {/* Form de email embebido (substitui o CTA simples) */}
            <div className="w-full max-w-[480px]">
              <HeroEmailForm />
            </div>

            {/* Microcopy LGPD implícita */}
            <p className="text-[12px] text-[#A8A29E] leading-relaxed max-w-[42ch]">
              ⚡ Cadastro grátis, sem cartão. Ao continuar você aceita os{" "}
              <a href="/termos" className="underline hover:text-[#6B6B6B]">Termos</a> e a{" "}
              <a href="/privacidade" className="underline hover:text-[#6B6B6B]">Privacidade</a>.
            </p>
          </div>

          {/* COLUNA DIREITA — ilustração de pessoas (comunidade) */}
          <div className="flex items-center justify-center order-first md:order-last">
            <CidadeIlustracao className="w-full max-w-[500px] h-auto" />
          </div>
        </div>
      </section>

      {/* ENDOSSO ADONAI */}
      <section className="border-y border-[#F0EDE9] bg-[#FAFAF9] flex justify-center w-full">
        <div className="w-full max-w-6xl px-6 py-6 flex flex-col md:flex-row items-center justify-center gap-3 md:gap-5 text-center md:text-left">
          <span className="text-[10px] font-bold tracking-[0.12em] text-[#A8A29E] uppercase">Apoiado por</span>
          <div className="hidden md:block w-px h-6 bg-[#E5E5E5]"></div>
          <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-3">
            <p className="text-[13px] font-bold text-[#1A1A1A]">Instituto Caxiense Shalom Adonai</p>
            <p className="text-[12px] text-[#6B6B6B]">36 anos cuidando da educação em Duque de Caxias</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#F0EDE9] bg-white flex justify-center w-full">
        <div className="w-full max-w-6xl px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Urban Members" width={20} height={20} style={{ display: "block" }} />
            <p className="text-[11px] text-[#A8A29E]">urbanicsa.com</p>
          </div>
          <p className="text-[11px] text-[#A8A29E]">© 2026 Urban Members · A primeira cidade digital brasileira</p>
        </div>
      </footer>

    </main>
  );
}
