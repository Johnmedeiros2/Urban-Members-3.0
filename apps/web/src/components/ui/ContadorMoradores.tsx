"use client";

import { useEffect, useId, useState } from "react";
import { createClient } from "@/lib/supabase";

export default function ContadorMoradores({ dark = false }: { dark?: boolean }) {
  const id = useId();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function fetchCount() {
      const { count: total } = await supabase
        .from("perfis")
        .select("id", { count: "exact", head: true });
      setCount(total ?? 0);
    }

    fetchCount();

    const channel = supabase
      .channel(`perfis-count-${id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "perfis" },
        () => setCount((prev) => (prev !== null ? prev + 1 : 1))
      )
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "perfis" },
        () => setCount((prev) => (prev !== null ? Math.max(0, prev - 1) : 0))
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const numColor = dark ? "#FFFFFF" : "#111111";
  const textColor = dark ? "#A3A3A3" : "#525252";

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
      <span style={{
        width: "8px", height: "8px", borderRadius: "50%",
        background: "#FF5C2E", flexShrink: 0,
        animation: "pulse 1.5s ease-in-out infinite",
      }} />
      <span style={{ fontSize: "14px", color: textColor }}>
        <span style={{ fontWeight: 700, color: numColor }}>
          {count === null ? "..." : count.toLocaleString("pt-BR")}
        </span>
        {" "}moradores já na cidade
      </span>
    </div>
  );
}
