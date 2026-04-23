"use client";

import { useState, useEffect, useCallback } from "react";
import { meusCupons, criarCupom, togglarCupom, deletarCupom, type Cupom } from "@/lib/queries";

export default function MeusCupons() {
  const [cupons, setCupons] = useState<Cupom[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [criando, setCriando] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [desconto, setDesconto] = useState("10");
  const [maxUsos, setMaxUsos] = useState("100");
  const [salvando, setSalvando] = useState(false);
  const [copiado, setCopiado] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setCupons(await meusCupons());
    setCarregando(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  async function salvar() {
    setSalvando(true);
    try {
      await criarCupom(codigo, parseInt(desconto), parseInt(maxUsos));
      setCodigo("");
      setCriando(false);
      await carregar();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro");
    } finally {
      setSalvando(false);
    }
  }

  async function toggle(cupom: Cupom) {
    await togglarCupom(cupom.id, !cupom.ativo);
    await carregar();
  }

  async function apagar(id: string) {
    if (!confirm("Apagar cupom?")) return;
    await deletarCupom(id);
    await carregar();
  }

  async function copiarLink(cupom: Cupom) {
    const link = `${window.location.origin}/mercado?cupom=${cupom.codigo}`;
    await navigator.clipboard.writeText(link);
    setCopiado(cupom.id);
    setTimeout(() => setCopiado(null), 1500);
  }

  return (
    <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "20px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111111" }}>Meus cupons</h3>
          <p style={{ fontSize: "12px", color: "#A3A3A3", marginTop: "2px" }}>Crie códigos de desconto e ganhe comissão em cada uso</p>
        </div>
        <button
          onClick={() => setCriando(!criando)}
          style={{ height: "32px", padding: "0 14px", background: criando ? "#F5F5F5" : "#111111", color: criando ? "#111111" : "#FFFFFF", border: "none", borderRadius: "999px", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}
        >
          {criando ? "Cancelar" : "+ Novo"}
        </button>
      </div>

      {criando && (
        <div style={{ background: "#F7F7F8", borderRadius: "12px", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <input
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            placeholder="CODIGO (3-24 letras/números)"
            style={{ height: "38px", padding: "0 12px", border: "1px solid #E5E5E5", borderRadius: "10px", fontSize: "13px", outline: "none", fontFamily: "Inter, sans-serif", color: "#111111" }}
          />
          <div style={{ display: "flex", gap: "8px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "10px", color: "#A3A3A3", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>Desconto %</label>
              <input
                type="number" min="1" max="50"
                value={desconto}
                onChange={(e) => setDesconto(e.target.value)}
                style={{ width: "100%", height: "38px", padding: "0 12px", border: "1px solid #E5E5E5", borderRadius: "10px", fontSize: "13px", outline: "none", fontFamily: "Inter, sans-serif", color: "#111111" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "10px", color: "#A3A3A3", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>Máx. usos</label>
              <input
                type="number" min="1"
                value={maxUsos}
                onChange={(e) => setMaxUsos(e.target.value)}
                style={{ width: "100%", height: "38px", padding: "0 12px", border: "1px solid #E5E5E5", borderRadius: "10px", fontSize: "13px", outline: "none", fontFamily: "Inter, sans-serif", color: "#111111" }}
              />
            </div>
          </div>
          <button
            onClick={salvar}
            disabled={!codigo.trim() || salvando}
            style={{ height: "38px", background: codigo.trim() && !salvando ? "#FF5C2E" : "#E5E5E5", color: "#FFFFFF", border: "none", borderRadius: "999px", fontSize: "13px", fontWeight: 700, cursor: codigo.trim() && !salvando ? "pointer" : "not-allowed", fontFamily: "Inter, sans-serif" }}
          >
            {salvando ? "Criando..." : "Criar cupom"}
          </button>
        </div>
      )}

      {carregando ? (
        <p style={{ fontSize: "12px", color: "#A3A3A3", textAlign: "center", padding: "12px" }}>Carregando...</p>
      ) : cupons.length === 0 ? (
        <p style={{ fontSize: "12px", color: "#A3A3A3", textAlign: "center", padding: "12px" }}>Nenhum cupom criado ainda.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {cupons.map((c) => (
            <div key={c.id} style={{ background: "#F7F7F8", borderRadius: "12px", padding: "12px 14px", display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 800, color: "#111111", fontFamily: "ui-monospace, monospace" }}>{c.codigo}</span>
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "#FF5C2E", background: "#FFF3EF", padding: "2px 7px", borderRadius: "999px" }}>
                    {c.desconto_percentual}% OFF
                  </span>
                  {!c.ativo && (
                    <span style={{ fontSize: "10px", fontWeight: 700, color: "#A3A3A3", background: "#E5E5E5", padding: "2px 7px", borderRadius: "999px" }}>
                      Pausado
                    </span>
                  )}
                </div>
                <p style={{ fontSize: "11px", color: "#A3A3A3", marginTop: "3px" }}>
                  {c.usos_atuais}/{c.max_usos} usos
                </p>
              </div>
              <button
                onClick={() => copiarLink(c)}
                style={{ height: "30px", padding: "0 10px", background: copiado === c.id ? "#10B981" : "#FFFFFF", color: copiado === c.id ? "#FFFFFF" : "#525252", border: "1px solid #E5E5E5", borderRadius: "999px", fontSize: "11px", fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif" }}
              >
                {copiado === c.id ? "✓" : "Copiar"}
              </button>
              <button
                onClick={() => toggle(c)}
                style={{ height: "30px", padding: "0 10px", background: "transparent", color: "#525252", border: "1px solid #E5E5E5", borderRadius: "999px", fontSize: "11px", fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif" }}
              >
                {c.ativo ? "Pausar" : "Ativar"}
              </button>
              <button
                onClick={() => apagar(c.id)}
                style={{ width: "30px", height: "30px", background: "transparent", color: "#A3A3A3", border: "none", borderRadius: "50%", fontSize: "14px", cursor: "pointer" }}
                title="Apagar"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
