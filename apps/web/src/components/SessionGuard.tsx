"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient, supabaseConfigured } from "@/lib/supabase";

const ROTAS_AUTENTICADAS = [
  "/feed", "/perfil", "/mercado", "/lives", "/live", "/trilhas", "/trilha",
  "/curso", "/sala-de-aula", "/agenda", "/compras", "/wishlist", "/pulse",
  "/buscar", "/moradores", "/morador", "/empresa", "/admin", "/urban-pay", "/bairros",
];

export function SessionGuard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!supabaseConfigured) return;
    const supabase = createClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "SIGNED_IN") {
        // Primeira vez nesta aba → expulsa todas as outras sessões ativas
        if (!sessionStorage.getItem("urban_sessao_unica")) {
          sessionStorage.setItem("urban_sessao_unica", "1");
          await supabase.auth.signOut({ scope: "others" });
        }
      }

      if (event === "SIGNED_OUT") {
        // Logout intencional (botão Sair) → não mostra aviso de sessão encerrada
        if (sessionStorage.getItem("urban_logout_intencional")) {
          sessionStorage.removeItem("urban_logout_intencional");
          return;
        }
        // Sessão foi revogada por outro dispositivo → redireciona com aviso
        const naRotaAutenticada = ROTAS_AUTENTICADAS.some((r) => pathname.startsWith(r));
        if (naRotaAutenticada) {
          router.push("/login?motivo=sessao");
          router.refresh();
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  return null;
}
