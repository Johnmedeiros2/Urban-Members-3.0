"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Avatar from "@/components/ui/Avatar";
import ScoreBadge from "@/components/ui/ScoreBadge";
import PostCard from "@/components/ui/PostCard";

const BAIRROS_DATA: Record<string, {
  descricao: string;
  cor: string;
  membros: number;
  posts: number;
  ativos: number;
}> = {
  "negocios":    { descricao: "Empreendedores, vendedores e profissionais conectados por oportunidade.", cor: "#111111", membros: 487, posts: 2341, ativos: 89 },
  "educacao":    { descricao: "Aprendizado prático para quem quer crescer de onde está.",               cor: "#6366F1", membros: 312, posts: 1204, ativos: 61 },
  "arte":        { descricao: "Criadores, artistas e expressão sem fronteiras.",                        cor: "#EC4899", membros: 298, posts: 987,  ativos: 54 },
  "mercado":     { descricao: "Compre, venda e descubra produtos de moradores reais.",                  cor: "#FF5C2E", membros: 271, posts: 743,  ativos: 48 },
  "tecnologia":  { descricao: "Devs, designers e inovadores construindo o futuro.",                     cor: "#0EA5E9", membros: 189, posts: 612,  ativos: 37 },
  "sala-de-aula":{ descricao: "Aulas ao vivo e cursos gravados para todos os níveis.",                  cor: "#10B981", membros: 167, posts: 421,  ativos: 29 },
};

const MEMBROS_DESTAQUE = [
  { nome: "Juliana Ramos", cidade: "BH",         score: 850, role: "Top criadora" },
  { nome: "Carlos Melo",   cidade: "Fortaleza",  score: 450, role: "Professor"    },
  { nome: "Pedro Santos",  cidade: "Recife",     score: 430, role: "Lojista"      },
  { nome: "Ana Lima",      cidade: "São Paulo",  score: 120, role: "Nova moradora" },
];

const POSTS_BAIRRO = [
  { id: 1, user: "Juliana Ramos",  city: "BH",        neighborhood: "Negócios", time: "2min",  content: "Três meses vendendo pelo Mercado Urbano. Resultados reais, sem precisar sair da cidade.", likes: 67, comments: 31, score: 850 },
  { id: 2, user: "Carlos Melo",    city: "Fortaleza", neighborhood: "Negócios", time: "1h",    content: "Conectei com 5 fornecedores novos essa semana. O bairro Negócios é diferente.", likes: 41, comments: 14, score: 450 },
  { id: 3, user: "Pedro Santos",   city: "Recife",    neighborhood: "Negócios", time: "3h",    content: "Primeira venda pelo Urban Pay concluída. Simples, rápido e sem taxa antecipada.", likes: 33, comments: 12, score: 430 },
];

const LOJAS = [
  { nome: "Studio Ana Lima",  tipo: "Design",     vendas: 143, score: 120 },
  { nome: "Melo Digital",     tipo: "Marketing",  vendas: 312, score: 450 },
  { nome: "Santos Finanças",  tipo: "Finanças",   vendas: 621, score: 430 },
];

const ABAS = ["Feed", "Membros", "Lojas & Cursos"];

