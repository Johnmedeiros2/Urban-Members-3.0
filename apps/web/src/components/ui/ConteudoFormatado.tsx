"use client";

import { useRouter } from "next/navigation";

interface Props {
  texto: string;
  style?: React.CSSProperties;
}

const REGEX = /(#\w+|@[\w]+)/g;

export default function ConteudoFormatado({ texto, style }: Props) {
  const router = useRouter();
  const partes = texto.split(REGEX);

  return (
    <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, ...style }}>
      {partes.map((parte, i) => {
        if (parte.startsWith("#")) {
          const tag = parte.slice(1).toLowerCase();
          return (
            <span
              key={i}
              onClick={(e) => { e.stopPropagation(); router.push(`/feed?tag=${tag}`); }}
              style={{ color: "#FF5C2E", fontWeight: 600, cursor: "pointer" }}
            >
              {parte}
            </span>
          );
        }
        if (parte.startsWith("@")) {
          const nome = parte.slice(1);
          return (
            <span
              key={i}
              onClick={(e) => { e.stopPropagation(); router.push(`/moradores?q=${encodeURIComponent(nome)}`); }}
              style={{ color: "#FF5C2E", fontWeight: 600, cursor: "pointer" }}
            >
              {parte}
            </span>
          );
        }
        return <span key={i}>{parte}</span>;
      })}
    </p>
  );
}
