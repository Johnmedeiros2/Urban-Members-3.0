"use client";

import { useState } from "react";
import { useCarrinho } from "@/lib/carrinho";
import { criarTransacao } from "@/lib/queries";

export default function CarrinhoDrawer() {
  const { itens, mudarQtd, remover, limpar, total, quantidadeTotal } = useCarrinho();
  const [aberto, setAberto] = useState(false);
  const [pagando, setPagando] = useState(false);

  async function finalizar() {
    if (itens.length === 0) return;
    if (!confirm(`Finalizar compra de ${quantidadeTotal} ${quantidadeTotal === 1 ? "item" : "itens"} (R$ ${total.toFixed(2)})?`)) return;
    setPagando(true);
    try {
      for (const item of itens) {
        const valorTotal = item.preco * item.quantidade;
        const descricao = item.quantidade > 1 ? `${item.nome} x${item.quantidade}` : item.nome;
        await criarTransacao(item.vendedor_id, valorTotal, descricao);
      }
      limpar();
      setAberto(false);
      alert(`Compra finalizada! ${quantidadeTotal} ${quantidadeTotal === 1 ? "item comprado" : "itens comprados"}.`);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao finalizar");
    } finally {
      setPagando(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        style={{
          position: "relative",
          width: "36px", height: "36px", borderRadius: "999px",
          background: "#F5F5F5", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
        aria-label="Carrinho"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1"/>
          <circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        {quantidadeTotal > 0 && (
          <span style={{
            position: "absolute", top: "-2px", right: "-2px",
            width: "18px", height: "18px", borderRadius: "50%",
            background: "#FF5C2E", color: "#FFFFFF",
            fontSize: "10px", fontWeight: 800,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "2px solid #FFFFFF",
          }}>
            {quantidadeTotal > 9 ? "9+" : quantidadeTotal}
          </span>
        )}
      </button>

      {aberto && (
        <>
          <div
            onClick={() => setAberto(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100 }}
          />
          <div style={{
            position: "fixed", top: 0, right: 0, bottom: 0,
            width: "420px", maxWidth: "100vw",
            background: "#FFFFFF", zIndex: 101,
            display: "flex", flexDirection: "column",
            boxShadow: "-8px 0 32px rgba(0,0,0,0.12)",
          }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #F5F5F5", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#111111" }}>Carrinho</h2>
              <button
                onClick={() => setAberto(false)}
                style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#F5F5F5", border: "none", cursor: "pointer", fontSize: "14px" }}
              >✕</button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
              {itens.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <p style={{ fontSize: "14px", color: "#A3A3A3" }}>Seu carrinho está vazio.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {itens.map((item) => (
                    <div key={item.produto_id} style={{ display: "flex", gap: "12px", paddingBottom: "14px", borderBottom: "1px solid #F5F5F5" }}>
                      <div style={{ width: "52px", height: "52px", background: "#F5F5F5", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", opacity: 0.4 }}>📦</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "14px", fontWeight: 600, color: "#111111" }}>{item.nome}</p>
                        {item.vendedor_nome && <p style={{ fontSize: "11px", color: "#A3A3A3" }}>{item.vendedor_nome}</p>}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "8px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <button
                              onClick={() => mudarQtd(item.produto_id, item.quantidade - 1)}
                              style={qtdBtnStyle}
                            >−</button>
                            <span style={{ fontSize: "13px", fontWeight: 700, minWidth: "24px", textAlign: "center" }}>{item.quantidade}</span>
                            <button
                              onClick={() => mudarQtd(item.produto_id, item.quantidade + 1)}
                              style={qtdBtnStyle}
                            >+</button>
                          </div>
                          <span style={{ fontSize: "14px", fontWeight: 700, color: "#111111" }}>
                            R$ {(item.preco * item.quantidade).toFixed(2).replace(".", ",")}
                          </span>
                        </div>
                        <button
                          onClick={() => remover(item.produto_id)}
                          style={{ marginTop: "6px", background: "none", border: "none", color: "#A3A3A3", fontSize: "11px", cursor: "pointer", fontFamily: "Inter, sans-serif" }}
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {itens.length > 0 && (
              <div style={{ padding: "20px 24px", borderTop: "1px solid #F5F5F5", background: "#F7F7F8" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
                  <span style={{ fontSize: "14px", color: "#525252" }}>Total</span>
                  <span style={{ fontSize: "22px", fontWeight: 800, color: "#111111" }}>R$ {total.toFixed(2).replace(".", ",")}</span>
                </div>
                <button
                  onClick={finalizar}
                  disabled={pagando}
                  style={{
                    width: "100%", height: "48px",
                    background: pagando ? "#A3A3A3" : "#111111",
                    color: "#FFFFFF", border: "none", borderRadius: "999px",
                    fontSize: "14px", fontWeight: 700,
                    cursor: pagando ? "not-allowed" : "pointer",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {pagando ? "Processando..." : "Finalizar compra"}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

const qtdBtnStyle: React.CSSProperties = {
  width: "26px", height: "26px", borderRadius: "50%",
  background: "#FFFFFF", border: "1px solid #E5E5E5",
  cursor: "pointer", fontSize: "13px", fontWeight: 700,
  color: "#111111", display: "flex", alignItems: "center", justifyContent: "center",
};
