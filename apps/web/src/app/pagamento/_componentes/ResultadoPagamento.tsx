"use client";

interface Props {
  tipo: "sucesso" | "pendente" | "falha";
  icone: string;
  cor: string;
  titulo: string;
  mensagem: string;
}

export default function ResultadoPagamento({ icone, cor, titulo, mensagem }: Props) {
  return (
    <div style={{ minHeight: "100vh", background: "#F7F7F8", fontFamily: "Inter, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ maxWidth: "460px", width: "100%", background: "#FFFFFF", borderRadius: "20px", padding: "40px 32px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.05)" }}>
        <div style={{
          width: "80px", height: "80px", borderRadius: "50%",
          background: `${cor}15`, color: cor,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "36px", margin: "0 auto 24px", fontWeight: 800,
        }}>
          {icone}
        </div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#111111", letterSpacing: "-0.03em", marginBottom: "12px" }}>{titulo}</h1>
        <p style={{ fontSize: "14px", color: "#6B6B6B", lineHeight: 1.6, marginBottom: "28px" }}>{mensagem}</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <a href="/feed" style={{ textDecoration: "none" }}>
            <button style={{
              width: "100%", height: "48px", background: "#111111", color: "#FFFFFF",
              border: "none", borderRadius: "999px", fontSize: "14px", fontWeight: 700,
              cursor: "pointer", fontFamily: "Inter, sans-serif",
            }}>
              Voltar para o feed
            </button>
          </a>
          <a href="/mercado" style={{ textDecoration: "none" }}>
            <button style={{
              width: "100%", height: "44px", background: "transparent", color: "#525252",
              border: "1.5px solid #E5E5E5", borderRadius: "999px", fontSize: "13px", fontWeight: 600,
              cursor: "pointer", fontFamily: "Inter, sans-serif",
            }}>
              Ir para o Mercado
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}
