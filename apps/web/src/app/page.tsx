export default function Home() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full flex flex-col gap-10">

        {/* Logo + identidade */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo.svg"
              alt="Urban Members"
              width={56}
              height={56}
              style={{ display: "block" }}
            />
            <span className="text-sm font-bold tracking-widest text-[#111111] uppercase">
              Urban Members
            </span>
          </div>

          <h1 className="text-[40px] font-bold leading-tight text-[#111111]">
            Sua cidade.<br />Sem sair de casa.
          </h1>
        </div>

        {/* Subline */}
        <p className="text-base text-[#525252] leading-relaxed">
          Aprenda. Conecte. Cresça.<br />
          Tudo na sua cidade digital.
        </p>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <a
            href="/cadastro"
            className="w-full h-14 bg-[#111111] text-white text-sm font-semibold rounded-full flex items-center justify-center hover:bg-[#FF5C2E] transition-colors duration-200"
          >
            Encontre sua cidade
          </a>
          <a
            href="/login"
            className="w-full h-14 border border-[#E5E5E5] text-[#111111] text-sm font-semibold rounded-full flex items-center justify-center hover:border-[#111111] transition-colors duration-200"
          >
            Já tenho conta
          </a>
        </div>

      </div>
    </main>
  );
}
