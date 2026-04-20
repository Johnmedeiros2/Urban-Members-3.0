import PostCard from "@/components/ui/PostCard";
import ScoreBadge from "@/components/ui/ScoreBadge";
import Avatar from "@/components/ui/Avatar";

const ME = { name: "Você", score: 320, city: "São Paulo" };

const neighborhoods = [
  { label: "Início",      active: true },
  { label: "Bairros",     active: false },
  { label: "Aprender",    active: false },
  { label: "Mercado",     active: false },
  { label: "Negócios",    active: false },
  { label: "Arte",        active: false },
  { label: "Sala de Aula", active: false },
];

const posts = [
  {
    id: 1,
    user: "Ana Lima",
    city: "São Paulo",
    neighborhood: "Comércio",
    time: "2min",
    content: "Acabei de abrir minha loja no Mercado Urbano. Já tive 3 contatos no primeiro dia. Quem quiser conferir, é só visitar o bairro Comércio — vale muito.",
    likes: 24,
    comments: 8,
    score: 120,
  },
  {
    id: 2,
    user: "Carlos Melo",
    city: "Fortaleza",
    neighborhood: "Educação",
    time: "8min",
    content: "Terminei o curso de Marketing Digital aqui na cidade. A didática é completamente diferente — tudo contextualizado para quem quer crescer de onde está.",
    likes: 41,
    comments: 14,
    score: 450,
  },
  {
    id: 3,
    user: "Juliana Ramos",
    city: "BH",
    neighborhood: "Negócios",
    time: "15min",
    content: "Urban Score 850. Três meses atrás eu estava no zero. Isso aqui não é rede social — é uma cidade de verdade. Quem mais tá subindo o ranking essa semana?",
    likes: 67,
    comments: 31,
    score: 850,
  },
  {
    id: 4,
    user: "Pedro Santos",
    city: "Recife",
    neighborhood: "Negócios",
    time: "32min",
    content: "Conectei com 3 fornecedores novos hoje só pelo bairro Negócios. Sem cold call, sem LinkedIn premium. Só Urban.",
    likes: 33,
    comments: 12,
    score: 430,
  },
  {
    id: 5,
    user: "Mariana Costa",
    city: "Curitiba",
    neighborhood: "Arte",
    time: "1h",
    content: "Vendi minha primeira ilustração digital pelo Mercado Urbano. Pequeno pra muita gente, mas pra mim é enorme. Obrigada quem comprou 🙏",
    likes: 98,
    comments: 27,
    score: 210,
  },
];

const trending = [
  { tag: "#UrbanScore", posts: 1240 },
  { tag: "#MercadoUrbano", posts: 834 },
  { tag: "#BairroNegócios", posts: 621 },
  { tag: "#AprendaUrbano", posts: 415 },
];

