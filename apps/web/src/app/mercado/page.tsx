"use client";

import Avatar from "@/components/ui/Avatar";
import ScoreBadge from "@/components/ui/ScoreBadge";
import BotaoConvite from "@/components/ui/BotaoConvite";

const categorias = [
  { label: "Todos",       active: true  },
  { label: "Digital",     active: false },
  { label: "Serviços",    active: false },
  { label: "Físico",      active: false },
  { label: "Cursos",      active: false },
  { label: "Consultoria", active: false },
];

const destaques = [
  {
    id: 1,
    nome: "Pack de Templates para Instagram",
    vendedor: "Juliana Ramos",
    cidade: "BH",
    score: 850,
    preco: 47,
    categoria: "Digital",
    vendas: 312,
    descricao: "50 templates editáveis no Canva para negócios locais. Funciona para qualquer nicho.",
    tag: "Mais vendido",
    tagColor: "#FF5C2E",
  },
  {
    id: 2,
    nome: "Mentoria 1h — Marketing Digital",
    vendedor: "Carlos Melo",
    cidade: "Fortaleza",
    score: 450,
    preco: 120,
    categoria: "Consultoria",
    vendas: 89,
    descricao: "Sessão individual de 1 hora focada no seu negócio. Estratégia, tráfego e conversão.",
    tag: "Em alta",
    tagColor: "#111111",
  },
  {
    id: 3,
    nome: "Identidade Visual Completa",
    vendedor: "Ana Lima",
    cidade: "São Paulo",
    score: 120,
    preco: 380,
    categoria: "Serviços",
    vendas: 27,
    descricao: "Logo, paleta, tipografia, cartão e papelaria. Entrega em 7 dias úteis.",
    tag: "Novo",
    tagColor: "#10B981",
  },
  {
    id: 4,
    nome: "Planilha de Controle Financeiro",
    vendedor: "Pedro Santos",
    cidade: "Recife",
    score: 430,
    preco: 29,
    categoria: "Digital",
    vendas: 541,
    descricao: "Controle de gastos, metas e investimentos. Simples, bonita e funcional.",
    tag: "Mais vendido",
    tagColor: "#FF5C2E",
  },
  {
    id: 5,
    nome: "Copy para Página de Vendas",
    vendedor: "Mariana Costa",
    cidade: "Curitiba",
    score: 210,
    preco: 197,
    categoria: "Serviços",
    vendas: 44,
    descricao: "Texto persuasivo para sua página de vendas. Inclui revisão e ajustes.",
    tag: null,
    tagColor: "",
  },
  {
    id: 6,
    nome: "E-book: Venda pelo WhatsApp",
    vendedor: "Rafael Torres",
    cidade: "Goiânia",
    score: 175,
    preco: 19,
    categoria: "Digital",
    vendas: 728,
    descricao: "Guia prático para transformar conversas em vendas. Linguagem simples e direta.",
    tag: "Em alta",
    tagColor: "#111111",
  },
];

const lojas = [
  { nome: "Studio Ana Lima",   vendedor: "Ana Lima",      cidade: "São Paulo",  score: 120, produtos: 8,  vendas: 143 },
  { nome: "Melo Digital",      vendedor: "Carlos Melo",   cidade: "Fortaleza",  score: 450, produtos: 5,  vendas: 312 },
  { nome: "Ramos Criativo",    vendedor: "Juliana Ramos", cidade: "BH",         score: 850, produtos: 14, vendas: 891 },
  { nome: "Santos Finanças",   vendedor: "Pedro Santos",  cidade: "Recife",     score: 430, produtos: 3,  vendas: 621 },
];