export default function BairroPage() {
  const params = useParams();
  const nomeParam = (params.nome as string) || "negocios";
  const bairro = BAIRROS_DATA[nomeParam] ?? BAIRROS_DATA["negocios"];
  const nomeDisplay = nomeParam.charAt(0).toUpperCase() + nomeParam.slice(1).replace("-", " ");

  const [aba, setAba] = useState("Feed");
  const [entrou, setEntrou] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: "#F7F7F8", fontFamily: "Inter, sans-serif" }}>

      {/* Header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <img src="/logo.svg" alt="Urban Members" width={32} height={32} />
            <span style={{ fontSize: "14px", color: "#A3A3A3" }}>/</span>
            <a href="/feed" style={{ fontSize: "13px", color: "#A3A3A3", textDecoration: "none" }}>Bairros</a>
            <span style={{ fontSize: "14px", color: "#A3A3A3" }}>/</span>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#111111" }}>{nomeDisplay}</span>
          </div>
          <ScoreBadge score={320} compact />
        </div>
      </header>

      {/* Hero do bairro */}
      <div style={{
        background: bairro.cor, padding: "48px 24px 0",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 80% 50%, rgba(255,255,255,0.08) 0%, transparent 60%)" }} />
        <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative" }}>
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>
            Bairro
          </p>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h1 style={{ fontSize: "36px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                {nomeDisplay}
              </h1>
              <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.75)", marginTop: "8px", maxWidth: "480px" }}>
                {bairro.descricao}
              </p>
            </div>
            <button
              onClick={() => setEntrou(!entrou)}
              style={{
                height: "44px", padding: "0 24px",
                background: entrou ? "rgba(255,255,255,0.15)" : "#FFFFFF",
                color: entrou ? "#FFFFFF" : bairro.cor,
                border: entrou ? "1.5px solid rgba(255,255,255,0.4)" : "none",
                borderRadius: "999px", fontSize: "14px", fontWeight: 700,
                cursor: "pointer", fontFamily: "Inter, sans-serif",
                transition: "all 0.2s", marginBottom: "24px",
              }}
            >
              {entrou ? "✓ Você mora aqui" : "Entrar no bairro"}
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: "32px", marginTop: "24px", paddingBottom: "24px", borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
            {[
              { label: "Moradores", value: bairro.membros.toLocaleString() },
              { label: "Posts",     value: bairro.posts.toLocaleString()   },
              { label: "Ativos hoje", value: bairro.ativos.toString()      },
            ].map((s) => (
              <div key={s.label}>
                <p style={{ fontSize: "22px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.03em" }}>{s.value}</p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginTop: "2px" }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Abas */}
          <div style={{ display: "flex", gap: "4px" }}>
            {ABAS.map((a) => (
              <button key={a} onClick={() => setAba(a)} style={{
                padding: "12px 20px", border: "none", background: "transparent",
                fontSize: "13px", fontWeight: aba === a ? 700 : 400,
                color: aba === a ? "#FFFFFF" : "rgba(255,255,255,0.5)",
                cursor: "pointer", fontFamily: "Inter, sans-serif",
                borderBottom: aba === a ? "2px solid #FFFFFF" : "2px solid transparent",
              }}>{a}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px 24px 80px", display: "grid", gridTemplateColumns: "1fr 300px", gap: "24px" }}>

        {/* Coluna principal */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {aba === "Feed" && POSTS_BAIRRO.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}

          {aba === "Membros" && (
            <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "20px", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111111", marginBottom: "16px" }}>
                Moradores do bairro
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {MEMBROS_DESTAQUE.map((m) => (
                  <div key={m.nome} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderRadius: "12px", border: "1px solid #F5F5F5" }}>
                    <Avatar name={m.nome} size={44} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "14px", fontWeight: 700, color: "#111111" }}>{m.nome}</p>
                      <p style={{ fontSize: "12px", color: "#A3A3A3" }}>{m.cidade} · {m.role}</p>
                    </div>
                    <ScoreBadge score={m.score} compact />
                    <button style={{ height: "32px", padding: "0 16px", background: "#111111", color: "#FFFFFF", border: "none", borderRadius: "999px", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                      Conectar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {aba === "Lojas & Cursos" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {LOJAS.map((loja) => (
                <div key={loja.nome} style={{ background: "#FFFFFF", borderRadius: "16px", padding: "16px 20px", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Avatar name={loja.nome} size={48} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "14px", fontWeight: 700, color: "#111111" }}>{loja.nome}</p>
                    <p style={{ fontSize: "12px", color: "#A3A3A3" }}>{loja.tipo} · {loja.vendas} vendas</p>
                  </div>
                  <ScoreBadge score={loja.score} compact />
                  <button style={{ height: "36px", padding: "0 18px", background: "#F5F5F5", color: "#111111", border: "none", borderRadius: "999px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                    Visitar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar — membros em destaque */}
        <aside>
          <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "20px", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", position: "sticky", top: "84px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111111" }}>Mais ativos</h3>
            {MEMBROS_DESTAQUE.map((m, i) => (
              <div key={m.nome} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "12px", color: "#A3A3A3", fontWeight: 700, width: "16px" }}>{i + 1}</span>
                <Avatar name={m.nome} size={36} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#111111" }}>{m.nome}</p>
                  <p style={{ fontSize: "11px", color: "#A3A3A3" }}>{m.cidade}</p>
                </div>
                <ScoreBadge score={m.score} compact />
              </div>
            ))}

            <div style={{ borderTop: "1px solid #F5F5F5", paddingTop: "16px" }}>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#111111", marginBottom: "8px" }}>Outros bairros</p>
              {Object.keys(BAIRROS_DATA).filter(b => b !== nomeParam).slice(0, 4).map((b) => (
                <a key={b} href={`/bairros/${b}`} style={{ display: "block", fontSize: "13px", color: "#525252", padding: "6px 0", textDecoration: "none", borderBottom: "1px solid #F5F5F5" }}>
                  {b.charAt(0).toUpperCase() + b.slice(1).replace("-", " ")}
                </a>
              ))}
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