export default function Feed() {
  return (
    <div style={{ minHeight: "100vh", background: "#F7F7F8", fontFamily: "Inter, sans-serif" }}>

      {/* Header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}>
        <div style={{
          maxWidth: "1100px", margin: "0 auto",
          padding: "0 24px", height: "60px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img src="/logo.svg" alt="Urban Members" width={36} height={36} />
            <span style={{ fontSize: "15px", fontWeight: 800, letterSpacing: "-0.03em", color: "#111111" }}>
              Urban Members
            </span>
          </div>

          {/* Search */}
          <div style={{
            flex: 1, maxWidth: "360px", margin: "0 32px",
            background: "#F5F5F5", borderRadius: "999px",
            padding: "0 16px", height: "40px",
            display: "flex", alignItems: "center", gap: "8px",
          }}>
            <span style={{ fontSize: "13px", color: "#A3A3A3", fontFamily: "Inter, sans-serif" }}>Buscar na cidade...</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <ScoreBadge score={ME.score} compact />
            <Avatar name={ME.name} size={36} />
          </div>
        </div>
      </header>

      {/* Layout principal */}
      <div style={{
        maxWidth: "1100px", margin: "0 auto",
        padding: "24px 24px 80px",
        display: "grid",
        gridTemplateColumns: "220px 1fr 280px",
        gap: "24px",
      }}>

        {/* Sidebar esquerda */}
        <aside>
          <div style={{
            background: "#FFFFFF", borderRadius: "16px",
            padding: "6px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            border: "1px solid rgba(0,0,0,0.05)",
            position: "sticky", top: "84px",
          }}>
            <p style={{
              fontSize: "10px", fontWeight: 600, color: "#A3A3A3",
              letterSpacing: "0.08em", textTransform: "uppercase",
              padding: "10px 14px 6px",
            }}>
              Navegação
            </p>
            {neighborhoods.map((n) => (
              <button key={n.label} style={{
                width: "100%",
                display: "flex", alignItems: "center",
                padding: "10px 14px",
                borderRadius: "10px", border: "none", cursor: "pointer",
                background: n.active ? "#111111" : "transparent",
                color: n.active ? "#FFFFFF" : "#6B6B6B",
                fontSize: "13.5px",
                fontWeight: n.active ? 600 : 400,
                letterSpacing: n.active ? "-0.01em" : "0",
                transition: "background 0.15s, color 0.15s",
                fontFamily: "Inter, sans-serif",
                textAlign: "left",
              }}>
                {n.label}
              </button>
            ))}

            {/* Score */}
            <div style={{
              margin: "10px 6px 6px",
              background: "#F7F7F8",
              borderRadius: "12px",
              padding: "14px",
              display: "flex", flexDirection: "column", gap: "8px",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#6B6B6B", letterSpacing: "0.02em" }}>
                  Urban Score
                </span>
                <ScoreBadge score={ME.score} compact />
              </div>
              <div style={{ background: "#E5E5E5", borderRadius: "999px", height: "3px", overflow: "hidden" }}>
                <div style={{
                  width: `${(ME.score / 900) * 100}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #FF5C2E, #FF8C5A)",
                  borderRadius: "999px",
                  transition: "width 0.6s ease",
                }} />
              </div>
              <p style={{ fontSize: "11px", color: "#A3A3A3", letterSpacing: "0.01em" }}>
                {300 - ME.score} pts para o próximo nível
              </p>
            </div>
          </div>
        </aside>

        {/* Feed central */}
        <main style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Composer */}
          <div style={{
            background: "#FFFFFF", borderRadius: "20px",
            padding: "16px 20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            border: "1px solid rgba(0,0,0,0.05)",
            display: "flex", alignItems: "center", gap: "12px",
          }}>
            <Avatar name={ME.name} size={40} />
            <div style={{
              flex: 1, background: "#F7F7F8", borderRadius: "999px",
              padding: "11px 18px", cursor: "text",
              fontSize: "14px", color: "#A3A3A3",
            }}>
              O que está acontecendo na sua cidade?
            </div>
            <button style={{
              background: "#111111", color: "#FFFFFF",
              border: "none", borderRadius: "999px",
              padding: "10px 20px", fontSize: "13px", fontWeight: 700,
              cursor: "pointer",
            }}>
              Postar
            </button>
          </div>

          {/* Posts */}
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </main>

        {/* Sidebar direita — Trending */}
        <aside>
          <div style={{
            background: "#FFFFFF", borderRadius: "20px",
            padding: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            border: "1px solid rgba(0,0,0,0.05)",
            position: "sticky", top: "84px",
            display: "flex", flexDirection: "column", gap: "16px",
          }}>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "#111111" }}>
              Em alta na cidade
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {trending.map((t, i) => (
                <div key={t.tag} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "12px", color: "#A3A3A3", fontWeight: 700, width: "16px" }}>
                    {i + 1}
                  </span>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 700, color: "#111111" }}>{t.tag}</p>
                    <p style={{ fontSize: "11px", color: "#A3A3A3" }}>{t.posts.toLocaleString()} posts</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid #F5F5F5", paddingTop: "16px" }}>
              <p style={{ fontSize: "14px", fontWeight: 700, color: "#111111", marginBottom: "12px" }}>
                Moradores sugeridos
              </p>
              {["Beatriz Nunes", "Rafael Torres", "Camila Dias"].map((name) => (
                <div key={name} style={{
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between", marginBottom: "12px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Avatar name={name} size={36} />
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#111111" }}>{name}</span>
                  </div>
                  <button style={{
                    fontSize: "12px", fontWeight: 700,
                    color: "#111111", background: "#F5F5F5",
                    border: "none", borderRadius: "999px",
                    padding: "6px 14px", cursor: "pointer",
                  }}>
                    Seguir
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>

      </div>

      {/* Bottom nav mobile */}
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(16px)",
        borderTop: "1px solid rgba(0,0,0,0.06)",
        display: "flex",
        padding: "10px 8px env(safe-area-inset-bottom)",
      }}>
        {neighborhoods.map((n) => (
          <button key={n.label} style={{
            flex: 1,
            padding: "8px 4px",
            border: "none",
            background: n.active ? "#111111" : "transparent",
            cursor: "pointer",
            color: n.active ? "#FFFFFF" : "#A3A3A3",
            fontSize: "12px",
            fontWeight: n.active ? 600 : 400,
            borderRadius: "8px",
            letterSpacing: "-0.01em",
            fontFamily: "Inter, sans-serif",
            transition: "background 0.15s, color 0.15s",
          }}>
            {n.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
