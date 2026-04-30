"use client";

interface Props {
  motivo: string | null;
  removidoPor?: string | null;
}

export default function ConteudoRemovido({ motivo, removidoPor }: Props) {
  return (
    <div
      style={{
        background: "#FAFAFA",
        border: "1px dashed #E5E5E5",
        borderRadius: "14px",
        padding: "20px",
        display: "flex",
        gap: "14px",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          background: "#F5F5F5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: "18px",
        }}
      >
        🛡
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: "#A3A3A3",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Removido pela direção
        </p>
        {motivo && (
          <p style={{ fontSize: "14px", color: "#525252", lineHeight: 1.5, marginTop: "6px" }}>
            {motivo}
          </p>
        )}
        {removidoPor && (
          <p style={{ fontSize: "12px", color: "#A3A3A3", marginTop: "6px" }}>
            por {removidoPor}
          </p>
        )}
      </div>
    </div>
  );
}
