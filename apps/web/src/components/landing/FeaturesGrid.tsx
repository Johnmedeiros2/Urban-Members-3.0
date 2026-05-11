const FEATURES = [
  {
    emoji: "🛍️",
    title: "Venda seus produtos com a melhor comissão",
    description: "Monetize seu catálogo de produtos digitais, serviços ou itens físicos. Você recebe",
    highlight: "90% do valor.",
    descriptionEnd: "Nós ficamos com 10% apenas em vendas concluídas.",
    tag: "10% só no sucesso",
    color: "#FF5C2E",
  },
  {
    emoji: "📚",
    title: "Crie e venda cursos online",
    description: "Estruture seu conhecimento em trilhas de aprendizado. Receba em tempo real quando seus alunos se inscrevem.",
    highlight: "Validado por nossa equipe pedagógica.",
    descriptionEnd: "",
    tag: "Trilhas estruturadas",
    color: "#3B82F6",
  },
  {
    emoji: "🎬",
    title: "Transmita ao vivo e monetize",
    description: "Faça lives para sua comunidade e ganhe com",
    highlight: "super chats, doações e produtos",
    descriptionEnd: "vendidos durante a transmissão.",
    tag: "Monetização ao vivo",
    color: "#EC4899",
  },
  {
    emoji: "🎮",
    title: "Ganhe reputação e destaque",
    description: "Acumule pontos (Urban Score) em 5 níveis (Starter → Legend). Criadores com scores altos ganham",
    highlight: "visibilidade premium e oportunidades exclusivas.",
    descriptionEnd: "",
    tag: "5 níveis",
    color: "#F59E0B",
  },
  {
    emoji: "🤖",
    title: "Trilhas adaptativas com tutor IA",
    description: "Aprenda no seu ritmo com sugestões personalizadas de IA. Cada aluno segue um",
    highlight: "caminho único",
    descriptionEnd: "validado por nossa equipe pedagógica.",
    tag: "Tutor IA",
    color: "#8B5CF6",
  },
  {
    emoji: "👥",
    title: "Conecte com outros criadores",
    description: "Construa sua rede, colabore em projetos e tenha acesso a oportunidades exclusivas.",
    highlight: "Sua comunidade é sua força.",
    descriptionEnd: "",
    tag: "Cidade digital",
    color: "#10B981",
  },
];

export default function FeaturesGrid() {
  return (
    <section id="features" style={{ background: "#F7F7F8", padding: "100px 24px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#FF5C2E", marginBottom: "12px" }}>
            Tudo em um lugar
          </p>
          <h2
            style={{
              fontSize: "clamp(32px, 4vw, 48px)",
              fontWeight: 900,
              color: "#111111",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              marginBottom: "18px",
            }}
          >
            Uma plataforma,{" "}
            <span style={{ color: "#FF5C2E" }}>infinitas formas</span>
            <br />de ganhar
          </h2>
          <p style={{ fontSize: "16px", color: "#525252", maxWidth: "520px", margin: "0 auto", lineHeight: 1.65 }}>
            Do marketplace ao aprendizado com IA — Urban tem todas as ferramentas que um criador moderno precisa.
          </p>
        </div>

        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "20px",
          }}
        >
          {FEATURES.map(({ emoji, title, description, highlight, descriptionEnd, tag, color }) => (
            <div
              key={title}
              className="um-card um-clickable"
              style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {/* Icon */}
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "16px",
                  background: `${color}14`,
                  border: `1px solid ${color}28`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "26px",
                }}
              >
                {emoji}
              </div>

              {/* Content */}
              <div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "10px", flexWrap: "wrap" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#111111", letterSpacing: "-0.02em", lineHeight: 1.3 }}>
                    {title}
                  </h3>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      color: color,
                      background: `${color}12`,
                      border: `1px solid ${color}24`,
                      padding: "2px 8px",
                      borderRadius: "999px",
                      letterSpacing: "0.04em",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {tag}
                  </span>
                </div>
                <p style={{ fontSize: "14px", color: "#525252", lineHeight: 1.65 }}>
                  {description}{" "}
                  <strong style={{ color: "#111111", fontWeight: 700 }}>{highlight}</strong>
                  {descriptionEnd && ` ${descriptionEnd}`}
                </p>
              </div>

              {/* Visual placeholder */}
              <div
                style={{
                  height: "100px",
                  borderRadius: "14px",
                  background: `linear-gradient(135deg, ${color}08, ${color}16)`,
                  border: `1px solid ${color}14`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "36px",
                  marginTop: "auto",
                }}
              >
                {emoji}
              </div>

              {/* Link */}
              <a
                href="/cadastro"
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: color,
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                Saiba mais
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
