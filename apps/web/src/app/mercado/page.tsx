"use client";

import { useEffect, useState, useCallback } from "react";
import Avatar from "@/components/ui/Avatar";
import ScoreBadge from "@/components/ui/ScoreBadge";
import BotaoConvite from "@/components/ui/BotaoConvite";
import { buscarProdutos, buscarLojas, buscarMinhaLoja, criarLoja, criarProduto, iniciarPagamento, type Produto } from "@/lib/queries";
import Avaliacoes from "@/components/ui/Avaliacoes";

const categorias = ["Todos", "Digital", "Serviços", "Físico", "Cursos", "Consultoria"];

interface LojaComDono {
  id: string;
  nome: string;
  total_vendas: number;
  dono?: { nome: string; cidade: string | null; urban_score: number } | null;
}

export default function Mercado() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [lojas, setLojas] = useState<LojaComDono[]>([]);
  const [minhaLoja, setMinhaLoja] = useState<{ id: string; nome: string } | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [categoria, setCategoria] = useState("Todos");
  const [modalLoja, setModalLoja] = useState(false);
  const [modalProduto, setModalProduto] = useState(false);
  const [comprando, setComprando] = useState<string | null>(null);
  const [avaliacoesAbertas, setAvaliacoesAbertas] = useState<Set<string>>(new Set());

  // Form loja
  const [nomeLoja, setNomeLoja] = useState("");
  const [descLoja, setDescLoja] = useState("");
  // Form produto
  const [nomeProd, setNomeProd] = useState("");
  const [descProd, setDescProd] = useState("");
  const [precoProd, setPrecoProd] = useState("");
  const [catProd, setCatProd] = useState("Digital");

  const carregar = useCallback(async () => {
    setCarregando(true);
    const [p, l, mine] = await Promise.all([buscarProdutos(), buscarLojas(), buscarMinhaLoja()]);
    setProdutos(p);
    setLojas(l as unknown as LojaComDono[]);
    setMinhaLoja(mine as unknown as { id: string; nome: string } | null);
    setCarregando(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const filtrados = categoria === "Todos" ? produtos : produtos.filter((p) => p.categoria === categoria);

  async function handleCriarLoja() {
    if (!nomeLoja.trim()) return;
    try {
      await criarLoja(nomeLoja, descLoja);
      setModalLoja(false);
      setNomeLoja(""); setDescLoja("");
      await carregar();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro");
    }
  }

  async function handleCriarProduto() {
    if (!nomeProd.trim() || !precoProd || !minhaLoja) return;
    try {
      await criarProduto(minhaLoja.id, nomeProd, parseFloat(precoProd), descProd, catProd);
      setModalProduto(false);
      setNomeProd(""); setDescProd(""); setPrecoProd("");
      await carregar();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro");
    }
  }

  async function handleComprar(produto: Produto) {
    if (!produto.loja?.dono_id) return;
    if (!confirm(`Ir para pagamento de "${produto.nome}" por R$ ${produto.preco}?`)) return;
    setComprando(produto.id);
    try {
      const { init_point } = await iniciarPagamento({
        vendedor_id: produto.loja.dono_id,
        valor: Number(produto.preco),
        descricao: produto.nome,
        tipo: "produto",
        item_id: produto.id,
      });
      window.location.href = init_point;
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro");
      setComprando(null);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F7F7F8", fontFamily: "Inter, sans-serif" }}>

      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <a href="/feed" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
              <img src="/logo.svg" alt="Urban Members" width={32} height={32} />
              <span style={{ fontSize: "15px", fontWeight: 800, color: "#111111" }}>Urban Members</span>
            </a>
            <span style={{ fontSize: "13px", color: "#A3A3A3", margin: "0 4px" }}>/</span>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#525252" }}>Mercado Urbano</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <BotaoConvite variant="ghost" />
            {minhaLoja ? (
              <button onClick={() => setModalProduto(true)} style={{ height: "36px", padding: "0 18px", background: "#111111", color: "#FFFFFF", border: "none", borderRadius: "999px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                + Novo produto
              </button>
            ) : (
              <button onClick={() => setModalLoja(true)} style={{ height: "36px", padding: "0 18px", background: "#111111", color: "#FFFFFF", border: "none", borderRadius: "999px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                Abrir minha loja
              </button>
            )}
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px 80px" }}>

        <div style={{ background: "#111111", borderRadius: "24px", padding: "40px 48px", marginBottom: "32px", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "32px" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 80% 50%, rgba(255,92,46,0.15) 0%, transparent 55%)" }} />
          <div style={{ position: "relative" }}>
            <p style={{ fontSize: "12px", color: "#FF5C2E", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>Mercado Urbano</p>
            <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.03em", lineHeight: 1.2, marginBottom: "12px" }}>
              Compre e venda<br />dentro da cidade.
            </h1>
            <p style={{ fontSize: "15px", color: "#A3A3A3", lineHeight: 1.6, maxWidth: "400px" }}>
              Urban só ganha quando você ganha. Taxa de 10% apenas em transações concluídas.
            </p>
          </div>
          <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { label: "Produtos", value: produtos.length.toString() },
              { label: "Lojistas", value: lojas.length.toString()    },
            ].map((s) => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.06)", borderRadius: "12px", padding: "12px 24px", textAlign: "center" }}>
                <p style={{ fontSize: "24px", fontWeight: 800, color: "#FFFFFF" }}>{s.value}</p>
                <p style={{ fontSize: "11px", color: "#A3A3A3", marginTop: "2px" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filtros */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "28px", flexWrap: "wrap" }}>
          {categorias.map((cat) => (
            <button key={cat} onClick={() => setCategoria(cat)} style={{
              height: "40px", padding: "0 18px",
              background: categoria === cat ? "#111111" : "#FFFFFF",
              color: categoria === cat ? "#FFFFFF" : "#525252",
              border: `1px solid ${categoria === cat ? "#111111" : "#E5E5E5"}`,
              borderRadius: "999px", fontSize: "13px", fontWeight: categoria === cat ? 700 : 400,
              cursor: "pointer", fontFamily: "Inter, sans-serif",
            }}>
              {cat}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "24px" }}>

          {/* Grid de produtos */}
          <div>
            {carregando ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#A3A3A3" }}>Carregando mercado...</div>
            ) : filtrados.length === 0 ? (
              <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "48px 24px", textAlign: "center", border: "1px solid rgba(0,0,0,0.05)" }}>
                <p style={{ fontSize: "15px", fontWeight: 700, color: "#111111" }}>O mercado ainda está vazio</p>
                <p style={{ fontSize: "13px", color: "#A3A3A3", marginTop: "6px" }}>
                  {minhaLoja ? "Adicione seu primeiro produto." : "Seja o primeiro a abrir uma loja."}
                </p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                {filtrados.map((produto) => (
                  <div key={produto.id} style={{ background: "#FFFFFF", borderRadius: "20px", overflow: "hidden", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column" }}>
                    <div style={{ height: "100px", background: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                      <span style={{ fontSize: "32px", opacity: 0.15 }}>📦</span>
                      <span style={{ position: "absolute", top: "12px", right: "12px", background: "#FFFFFF", color: "#525252", fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "999px", border: "1px solid #E5E5E5" }}>
                        {produto.categoria}
                      </span>
                    </div>
                    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
                      <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111111", lineHeight: 1.4 }}>{produto.nome}</h3>
                      {produto.descricao && (
                        <p style={{ fontSize: "13px", color: "#6B6B6B", lineHeight: 1.5 }}>{produto.descricao}</p>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingTop: "8px", borderTop: "1px solid #F5F5F5" }}>
                        <Avatar name={produto.loja?.dono?.nome ?? "Vendedor"} size={28} />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: "12px", fontWeight: 600, color: "#111111" }}>{produto.loja?.dono?.nome ?? "Vendedor"}</p>
                          <p style={{ fontSize: "11px", color: "#A3A3A3" }}>{produto.loja?.dono?.cidade ?? ""} · {produto.total_vendas} vendas</p>
                        </div>
                        <ScoreBadge score={produto.loja?.dono?.urban_score ?? 10} compact />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                          <span style={{ fontSize: "11px", color: "#A3A3A3" }}>Por apenas</span>
                          <p style={{ fontSize: "20px", fontWeight: 800, color: "#111111" }}>R$ {Number(produto.preco).toFixed(2).replace(".", ",")}</p>
                        </div>
                        <button onClick={() => handleComprar(produto)} disabled={comprando === produto.id} style={{
                          background: "#111111", color: "#FFFFFF", border: "none", borderRadius: "999px",
                          padding: "10px 18px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif",
                          opacity: comprando === produto.id ? 0.5 : 1,
                        }}>
                          {comprando === produto.id ? "..." : "Comprar"}
                        </button>
                      </div>
                      <button
                        onClick={() => setAvaliacoesAbertas((prev) => {
                          const n = new Set(prev);
                          if (n.has(produto.id)) n.delete(produto.id); else n.add(produto.id);
                          return n;
                        })}
                        style={{ background: "none", border: "none", padding: "8px 0 0", color: "#525252", fontSize: "12px", cursor: "pointer", fontFamily: "Inter, sans-serif", textAlign: "left", borderTop: "1px solid #F5F5F5" }}
                      >
                        {avaliacoesAbertas.has(produto.id) ? "Ocultar avaliações ↑" : "Ver avaliações ↓"}
                      </button>
                      {avaliacoesAbertas.has(produto.id) && (
                        <div style={{ marginTop: "8px" }}>
                          <Avaliacoes produtoId={produto.id} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside>
            <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "20px", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", position: "sticky", top: "84px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111111" }}>Lojas em destaque</h3>
              {lojas.length === 0 ? (
                <p style={{ fontSize: "12px", color: "#A3A3A3" }}>Ainda não há lojas abertas. Seja o primeiro!</p>
              ) : lojas.map((loja) => (
                <div key={loja.id} style={{ padding: "14px", borderRadius: "14px", border: "1px solid #F5F5F5" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                    <Avatar name={loja.dono?.nome ?? "Lojista"} size={36} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "13px", fontWeight: 700, color: "#111111" }}>{loja.nome}</p>
                      <p style={{ fontSize: "11px", color: "#A3A3A3" }}>{loja.dono?.cidade ?? ""}</p>
                    </div>
                    <ScoreBadge score={loja.dono?.urban_score ?? 10} compact />
                  </div>
                  <p style={{ fontSize: "11px", color: "#6B6B6B" }}>{loja.total_vendas} vendas</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>

      {/* Modal abrir loja */}
      {modalLoja && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "24px" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "28px", maxWidth: "440px", width: "100%", display: "flex", flexDirection: "column", gap: "16px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#111111" }}>Abrir minha loja</h2>
            <p style={{ fontSize: "13px", color: "#A3A3A3" }}>Sem mensalidade. Urban ganha apenas quando você vender.</p>
            <input placeholder="Nome da loja" value={nomeLoja} onChange={(e) => setNomeLoja(e.target.value)}
              style={{ width: "100%", height: "48px", border: "1.5px solid #E5E5E5", borderRadius: "12px", padding: "0 14px", fontSize: "14px", outline: "none", fontFamily: "Inter, sans-serif" }} />
            <textarea placeholder="Descrição (opcional)" value={descLoja} onChange={(e) => setDescLoja(e.target.value)} rows={3}
              style={{ width: "100%", border: "1.5px solid #E5E5E5", borderRadius: "12px", padding: "12px 14px", fontSize: "14px", outline: "none", fontFamily: "Inter, sans-serif", resize: "none" }} />
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setModalLoja(false)} style={{ flex: 1, height: "44px", background: "#F5F5F5", color: "#525252", border: "none", borderRadius: "999px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>Cancelar</button>
              <button onClick={handleCriarLoja} style={{ flex: 1, height: "44px", background: "#111111", color: "#FFFFFF", border: "none", borderRadius: "999px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>Abrir loja</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal novo produto */}
      {modalProduto && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "24px" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "28px", maxWidth: "440px", width: "100%", display: "flex", flexDirection: "column", gap: "14px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#111111" }}>Novo produto</h2>
            <input placeholder="Nome" value={nomeProd} onChange={(e) => setNomeProd(e.target.value)}
              style={{ width: "100%", height: "48px", border: "1.5px solid #E5E5E5", borderRadius: "12px", padding: "0 14px", fontSize: "14px", outline: "none", fontFamily: "Inter, sans-serif" }} />
            <textarea placeholder="Descrição" value={descProd} onChange={(e) => setDescProd(e.target.value)} rows={3}
              style={{ width: "100%", border: "1.5px solid #E5E5E5", borderRadius: "12px", padding: "12px 14px", fontSize: "14px", outline: "none", fontFamily: "Inter, sans-serif", resize: "none" }} />
            <div style={{ display: "flex", gap: "10px" }}>
              <input type="number" placeholder="Preço R$" value={precoProd} onChange={(e) => setPrecoProd(e.target.value)}
                style={{ flex: 1, height: "48px", border: "1.5px solid #E5E5E5", borderRadius: "12px", padding: "0 14px", fontSize: "14px", outline: "none", fontFamily: "Inter, sans-serif" }} />
              <select value={catProd} onChange={(e) => setCatProd(e.target.value)}
                style={{ flex: 1, height: "48px", border: "1.5px solid #E5E5E5", borderRadius: "12px", padding: "0 14px", fontSize: "14px", outline: "none", fontFamily: "Inter, sans-serif" }}>
                {["Digital", "Serviços", "Físico", "Cursos", "Consultoria"].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setModalProduto(false)} style={{ flex: 1, height: "44px", background: "#F5F5F5", color: "#525252", border: "none", borderRadius: "999px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>Cancelar</button>
              <button onClick={handleCriarProduto} style={{ flex: 1, height: "44px", background: "#111111", color: "#FFFFFF", border: "none", borderRadius: "999px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>Publicar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
