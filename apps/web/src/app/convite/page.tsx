"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";

const BENEFICIOS = [
  { titulo: "Endereço digital",     desc: "Sua cidade, seu bairro, sua identidade na plataforma."   },
  { titulo: "Urban Score",          desc: "Cada ação vira pontuação. Suba de nível na cidade."       },
  { titulo: "Mercado Urbano",       desc: "Compre e venda sem mensalidade. Urban ganha com você."    },
  { titulo: "Sala de Aula",         desc: "Aprenda com quem já chegou onde você quer chegar."         },
  { titulo: "Conexões reais",       desc: "Moradores de todo o Brasil e do mundo."                   },
  { titulo: "Urban Pay",            desc: "Pagamentos diretos entre moradores. Simples e seguro."    },
];

export default function Convite() {
  const [copiado, setCopiado] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const user = (await createClient().auth.getSession()).data.session?.user;
      if (user) setUserId(user.id);
    })();
  }, []);

  const link = userId
    ? `https://urbanicsa.com/cadastro?ref=${userId}`
    : "https://urbanicsa.com/cadastro";

  function copiar() {
    navigator.clipboard.writeText(link);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#111111", fontFamily: "Inter, sans-serif", position: "relative", overflow: "hidden" }}>

      {/* Fundo */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 80%, rgba(255,92,46,0.12) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.03) 0%, transparent 50%)" }} />

      <div style={{ position: "relative", maxWidth: "680px", margin: "0 auto", padding: "64px 24px" }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "64px" }}>
          <img src="/logo.svg" alt="Urban Members" width={40} height={40} style={{ filter: "invert(1)" }} />
          <span style={{ fontSize: "16px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.03em" }}>Urban Members</span>
        </div>

        {/* Badge convite */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,92,46,0.15)", border: "1px solid rgba(255,92,46,0.3)", borderRadius: "999px", padding: "6px 16px", marginBottom: "24px" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#FF5C2E" }} />
          <span style={{ fontSize: "12px", color: "#FF5C2E", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Convite exclusivo
          </span>
        </div>

        {/* Headline */}
        <h1 style={{ fontSize: "52px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: "20px" }}>
          Você foi<br />convidado para<br />
          <span style={{ color: "#FF5C2E" }}>a cidade.</span>
        </h1>

        <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: "24px", maxWidth: "520px" }}>
          Urban Members é a primeira cidade digital brasileira. Um lugar para aprender, conectar e fazer negócios — sem sair de onde você está.
        </p>

        {userId && (
          <div style={{
            background: "rgba(255,92,46,0.1)",
            border: "1px solid rgba(255,92,46,0.3)",
            borderRadius: "14px",
            padding: "14px 18px",
            marginBottom: "32px",
            maxWidth: "520px",
          }}>
            <p style={{ fontSize: "13px", color: "#FF5C2E", fontWeight: 700, marginBottom: "4px" }}>
              💰 Você ganha 3% quando quem você convida compra algo.
            </p>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>
              Comissão automática, paga direto no seu Urban Pay. Só você recebe quando a pessoa consome — convidar não paga, consumo paga.
            </p>
          </div>
        )}

        {/* CTA principal */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "64px" }}>
          <a href="/cadastro" style={{ textDecoration: "none" }}>
            <button className="um-btn-accent" style={{
              width: "100%", height: "60px",
              fontSize: "17px", letterSpacing: "-0.02em",
            }}>
              Criar meu endereço — é grátis
            </button>
          </a>
          <a href="/login" style={{ textDecoration: "none" }}>
            <button style={{
              width: "100%", height: "52px",
              background: "transparent", color: "rgba(255,255,255,0.5)",
              border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: "16px",
              fontSize: "15px", fontWeight: 600,
              cursor: "pointer", fontFamily: "Inter, sans-serif",
            }}>
              Já tenho conta
            </button>
          </a>
        </div>

        {/* Benefícios */}
        <div style={{ marginBottom: "64px" }}>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "20px" }}>
            O que você encontra na cidade
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {BENEFICIOS.map((b) => (
              <div key={b.titulo} style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "14px", padding: "16px 18px",
              }}>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF", marginBottom: "4px" }}>{b.titulo}</p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Compartilhar convite */}
        <div style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "16px", padding: "20px 24px",
          display: "flex", flexDirection: "column", gap: "12px",
        }}>
          <p style={{ fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>
            Compartilhe o convite
          </p>
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{
              flex: 1, background: "rgba(255,255,255,0.06)", borderRadius: "10px",
              padding: "0 14px", height: "44px", display: "flex", alignItems: "center",
              border: "1px solid rgba(255,255,255,0.1)",
            }}>
              <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>{link}</span>
            </div>
            <button onClick={copiar} style={{
              height: "44px", padding: "0 20px",
              background: copiado ? "#10B981" : "#FFFFFF",
              color: copiado ? "#FFFFFF" : "#111111",
              border: "none", borderRadius: "10px",
              fontSize: "13px", fontWeight: 700,
              cursor: "pointer", fontFamily: "Inter, sans-serif",
              transition: "all 0.2s", whiteSpace: "nowrap",
            }}>
              {copiado ? "Copiado ✓" : "Copiar link"}
            </button>
          </div>

          {/* Compartilhar via */}
          <div style={{ display: "flex", gap: "8px" }}>
            {[
              { label: "WhatsApp", bg: "#25D366", msg: `Você foi convidado para o Urban Members — a primeira cidade digital brasileira. Crie seu endereço gratuitamente: ${link}` },
              { label: "Telegram", bg: "#229ED9", msg: `Você foi convidado para o Urban Members: ${link}` },
            ].map((app) => (
              <a
                key={app.label}
                href={app.label === "WhatsApp"
                  ? `https://wa.me/?text=${encodeURIComponent(app.msg)}`
                  : `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent("Você foi convidado para o Urban Members!")}`
                }
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
              >
                <button style={{
                  height: "36px", padding: "0 16px",
                  background: app.bg, color: "#FFFFFF",
                  border: "none", borderRadius: "999px",
                  fontSize: "12px", fontWeight: 700,
                  cursor: "pointer", fontFamily: "Inter, sans-serif",
                }}>
                  {app.label}
                </button>
              </a>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)", textAlign: "center", marginTop: "48px" }}>
          urbanicsa.com · A primeira cidade digital brasileira
        </p>

      </div>
    </div>
  );
}
