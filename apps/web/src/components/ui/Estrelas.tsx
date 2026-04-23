"use client";

interface Props {
  valor: number;
  tamanho?: number;
  interativo?: boolean;
  onChange?: (n: number) => void;
  cor?: string;
}

export default function Estrelas({ valor, tamanho = 16, interativo = false, onChange, cor = "#FF5C2E" }: Props) {
  function estrela(n: number, preenchida: boolean, meia: boolean) {
    const fill = preenchida ? cor : "transparent";
    const stroke = preenchida ? cor : "#D4D4D4";
    return (
      <svg
        key={n}
        width={tamanho}
        height={tamanho}
        viewBox="0 0 24 24"
        style={{ cursor: interativo ? "pointer" : "default" }}
        onClick={() => interativo && onChange?.(n)}
      >
        {meia ? (
          <>
            <defs>
              <linearGradient id={`meio-${n}-${tamanho}`}>
                <stop offset="50%" stopColor={cor} />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <polygon
              points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
              fill={`url(#meio-${n}-${tamanho})`}
              stroke={cor}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </>
        ) : (
          <polygon
            points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        )}
      </svg>
    );
  }

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const preenchida = valor >= n;
        const meia = !preenchida && valor >= n - 0.5;
        return estrela(n, preenchida, meia);
      })}
    </div>
  );
}
