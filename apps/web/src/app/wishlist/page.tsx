"use client";

import { useState, useEffect, useCallback } from "react";
import BotaoConvite from "@/components/ui/BotaoConvite";
import BotaoWishlist from "@/components/ui/BotaoWishlist";
import { minhaWishlist, type ItemWishlist } from "@/lib/queries";

export default function Wishlist() {
  const [itens, setItens] = useState<ItemWishlist[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState<"todos" | "produtos" | "cursos">("todos");

  const carregar = useCallback(async () => {
    setCarregando(true);
    setItens(await minhaWishlist());
    setCarregando(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const filtrados = filtro === "todos" ? itens
    : filtro === "produtos" ? itens.filter((i) => i.produto_id)
    : itens.filter((i) => i.curso_id);

  return (
    <div style={{ minHeight: "100vh", background: "#F7F7F8", fontFamily: "Inter, sans-serif" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <a href="/feed" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
              <img src="/logo.svg" alt="Urban Members" width={32} height={32} />
              <span style={{ fontSize: "15px", fontWeight: 800, color: "#111111" }}>Urban Members</span>
            </a>
            <span style={{ fontSize: "13px", color: "#A3A3A3", margin: "0 4px" }}>/</span>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#525252" }}>Salvos</span>
          </div>
          <BotaoConvite variant="ghost" />
        </div>
      </header>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 24px 80px" }}>
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111111", letterSpacing: "-0.03em" }}>Salvos para depois</h1>
          <p style={{ fontSize: "14px", color: "#A3A3A3", marginTop: "4px" }}>Produtos e cursos que você marcou para ver mais tarde.</p>
        </div>

        <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
          {([
            { id: "todos" as const,    label: "Todos"    },
            { id: "produtos" as const, label: "Produtos" },
            { id: "cursos" as const,   label: "Cursos"   },
          ]).map((f) => (
            <button key={f.id} onClick={() => setFiltro(f.id)}
              className={`um-chip ${filtro === f.id ? "active" : ""}`}
              style={{ height: "36px", padding: "0 16px", fontSize: "12px" }}>
              {f.label}
            </button>
          ))}
        </div>

        {carregando ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#A3A3A3" }}>Carregando...</div>
        ) : filtrados.length === 0 ? (
          <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "48px 24px", textAlign: "center", border: "1px solid rgba(0,0,0,0.05)" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#FFF3EF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", margin: "0 auto 14px" }}>🔖</div>
            <p style={{ fontSize: "15px", fontWeight: 700, color: "#111111" }}>
              {itens.length === 0 ? "Nada salvo ainda" : "Nenhum item neste filtro"}
            </p>
            <p style={{ fontSize: "13px", color: "#A3A3A3", marginTop: "6px" }}>
              {itens.length === 0 ? "Clique no ícone de marcador em produtos e cursos pra salvar." : "Troque o filtro pra ver outros."}
            </p>
            {itens.length === 0 && (
              <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "18px" }}>
                <a href="/mercado" style={{ textDecoration: "none" }}>
                  <button className="um-btn-accent" style={{ height: "40px", padding: "0 20px", fontSize: "13px" }}>
                    Mercado
                  </button>
                </a>
                <a href="/sala-de-aula" style={{ textDecoration: "none" }}>
                  <button className="um-btn-secondary" style={{ height: "40px", padding: "0 20px", fontSize: "13px" }}>
                    Sala de Aula
                  </button>
                </a>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "12px" }}>
            {filtrados.map((w) => {
              const ehProduto = !!w.produto;
              const nome = w.produto?.nome ?? w.curso?.titulo ?? "";
              const preco = Number(w.produto?.preco ?? w.curso?.preco ?? 0);
              const autor = w.produto?.loja?.dono?.nome ?? w.curso?.instrutor?.nome ?? "";
              const href = ehProduto ? "/mercado" : `/curso/${w.curso?.id}`;

              return (
                <a key={w.id} href={href} style={{ textDecoration: "none" }}>
                  <div className="um-card um-clickable" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px", height: "100%" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: ehProduto ? "#FFF3EF" : "#E0F2FE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
                        {ehProduto ? "🛒" : "📚"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "13px", fontWeight: 700, color: "#111111", lineHeight: 1.3 }}>{nome}</p>
                        {autor && <p style={{ fontSize: "11px", color: "#A3A3A3", marginTop: "2px" }}>{autor}</p>}
                      </div>
                      <BotaoWishlist tipo={ehProduto ? "produto" : "curso"} itemId={(ehProduto ? w.produto?.id : w.curso?.id) ?? ""} tamanho="sm" />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid #F5F5F5" }}>
                      <span style={{ fontSize: "11px", color: "#A3A3A3" }}>{ehProduto ? w.produto?.categoria : w.curso?.nivel}</span>
                      <span style={{ fontSize: "16px", fontWeight: 800, color: "#FF5C2E" }}>
                        {preco === 0 ? "Grátis" : `R$ ${preco.toFixed(2).replace(".", ",")}`}
                      </span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