export default function Mercado() {
  return (
    <div style={{ minHeight: "100vh", background: "#F7F7F8", fontFamily: "Inter, sans-serif" }}>

      {/* Header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img src="/logo.svg" alt="Urban Members" width={32} height={32} />
            <span style={{ fontSize: "15px", fontWeight: 800, letterSpacing: "-0.03em", color: "#111111" }}>Urban Members</span>
            <span style={{ fontSize: "13px", color: "#A3A3A3", margin: "0 4px" }}>/</span>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#525252" }}>Mercado Urbano</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <BotaoConvite variant="ghost" />
            <button style={{ height: "36px", padding: "0 18px", background: "#111111", color: "#FFFFFF", border: "none", borderRadius: "999px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
              + Vender
            </button>
            <ScoreBadge score={320} compact />
            <Avatar name="Você" size={36} />
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px 80px" }}>

        {/* Hero */}
        <div style={{
          background: "#111111", borderRadius: "24px",
          padding: "40px 48px", marginBottom: "32px",
          position: "relative", overflow: "hidden",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: "32px",
        }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 80% 50%, rgba(255,92,46,0.15) 0%, transparent 55%), radial-gradient(circle at 10% 80%, rgba(255,255,255,0.03) 0%, transparent 40%)" }} />
          <div style={{ position: "relative" }}>
            <p style={{ fontSize: "12px", color: "#FF5C2E", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>
              Mercado Urbano
            </p>
            <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.03em", lineHeight: 1.2, marginBottom: "12px" }}>
              Compre e venda<br />dentro da cidade.
            </h1>
            <p style={{ fontSize: "15px", color: "#A3A3A3", lineHeight: 1.6, maxWidth: "400px" }}>
              Produtos digitais, serviços, mentorias e muito mais — de moradores reais para moradores reais. Urban só ganha quando você ganha.
            </p>
          </div>
          <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "12px", flexShrink: 0 }}>
            {[
              { label: "Produtos disponíveis", value: "2.841" },
              { label: "Vendas realizadas",    value: "18.4k" },
              { label: "Vendedores ativos",    value: "934"   },
            ].map((stat) => (
              <div key={stat.label} style={{ background: "rgba(255,255,255,0.06)", borderRadius: "12px", padding: "12px 20px", textAlign: "center" }}>
                <p style={{ fontSize: "22px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.03em" }}>{stat.value}</p>
                <p style={{ fontSize: "11px", color: "#A3A3A3", marginTop: "2px" }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Busca + categorias */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "240px", background: "#FFFFFF", borderRadius: "999px", padding: "0 18px", height: "44px", display: "flex", alignItems: "center", gap: "8px", border: "1px solid #E5E5E5" }}>
            <span style={{ fontSize: "14px", color: "#A3A3A3" }}>🔍</span>
            <span style={{ fontSize: "14px", color: "#A3A3A3" }}>Buscar produtos, serviços ou vendedores...</span>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {categorias.map((cat) => (
              <button key={cat.label} style={{
                height: "44px", padding: "0 18px",
                background: cat.active ? "#111111" : "#FFFFFF",
                color: cat.active ? "#FFFFFF" : "#525252",
                border: `1px solid ${cat.active ? "#111111" : "#E5E5E5"}`,
                borderRadius: "999px", fontSize: "13px", fontWeight: cat.active ? 700 : 400,
                cursor: "pointer", fontFamily: "Inter, sans-serif", transition: "all 0.15s",
              }}>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Layout principal */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "24px" }}>

          {/* Produtos */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#111111" }}>Em destaque</h2>
              <span style={{ fontSize: "13px", color: "#A3A3A3" }}>{destaques.length} produtos</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
              {destaques.map((produto) => (
                <div key={produto.id}
                  style={{
                    background: "#FFFFFF", borderRadius: "20px", overflow: "hidden",
                    border: "1px solid rgba(0,0,0,0.05)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                    display: "flex", flexDirection: "column",
                    cursor: "pointer", transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }}
                >
                  {/* Thumbnail */}
                  <div style={{
                    height: "120px", background: "#F5F5F5",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    position: "relative",
                  }}>
                    <span style={{ fontSize: "40px", opacity: 0.15 }}>
                      {produto.categoria === "Digital" ? "📦" : produto.categoria === "Serviços" ? "🛠️" : produto.categoria === "Consultoria" ? "💬" : "📄"}
                    </span>
                    {produto.tag && (
                      <span style={{
                        position: "absolute", top: "12px", left: "12px",
                        background: produto.tagColor, color: "#FFFFFF",
                        fontSize: "10px", fontWeight: 700,
                        padding: "3px 10px", borderRadius: "999px",
                        letterSpacing: "0.04em",
                      }}>
                        {produto.tag}
                      </span>
                    )}
                    <span style={{
                      position: "absolute", top: "12px", right: "12px",
                      background: "#FFFFFF", color: "#525252",
                      fontSize: "11px", fontWeight: 600,
                      padding: "3px 10px", borderRadius: "999px",
                      border: "1px solid #E5E5E5",
                    }}>
                      {produto.categoria}
                    </span>
                  </div>

                  {/* Conteúdo */}
                  <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
                    <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111111", lineHeight: 1.4 }}>
                      {produto.nome}
                    </h3>
                    <p style={{ fontSize: "13px", color: "#6B6B6B", lineHeight: 1.5 }}>
                      {produto.descricao}
                    </p>

                    {/* Vendedor */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingTop: "8px", borderTop: "1px solid #F5F5F5" }}>
                      <Avatar name={produto.vendedor} size={28} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "12px", fontWeight: 600, color: "#111111" }}>{produto.vendedor}</p>
                        <p style={{ fontSize: "11px", color: "#A3A3A3" }}>{produto.cidade} · {produto.vendas} vendas</p>
                      </div>
                      <ScoreBadge score={produto.score} compact />
                    </div>

                    {/* Preço + CTA */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "4px" }}>
                      <div>
                        <span style={{ fontSize: "11px", color: "#A3A3A3" }}>Por apenas</span>
                        <p style={{ fontSize: "20px", fontWeight: 800, color: "#111111", letterSpacing: "-0.03em" }}>
                          R$ {produto.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <button style={{
                        background: "#111111", color: "#FFFFFF",
                        border: "none", borderRadius: "999px",
                        padding: "10px 18px", fontSize: "13px", fontWeight: 700,
                        cursor: "pointer", fontFamily: "Inter, sans-serif",
                        transition: "background 0.15s",
                      }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#FF5C2E")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#111111")}
                      >
                        Comprar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar — Lojas em destaque */}
          <aside>
            <div style={{
              background: "#FFFFFF", borderRadius: "20px", padding: "20px",
              border: "1px solid rgba(0,0,0,0.05)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              position: "sticky", top: "84px",
              display: "flex", flexDirection: "column", gap: "16px",
            }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111111" }}>Lojas em destaque</h3>

              {lojas.map((loja) => (
                <div key={loja.nome} style={{
                  padding: "14px", borderRadius: "14px",
                  border: "1px solid #F5F5F5", cursor: "pointer",
                  transition: "border-color 0.15s",
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#111111")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#F5F5F5")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                    <Avatar name={loja.vendedor} size={36} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "13px", fontWeight: 700, color: "#111111" }}>{loja.nome}</p>
                      <p style={{ fontSize: "11px", color: "#A3A3A3" }}>{loja.cidade}</p>
                    </div>
                    <ScoreBadge score={loja.score} compact />
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <div style={{ flex: 1, background: "#F7F7F8", borderRadius: "10px", padding: "8px", textAlign: "center" }}>
                      <p style={{ fontSize: "15px", fontWeight: 800, color: "#111111" }}>{loja.produtos}</p>
                      <p style={{ fontSize: "10px", color: "#A3A3A3" }}>produtos</p>
                    </div>
                    <div style={{ flex: 1, background: "#F7F7F8", borderRadius: "10px", padding: "8px", textAlign: "center" }}>
                      <p style={{ fontSize: "15px", fontWeight: 800, color: "#111111" }}>{loja.vendas}</p>
                      <p style={{ fontSize: "10px", color: "#A3A3A3" }}>vendas</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* CTA para abrir loja */}
              <div style={{
                background: "#F7F7F8", borderRadius: "14px", padding: "16px",
                display: "flex", flexDirection: "column", gap: "10px",
              }}>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#111111" }}>
                  Quer vender na cidade?
                </p>
                <p style={{ fontSize: "12px", color: "#6B6B6B", lineHeight: 1.5 }}>
                  Abra sua loja gratuitamente. Urban só ganha quando você vender.
                </p>
                <button style={{
                  width: "100%", height: "42px",
                  background: "#111111", color: "#FFFFFF",
                  border: "none", borderRadius: "999px",
                  fontSize: "13px", fontWeight: 700,
                  cursor: "pointer", fontFamily: "Inter, sans-serif",
                }}>
                  Abrir minha loja
                </button>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
