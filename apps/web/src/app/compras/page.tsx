"use client";

import { useState, useEffect, useCallback } from "react";
import BotaoConvite from "@/components/ui/BotaoConvite";
import AvatarMenu from "@/components/ui/AvatarMenu";
import { minhasCompras, type Transacao } from "@/lib/queries";

const STATUS_COR: Record<string, string> = {
  concluida: "#10B981",
  pendente: "#F59E0B",
  cancelada: "#EF4444",
  recusada: "#EF4444",
};

const STATUS_LABEL: Record<string, string> = {
  concluida: "Concluída",
  pendente: "Pendente",
  cancelada: "Cancelada",
  recusada: "Recusada",
};

export default function Compras() {
  const [compras, setCompras] = useState<Transacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState<"todas" | "concluida" | "pendente">("todas");

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      setCompras(await minhasCompras());
    } catch {
      // falha silenciosa
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const filtradas = filtro === "todas" ? compras : compras.filter((c) => c.status === filtro);

  const totalGasto = compras
    .filter((c) => c.status === "concluida")
    .reduce((s, c) => s + Number(c.valor), 0);

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
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#525252" }}>Minhas compras</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <BotaoConvite variant="ghost" />
            <AvatarMenu size={32} />
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 24px 80px" }}>

        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111111", letterSpacing: "-0.03em" }}>Minhas compras</h1>
          <p style={{ fontSize: "14px", color: "#A3A3A3", marginTop: "4px" }}>Histórico de tudo que você comprou na cidade.</p>
        </div>

        {/* Resumo */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginBottom: "24px" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "14px", padding: "16px 20px", border: "1px solid rgba(0,0,0,0.05)" }}>
            <p style={{ fontSize: "11px", color: "#A3A3A3", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Total de compras</p>
            <p style={{ fontSize: "24px", fontWeight: 800, color: "#111111", marginTop: "4px" }}>{compras.length}</p>
          </div>
          <div style={{ background: "#FFFFFF", borderRadius: "14px", padding: "16px 20px", border: "1px solid rgba(0,0,0,0.05)" }}>
            <p style={{ fontSize: "11px", color: "#A3A3A3", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Total gasto</p>
            <p style={{ fontSize: "24px", fontWeight: 800, color: "#111111", marginTop: "4px" }}>R$ {totalGasto.toFixed(2).replace(".", ",")}</p>
          </div>
          <div style={{ background: "#FFFFFF", borderRadius: "14px", padding: "16px 20px", border: "1px solid rgba(0,0,0,0.05)" }}>
            <p style={{ fontSize: "11px", color: "#A3A3A3", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Concluídas</p>
            <p style={{ fontSize: "24px", fontWeight: 800, color: "#10B981", marginTop: "4px" }}>{compras.filter((c) => c.status === "concluida").length}</p>
          </div>
        </div>

        {/* Filtros */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
          {([
            { id: "todas" as const,      label: "Todas"      },
            { id: "concluida" as const,  label: "Concluídas" },
            { id: "pendente" as const,   label: "Pendentes"  },
          ]).map((f) => (
            <button key={f.id} onClick={() => setFiltro(f.id)}
              className={`um-chip ${filtro === f.id ? "active" : ""}`}
              style={{ height: "36px", padding: "0 16px", fontSize: "12px" }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Lista */}
        {carregando ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#A3A3A3" }}>Carregando compras...</div>
        ) : filtradas.length === 0 ? (
          <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "48px 24px", textAlign: "center", border: "1px solid rgba(0,0,0,0.05)" }}>
            <p style={{ fontSize: "15px", fontWeight: 700, color: "#111111" }}>
              {compras.length === 0 ? "Você ainda não comprou nada" : "Nenhuma compra neste filtro"}
            </p>
            <p style={{ fontSize: "13px", color: "#A3A3A3", marginTop: "6px" }}>
              {compras.length === 0 ? "Explore o Mercado e a Sala de Aula." : "Mude o filtro para ver outras."}
            </p>
            {compras.length === 0 && (
              <a href="/mercado" style={{ textDecoration: "none" }}>
                <button className="um-btn-accent" style={{ marginTop: "18px", height: "40px", padding: "0 20px", fontSize: "13px" }}>
                  Ir para o Mercado
                </button>
              </a>
            )}
          </div>
        ) : (
          <div style={{ background: "#FFFFFF", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", overflow: "hidden" }}>
            {filtradas.map((c, i) => (
              <div key={c.id} style={{
                padding: "16px 20px",
                borderBottom: i < filtradas.length - 1 ? "1px solid #F5F5F5" : "none",
                display: "flex", alignItems: "center", gap: "16px",
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "#111111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.descricao || "Compra"}
                    </span>
                    <span style={{
                      fontSize: "10px", fontWeight: 700,
                      color: STATUS_COR[c.status] ?? "#525252",
                      background: `${STATUS_COR[c.status] ?? "#E5E5E5"}15`,
                      padding: "2px 8px", borderRadius: "999px",
                      textTransform: "uppercase", letterSpacing: "0.04em",
                    }}>
                      {STATUS_LABEL[c.status] ?? c.status}
                    </span>
                  </div>
                  <p style={{ fontSize: "12px", color: "#A3A3A3" }}>
                    Para {c.vendedor?.nome ?? "vendedor"} · {new Date(c.criado_em).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "15px", fontWeight: 800, color: "#111111" }}>
                    R$ {Number(c.valor).toFixed(2).replace(".", ",")}
                  </p>
                  <p style={{ fontSize: "11px", color: "#A3A3A3" }}>
                    Taxa Urban: R$ {Number(c.taxa_urban).toFixed(2).replace(".", ",")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
