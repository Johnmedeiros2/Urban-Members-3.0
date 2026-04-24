"use client";

import { useState, useEffect } from "react";
import { toggleWishlist, idsDaWishlist } from "@/lib/queries";

interface Props {
  tipo: "produto" | "curso";
  itemId: string;
  tamanho?: "sm" | "md";
}

export default function BotaoWishlist({ tipo, itemId, tamanho = "md" }: Props) {
  const [salvo, setSalvo] = useState(false);
  const [processando, setProcessando] = useState(false);

  useEffect(() => {
    (async () => {
      const ids = await idsDaWishlist();
      const set = tipo === "produto" ? ids.produtos : ids.cursos;
      setSalvo(set.has(itemId));
    })();
  }, [tipo, itemId]);

  async function toggle(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    if (processando) return;
    setProcessando(true);
    const otimista = !salvo;
    setSalvo(otimista);
    try {
      const final = await toggleWishlist(tipo, itemId);
      setSalvo(final);
    } catch {
      setSalvo(!otimista);
    } finally {
      setProcessando(false);
    }
  }

  const size = tamanho === "sm" ? 28 : 34;
  const icon = tamanho === "sm" ? 14 : 16;

  return (
    <button
      onClick={toggle}
      title={salvo ? "Remover dos salvos" : "Salvar para depois"}
      style={{
        width: size, height: size, borderRadius: "50%",
        background: salvo ? "#FFF3EF" : "#F5F5F5",
        border: salvo ? "1px solid #FFD4C4" : "1px solid transparent",
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s", flexShrink: 0,
      }}
    >
      <svg width={icon} height={icon} viewBox="0 0 24 24"
        fill={salvo ? "#FF5C2E" : "none"}
        stroke={salvo ? "#FF5C2E" : "#525252"}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
      </svg>
    </button>
  );
}
