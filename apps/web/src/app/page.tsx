import HeroEmailForm from "@/components/HeroEmailForm";

/* ───────────────────────────────────────────────────────────
   Composição visual do produto — mostra Urban "em ação"
   3 cards flutuantes: post no feed + notificação + live badge
   Estilo: Stripe/Linear (mockup do produto, não ilustração)
   ─────────────────────────────────────────────────────────── */
function PreviewProduto() {
  return (
    <div className="relative w-full max-w-[560px] aspect-[4/5] mx-auto" aria-hidden="true">
      {/* Glow de fundo — gradient radial sutil */}
      <div
        className="absolute inset-0 rounded-[40px]"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(255,92,46,0.10) 0%, transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(255,140,90,0.08) 0%, transparent 50%)",
        }}
      />

      {/* Card principal — POST DO FEED */}
      <div
        className="absolute top-[8%] left-[6%] right-[6%] bg-white rounded-3xl border border-[#EDEAE5] um-floating-slow"
        style={{
          boxShadow:
            "0 1px 2px rgba(15,15,14,0.04), 0 8px 24px rgba(15,15,14,0.06), 0 24px 48px rgba(15,15,14,0.06)",
        }}
      >
        <div className="p-6 flex flex-col gap-4">
          {/* Header do post */}
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-white text-base font-bold"
              style={{
                background: "linear-gradient(135deg, #FF5C2E 0%, #FF8C5A 100%)",
              }}
            >
              M
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-[#0F0F0E] leading-tight">Marina Cardoso</p>
              <p className="text-[12px] text-[#8B8B85] mt-0.5">Caxias-RJ · Bairro Negócios · há 12min</p>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFF1EA]">
              <span className="text-[10px] font-bold text-[#FF5C2E]">+340</span>
            </div>
          </div>

          {/* Conteúdo do post */}
          <p className="text-[14px] text-[#1A1A18] leading-relaxed">
            Acabei de fechar minha primeira venda no Mercado Urbano. Comissão de 10% versus os 30% do iFood — economizei R$ 47 num pedido só. <span className="text-[#FF5C2E]">#mercado</span>
          </p>

          {/* Imagem placeholder do post */}
          <div
            className="w-full aspect-[16/9] rounded-2xl"
            style={{
              background:
                "linear-gradient(135deg, #FFF1EA 0%, #FED7C3 50%, #FFC2A3 100%)",
            }}
          >
            <div className="w-full h-full rounded-2xl flex items-center justify-center text-[40px] opacity-30">
              🥖
            </div>
          </div>

          {/* Footer do post — interactions */}
          <div className="flex items-center justify-between pt-2 border-t border-[#F5F2EE]">
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-1.5 text-[12px] text-[#4A4A47]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                <span className="font-medium">28</span>
              </div>
              <div className="flex items-center gap-1.5 text-[12px] text-[#4A4A47]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                <span className="font-medium">7</span>
              </div>
              <div className="flex items-center gap-1.5 text-[12px] text-[#4A4A47]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              </div>
            </div>
            <span className="text-[11px] text-[#A8A29E]">Bairro #Negócios</span>
          </div>
        </div>
      </div>

      {/* Card secundário — NOTIFICAÇÃO sobreposta */}
      <div
        className="absolute top-[3%] right-[-3%] bg-white rounded-2xl border border-[#EDEAE5] um-floating"
        style={{
          padding: "12px 14px",
          maxWidth: "240px",
          boxShadow:
            "0 1px 2px rgba(15,15,14,0.05), 0 8px 20px rgba(15,15,14,0.08), 0 16px 36px rgba(15,15,14,0.08)",
          animationDelay: "1.5s",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{
              background: "linear-gradient(135deg, #1A1A18 0%, #4A4A47 100%)",
            }}
          >
            <span className="text-white text-xs font-bold">JC</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] text-[#0F0F0E] leading-tight">
              <strong>João Carlos</strong> conectou com você
            </p>
            <p className="text-[10px] text-[#8B8B85] mt-0.5">Bairro Educação · agora</p>
          </div>
        </div>
      </div>

      {/* Badge live — chama atenção, canto inferior */}
      <div
        className="absolute bottom-[6%] left-[-2%] bg-white rounded-full border border-[#EDEAE5] um-floating-slow"
        style={{
          padding: "10px 16px",
          boxShadow:
            "0 1px 2px rgba(15,15,14,0.05), 0 8px 24px rgba(15,15,14,0.10)",
          animationDelay: "0.8s",
        }}
      >
        <div className="flex items-center gap-2.5">
          <span className="relative flex w-2 h-2">
            <span className="animate-ping absolute inset-0 rounded-full bg-[#FF5C2E] opacity-60" />
            <span className="relative w-2 h-2 rounded-full bg-[#FF5C2E]" />
          </span>
          <p className="text-[12px] font-semibold text-[#0F0F0E]">
            Marcos transmitindo <span className="text-[#8B8B85] font-normal">· 47 assistindo</span>
          </p>
        </div>
      </div>

      {/* Stat card — destaca métrica */}
      <div
        className="absolute bottom-[16%] right-[-4%] bg-[#0F0F0E] rounded-2xl px-4 py-3 um-floating"
        style={{
          boxShadow: "0 8px 24px rgba(15,15,14,0.20), 0 16px 40px rgba(15,15,14,0.10)",
          animationDelay: "2.2s",
        }}
      >
        <p className="text-[10px] font-semibold text-[#8B8B85] uppercase tracking-[0.1em]">Em Caxias</p>
        <p className="text-[20px] font-bold text-white mt-0.5 leading-none">+ 1.247</p>
        <p className="text-[10px] text-[#8B8B85] mt-1">moradores ativos hoje</p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main
      className="min-h-screen w-full"
      style={{
        background: "#FAFAF7",
        color: "#0F0F0E",
        fontFamily: "Inter, sans-serif",
      }}
    >

      {/* HEADER — minimalista, editorial */}
      <header className="border-b border-[#EDEAE5]/60 bg-[#FAFAF7]/85 backdrop-blur-xl sticky top-0 z-50 w-full flex justify-center">
        <div className="w-full max-w-[1240px] px-6 lg:px-10 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 no-underline group">
            <img src="/logo.svg" alt="Urban Members" width={28} height={28} style={{ display: "block" }} />
            <span className="text-[13px] font-semibold tracking-[0.2em] text-[#0F0F0E] uppercase">Urban Members</span>
          </a>
          <a
            href="/login"
            className="text-[13px] text-[#4A4A47] hover:text-[#0F0F0E] transition-colors no-underline font-medium"
          >
            Já tenho conta
          </a>
        </div>
      </header>

      {/* HERO — layout editorial 60/40, viewport completa */}
      <section
        className="relative flex justify-center w-full overflow-hidden"
        style={{ minHeight: "calc(100vh - 64px)" }}
      >
        {/* Background gradient orbs sutis */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 70% 30%, rgba(255,92,46,0.045) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 20% 80%, rgba(255,140,90,0.035) 0%, transparent 60%)",
          }}
          aria-hidden="true"
        />

        <div className="relative w-full max-w-[1240px] px-6 lg:px-10 py-12 md:py-20 grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-center">

          {/* COLUNA TEXTO — 7/12 em desktop (60%) */}
          <div className="md:col-span-7 flex flex-col gap-7 md:gap-9">
            {/* Eyebrow / badge */}
            <div className="um-anim-fade-up">
              <span className="inline-flex items-center gap-2.5">
                <span className="relative flex w-1.5 h-1.5">
                  <span className="animate-ping absolute inset-0 rounded-full bg-[#FF5C2E] opacity-60" />
                  <span className="relative w-1.5 h-1.5 rounded-full bg-[#FF5C2E]" />
                </span>
                <span className="text-[11px] font-bold tracking-[0.16em] text-[#4A4A47] uppercase">
                  Pré-lançamento aberto
                </span>
              </span>
            </div>

            {/* Headline editorial */}
            <h1
              className="um-anim-fade-up um-anim-delay-100 text-[#0F0F0E]"
              style={{
                fontSize: "clamp(40px, 6.5vw, 76px)",
                fontWeight: 800,
                lineHeight: 1.02,
                letterSpacing: "-0.045em",
              }}
            >
              A primeira{" "}
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #FF5C2E 0%, #FF8C5A 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                cidade digital
              </span>{" "}
              brasileira abre suas portas.
            </h1>

            {/* Sub editorial — peso radical contrastante com headline */}
            <p
              className="um-anim-fade-up um-anim-delay-200 text-[#4A4A47]"
              style={{
                fontSize: "clamp(16px, 1.4vw, 19px)",
                fontWeight: 400,
                lineHeight: 1.55,
                maxWidth: "44ch",
              }}
            >
              Estamos no início. Os primeiros moradores constroem a cidade que querem morar.
            </p>

            {/* Form de email */}
            <div className="um-anim-fade-up um-anim-delay-300 max-w-[520px] w-full">
              <HeroEmailForm />
            </div>

            {/* Microcopy LGPD implícita + diferencial */}
            <div className="um-anim-fade-up um-anim-delay-400 flex flex-col gap-3">
              <p className="text-[12px] text-[#8B8B85] leading-relaxed max-w-[42ch]">
                Cadastro em segundos. Ao continuar você aceita os{" "}
                <a href="/termos" className="text-[#4A4A47] underline decoration-[#C2C2BB] underline-offset-[3px] hover:decoration-[#0F0F0E] hover:text-[#0F0F0E] transition-colors">Termos</a>{" "}
                e a{" "}
                <a href="/privacidade" className="text-[#4A4A47] underline decoration-[#C2C2BB] underline-offset-[3px] hover:decoration-[#0F0F0E] hover:text-[#0F0F0E] transition-colors">Privacidade</a>.
              </p>
            </div>
          </div>

          {/* COLUNA VISUAL — 5/12 em desktop (40%) */}
          <div className="md:col-span-5 um-anim-fade-up um-anim-delay-500 order-first md:order-last">
            <PreviewProduto />
          </div>
        </div>
      </section>

      {/* FOOTER — editorial minimalista */}
      <footer className="border-t border-[#EDEAE5]/60 bg-[#FAFAF7] flex justify-center w-full">
        <div className="w-full max-w-[1240px] px-6 lg:px-10 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="Urban Members" width={20} height={20} style={{ display: "block" }} />
            <span className="text-[11px] font-semibold tracking-[0.16em] text-[#4A4A47] uppercase">Urban Members</span>
          </div>
          <p className="text-[11px] text-[#8B8B85]">
            © 2026 · A primeira cidade digital brasileira
          </p>
        </div>
      </footer>

    </main>
  );
}
