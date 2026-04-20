import Avatar from "@/components/ui/Avatar";
import ScoreBadge from "@/components/ui/ScoreBadge";

const courses = [
  {
    id: 1,
    title: "Marketing Digital para Pequenos Negócios",
    instructor: "Carlos Melo",
    city: "Fortaleza",
    score: 450,
    students: 312,
    duration: "4h 20min",
    lessons: 14,
    level: "Iniciante",
    progress: 0,
    tags: ["Marketing", "Negócios"],
  },
  {
    id: 2,
    title: "Design para quem não é designer",
    instructor: "Juliana Ramos",
    city: "BH",
    score: 850,
    students: 540,
    duration: "6h 10min",
    lessons: 20,
    level: "Iniciante",
    progress: 45,
    tags: ["Design", "Arte"],
  },
  {
    id: 3,
    title: "Como vender pelo Mercado Urbano",
    instructor: "Ana Lima",
    city: "São Paulo",
    score: 120,
    students: 198,
    duration: "2h 50min",
    lessons: 9,
    level: "Todos",
    progress: 100,
    tags: ["Vendas", "Mercado"],
  },
  {
    id: 4,
    title: "Finanças pessoais na prática",
    instructor: "Pedro Santos",
    city: "Recife",
    score: 430,
    students: 421,
    duration: "5h 00min",
    lessons: 16,
    level: "Intermediário",
    progress: 0,
    tags: ["Finanças", "Negócios"],
  },
];

const liveNow = {
  title: "Como construir uma marca do zero",
  instructor: "Mariana Costa",
  city: "Curitiba",
  score: 210,
  viewers: 87,
  startedAgo: "12min",
};

export default function SalaDeAula() {
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
            <span style={{ fontSize: "13px", color: "#A3A3A3", marginLeft: "4px" }}>/</span>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#525252" }}>Sala de Aula</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <ScoreBadge score={320} compact />
            <Avatar name="Você" size={36} />
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px 80px" }}>

        {/* Aula ao vivo */}
        <div style={{
          background: "#111111",
          borderRadius: "20px",
          padding: "28px 32px",
          marginBottom: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "24px",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "radial-gradient(circle at 80% 50%, rgba(255,92,46,0.12) 0%, transparent 60%)",
          }} />

          <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{
                background: "#FF5C2E", color: "#FFFFFF",
                fontSize: "10px", fontWeight: 700,
                padding: "3px 10px", borderRadius: "999px",
                letterSpacing: "0.08em", textTransform: "uppercase",
              }}>
                Ao vivo
              </span>
              <span style={{ fontSize: "12px", color: "#A3A3A3" }}>
                {liveNow.viewers} assistindo · começou há {liveNow.startedAgo}
              </span>
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.03em", lineHeight: 1.2 }}>
              {liveNow.title}
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Avatar name={liveNow.instructor} size={28} />
              <span style={{ fontSize: "13px", color: "#A3A3A3" }}>
                {liveNow.instructor} · {liveNow.city}
              </span>
            </div>
          </div>

          <button style={{
            position: "relative",
            background: "#FF5C2E", color: "#FFFFFF",
            border: "none", borderRadius: "999px",
            padding: "14px 28px",
            fontSize: "14px", fontWeight: 700,
            cursor: "pointer", whiteSpace: "nowrap",
            fontFamily: "Inter, sans-serif",
            flexShrink: 0,
          }}>
            Entrar na aula
          </button>
        </div>

        {/* Título da seção */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111111", letterSpacing: "-0.02em" }}>
            Cursos disponíveis
          </h3>
          <button style={{
            fontSize: "13px", fontWeight: 600, color: "#525252",
            background: "none", border: "none", cursor: "pointer",
            fontFamily: "Inter, sans-serif",
          }}>
            Ver todos
          </button>
        </div>

        {/* Grid de cursos */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "16px",
        }}>
          {courses.map((course) => (
            <div key={course.id} style={{
              background: "#FFFFFF",
              borderRadius: "18px",
              padding: "20px",
              display: "flex", flexDirection: "column", gap: "14px",
              border: "1px solid rgba(0,0,0,0.05)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              cursor: "pointer",
              transition: "box-shadow 0.2s, transform 0.15s",
            }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              {/* Tags */}
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {course.tags.map((tag) => (
                  <span key={tag} style={{
                    fontSize: "11px", fontWeight: 600,
                    color: "#525252", background: "#F5F5F5",
                    padding: "2px 10px", borderRadius: "999px",
                  }}>
                    {tag}
                  </span>
                ))}
                <span style={{
                  fontSize: "11px", fontWeight: 600,
                  color: "#A3A3A3",
                  padding: "2px 10px", borderRadius: "999px",
                  background: "#F5F5F5",
                }}>
                  {course.level}
                </span>
              </div>

              {/* Título */}
              <h4 style={{
                fontSize: "15px", fontWeight: 700,
                color: "#111111", lineHeight: 1.4,
                letterSpacing: "-0.01em",
              }}>
                {course.title}
              </h4>

              {/* Instrutor */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Avatar name={course.instructor} size={28} />
                <div>
                  <p style={{ fontSize: "12px", fontWeight: 600, color: "#111111" }}>{course.instructor}</p>
                  <p style={{ fontSize: "11px", color: "#A3A3A3" }}>{course.city}</p>
                </div>
                <div style={{ marginLeft: "auto" }}>
                  <ScoreBadge score={course.score} compact />
                </div>
              </div>

              {/* Progresso */}
              {course.progress > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "11px", color: "#A3A3A3" }}>
                      {course.progress === 100 ? "Concluído" : `${course.progress}% completo`}
                    </span>
                  </div>
                  <div style={{ background: "#E5E5E5", borderRadius: "999px", height: "3px", overflow: "hidden" }}>
                    <div style={{
                      width: `${course.progress}%`,
                      height: "100%",
                      background: course.progress === 100
                        ? "linear-gradient(90deg, #10B981, #34D399)"
                        : "linear-gradient(90deg, #FF5C2E, #FF8C5A)",
                      borderRadius: "999px",
                    }} />
                  </div>
                </div>
              )}

              {/* Rodapé */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                paddingTop: "10px", borderTop: "1px solid #F5F5F5",
              }}>
                <span style={{ fontSize: "12px", color: "#A3A3A3" }}>
                  {course.lessons} aulas · {course.duration}
                </span>
                <span style={{ fontSize: "12px", color: "#A3A3A3" }}>
                  {course.students.toLocaleString()} alunos
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
