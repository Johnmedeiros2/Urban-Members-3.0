export default function Home() {
  return (
    <main className="min-h-screen bg-white text-[#111111] w-full" style={{ fontFamily: "Inter, sans-serif" }}>

      {/* HERO */}
      <section className="relative overflow-hidden flex justify-center w-full">
        {/* Skyline SVG no fundo */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 70% 30%, rgba(255,92,46,0.08) 0%, transparent 60%)" }} />
          <svg
            className="absolute bottom-0 left-0 right-0 w-full opacity-[0.06]"
            viewBox="0 0 1440 200"
            preserveAspectRatio="none"
            style={{ height: "200px" }}
          >
            <path
              fill="#111111"
              d="M0,200 L0,140 L60,140 L60,90 L120,90 L120,120 L180,120 L180,60 L240,60 L240,100 L300,100 L300,80 L360,80 L360,130 L420,130 L420,70 L480,70 L480,110 L540,110 L540,50 L600,50 L600,90 L660,90 L660,120 L720,120 L720,80 L780,80 L780,140 L840,140 L840,100 L900,100 L900,60 L960,60 L960,110 L1020,110 L1020,130 L1080,130 L1080,90 L1140,90 L1140,70 L1200,70 L1200,120 L1260,120 L1260,100 L1320,100 L1320,140 L1380,140 L1380,90 L1440,90 L1440,200 Z"
            />
          </svg>
        </div>

        <div className="relative w-full max-w-md px-6 pt-20 pb-16 flex flex-col gap-10">
          {/* Logo + identidade */}
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Urban Members" width={56} height={56} style={{ display: "block" }} />
            <span className="text-sm font-bold tracking-widest text-[#111111] uppercase">Urban Members</span>
          </div>

          {/* Headline + subline */}
          <div className="flex flex-col gap-5">
            <h1 className="text-[40px] font-bold leading-tight text-[#111111] tracking-tight">
              A primeira cidade digital brasileira está no dia&nbsp;1.
            </h1>
            <p className="text-base text-[#525252] leading-relaxed">
              Estamos no início. Os primeiros moradores ajudam a construir a cidade que querem morar.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-3">
            <a
              href="/cadastro"
              className="w-full h-14 bg-[#111111] text-white text-sm font-semibold rounded-full flex items-center justify-center hover:bg-[#FF5C2E] transition-colors duration-200"
            >
              Reservar meu endereço
            </a>
            <a
              href="/login"
              className="w-full h-14 border border-[#E5E5E5] text-[#111111] text-sm font-semibold rounded-full flex items-center justify-center hover:border-[#111111] transition-colors duration-200"
            >
              Já tenho conta
            </a>
            <p className="text-xs text-[#A3A3A3] text-center mt-1">
              Cadastro gratuito · 30 segundos · sem cartão
            </p>
          </div>
        </div>
      </section>

      {/* ENDOSSO ADONAI */}
      <section className="border-t border-[#F5F5F5] bg-[#FAFAFA] flex justify-center w-full">
        <div className="w-full max-w-md px-6 py-8 flex flex-col items-center gap-3 text-center">
          <p className="text-[10px] font-bold tracking-[0.12em] text-[#A3A3A3] uppercase">Apoiado por</p>
          <p className="text-sm font-bold text-[#111111]">Instituto Caxiense Shalom Adonai</p>
          <p className="text-xs text-[#525252] leading-relaxed">
            36 anos cuidando da educação de famílias em Duque de Caxias
          </p>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="border-t border-[#F5F5F5] flex justify-center w-full">
        <div className="w-full max-w-md px-6 py-16 flex flex-col gap-10">
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-bold tracking-[0.12em] text-[#FF5C2E] uppercase">Como funciona</p>
            <h2 className="text-2xl font-bold leading-tight text-[#111111] tracking-tight">
              Em 3 passos você é morador.
            </h2>
          </div>

          <ol className="flex flex-col gap-6">
            <li className="flex gap-4">
              <div className="shrink-0 w-10 h-10 rounded-full bg-[#FFF3EF] flex items-center justify-center text-base">🏘️</div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-bold text-[#111111]">1. Reserve seu endereço</p>
                <p className="text-sm text-[#525252] leading-relaxed">Cadastro gratuito em 30 segundos. Sem cartão.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="shrink-0 w-10 h-10 rounded-full bg-[#FFF3EF] flex items-center justify-center text-base">🏪</div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-bold text-[#111111]">2. Conheça seus vizinhos</p>
                <p className="text-sm text-[#525252] leading-relaxed">Lojistas, professores e moradores reais — sem algoritmo bloqueando.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="shrink-0 w-10 h-10 rounded-full bg-[#FFF3EF] flex items-center justify-center text-base">🛒</div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-bold text-[#111111]">3. Aprenda, conecte ou venda</p>
                <p className="text-sm text-[#525252] leading-relaxed">Tudo dentro da sua cidade digital. Sem sair de casa.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-[#F5F5F5] bg-[#FAFAFA] flex justify-center w-full">
        <div className="w-full max-w-md px-6 py-16 flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-bold tracking-[0.12em] text-[#A3A3A3] uppercase">Perguntas frequentes</p>
            <h2 className="text-2xl font-bold leading-tight text-[#111111] tracking-tight">
              Coisas que você pode estar pensando.
            </h2>
          </div>

          <dl className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <dt className="text-sm font-bold text-[#111111]">É grátis?</dt>
              <dd className="text-sm text-[#525252] leading-relaxed">Sim. Cadastro e uso são gratuitos. Comissão Urban (10%) só existe quando um lojista vende dentro da cidade.</dd>
            </div>
            <div className="flex flex-col gap-2">
              <dt className="text-sm font-bold text-[#111111]">Pra quem é?</dt>
              <dd className="text-sm text-[#525252] leading-relaxed">Pra quem quer aprender com gente real, vender sem ser esmagado por comissões altas, ou conectar com vizinhos da própria cidade.</dd>
            </div>
            <div className="flex flex-col gap-2">
              <dt className="text-sm font-bold text-[#111111]">Quando lança?</dt>
              <dd className="text-sm text-[#525252] leading-relaxed">15 de maio de 2026. Quem reserva o endereço antes entra em pré-lançamento.</dd>
            </div>
            <div className="flex flex-col gap-2">
              <dt className="text-sm font-bold text-[#111111]">Posso usar agora?</dt>
              <dd className="text-sm text-[#525252] leading-relaxed">Sim. O pré-lançamento já está aberto pra famílias Adonai e indicados. Reserve seu endereço pra entrar.</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="border-t border-[#F5F5F5] flex justify-center w-full">
        <div className="w-full max-w-md px-6 py-16 flex flex-col gap-6 items-center text-center">
          <h2 className="text-2xl font-bold leading-tight text-[#111111] tracking-tight">
            Pronto pra ser morador?
          </h2>
          <p className="text-sm text-[#525252] leading-relaxed">
            Reserve seu endereço agora e entre na cidade antes do mundo.
          </p>
          <a
            href="/cadastro"
            className="w-full max-w-xs h-14 bg-[#111111] text-white text-sm font-semibold rounded-full flex items-center justify-center hover:bg-[#FF5C2E] transition-colors duration-200"
          >
            Reservar meu endereço
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#F5F5F5] bg-white flex justify-center w-full">
        <div className="w-full max-w-md px-6 py-8 flex items-center justify-between">
          <p className="text-xs text-[#A3A3A3]">urbanicsa.com</p>
          <p className="text-xs text-[#A3A3A3]">© 2026 Urban Members</p>
        </div>
      </footer>

    </main>
  );
}
