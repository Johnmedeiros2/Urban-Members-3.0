const FEATURES = [
  {
    emoji: "🛍️",
    title: "Venda seus produtos com a melhor comissão",
    description: "Monetize seu catálogo de produtos digitais, serviços ou itens físicos. Você recebe",
    highlight: "90% do valor.",
    descriptionEnd: "Nós ficamos com 10% apenas em vendas concluídas.",
    tag: "10% só no sucesso",
    color: "#FF5C2E",
    image: "/images/feature-marketplace.png",
    imageAlt: "Marketplace Urban Members — grid de produtos à venda",
  },
  {
    emoji: "📚",
    title: "Crie e venda cursos online",
    description: "Estruture seu conhecimento em trilhas de aprendizado. Receba em tempo real quando seus alunos se inscrevem.",
    highlight: "Validado por nossa equipe pedagógica.",
    descriptionEnd: "",
    tag: "Trilhas estruturadas",
    color: "#3B82F6",
    image: "/images/feature-courses.png",
    imageAlt: "Sala de Aula Urban Members — cursos online com certificado",
  },
  {
    emoji: "🎬",
    title: "Transmita ao vivo e monetize",
    description: "Faça lives para sua comunidade e ganhe com",
    highlight: "super chats, doações e produtos",
    descriptionEnd: "vendidos durante a transmissão.",
    tag: "Monetização ao vivo",
    color: "#EC4899",
    image: "/images/feature-lives.png",
    imageAlt: "Lives Urban Members — transmissões ao vivo com monetização",
  },
  {
    emoji: "🎮",
    title: "Ganhe reputação e destaque",
    description: "Acumule pontos (Urban Score) em 5 níveis (Starter → Legend). Criadores com scores altos ganham",
    highlight: "visibilidade premium e oportunidades exclusivas.",
    descriptionEnd: "",
    tag: "5 níveis",
    color: "#F59E0B",
    image: "/images/feature-gamification.png",
    imageAlt: "Urban Score — sistema de gamificação com 5 níveis de reputação",
  },
  {
    emoji: "🤖",
    title: "Trilhas adaptativas com tutor IA",
    description: "Aprenda no seu ritmo com sugestões personalizadas de IA. Cada aluno segue um",
    highlight: "caminho único",
    descriptionEnd: "validado por nossa equipe pedagógica.",
    tag: "Tutor IA",
    color: "#8B5CF6",
    image: "/images/feature-ia.png",
    imageAlt: "Urban Academy — trilhas adaptativas com tutor IA",
  },
  {
    emoji: "👥",
    title: "Conecte com outros criadores",
    description: "Construa sua rede, colabore em projetos e tenha acesso a oportunidades exclusivas.",
    highlight: "Sua comunidade é sua força.",
    descriptionEnd: "",
    tag: "Cidade digital",
    color: "#10B981",
    image: "/images/feature-community.png",
    imageAlt: "Feed Social Urban Members — comunidade de criadores",
  },
];

import Image from "next/image";

export default function FeaturesGrid() {
  return (
    <section id="features" aria-label="Funcionalidades da plataforma" style={{ background: "#F7F7F8", padding: "clamp(64px, 10vw, 100px) 24px" }}>
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
        <div className="lp-features-grid">
          {FEATURES.map(({ emoji, title, description, highlight, descriptionEnd, tag, color, image, imageAlt }) => (
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

              {/* Screenshot */}
              <div
                style={{
                  marginTop: "auto",
                  borderRadius: "14px",
                  overflow: "hidden",
                  border: `1px solid ${color}14`,
                  background: `${color}08`,
                  height: "180px",
                  position: "relative",
                }}
              >
                <Image
                  src={image}
                  alt={imageAlt}
                  fill
                  loading="lazy"
                  sizes="(max-width: 680px) calc(100vw - 48px), (max-width: 1200px) 50vw, 380px"
                  style={{ objectFit: "cover", objectPosition: "top" }}
                />
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
