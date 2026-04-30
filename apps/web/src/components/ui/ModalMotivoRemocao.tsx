"use client";

import { useState } from "react";

interface Props {
  aberto: boolean;
  titulo?: string;
  onConfirmar: (motivo: string) => Promise<void> | void;
  onCancelar: () => void;
}

export default function ModalMotivoRemocao({ aberto, titulo, onConfirmar, onCancelar }: Props) {
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);

  if (!aberto) return null;

  const valido = motivo.trim().length >= 10;

  async function confirmar() {
    if (!valido) return;
    setEnviando(true);
    try {
      await onConfirmar(motivo.trim());
      setMotivo("");
    } finally {
      setEnviando(false);
    }
  }

  function cancelar() {
    setMotivo("");
    onCancelar();
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 300,
        padding: "24px",
      }}
    >
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "20px",
          padding: "28px",
          maxWidth: "460px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#111111" }}>
            {titulo ?? "Remover conteúdo"}
          </h2>
          <p style={{ fontSize: "12px", color: "#A3A3A3", marginTop: "4px" }}>
            Esta ação aparece como &quot;Removido pela direção&quot; e fica registrada no histórico.
          </p>
        </div>

        <div>
          <label style={{ fontSize: "12px", fontWeight: 700, color: "#525252" }}>
            Motivo (obrigatório, mínimo 10 caracteres)
          </label>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={4}
            placeholder="Ex: conteúdo ofensivo, spam, link externo proibido..."
            style={{
              width: "100%",
              border: "1.5px solid #E5E5E5",
              borderRadius: "12px",
              padding: "12px 14px",
              fontSize: "14px",
              outline: "none",
              fontFamily: "Inter, sans-serif",
              resize: "none",
              marginTop: "6px",
            }}
          />
          <p
            style={{
              fontSize: "11px",
              color: motivo.length > 0 && !valido ? "#DC2626" : "#A3A3A3",
              marginTop: "4px",
            }}
          >
            {motivo.length}/10 caracteres mínimos
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={cancelar}
            disabled={enviando}
            className="um-btn-secondary"
            style={{ flex: 1, height: "44px", fontSize: "13px" }}
          >
            Cancelar
          </button>
          <button
            onClick={confirmar}
            disabled={!valido || enviando}
            className="um-btn-primary"
            style={{ flex: 1, height: "44px", fontSize: "13px", background: valido ? "#DC2626" : undefined }}
          >
            {enviando ? "Removendo..." : "Remover"}
          </button>
        </div>
      </div>
    </div>
  );
}
