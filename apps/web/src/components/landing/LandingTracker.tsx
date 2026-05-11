"use client";

import { useEffect } from "react";

// Mapeia seções da landing para nomes legíveis no GA4
const SECTION_LABELS: Record<string, string> = {
  hero: "hero",
  features: "features",
  "social-proof": "social_proof",
  comparison: "comparison",
  faq: "faq",
  "final-cta": "final_cta",
};

function getSection(el: Element): string {
  const section = el.closest("section[id]");
  if (!section) return "unknown";
  return SECTION_LABELS[section.id] ?? section.id;
}

export default function LandingTracker() {
  useEffect(() => {
    function gtag(...args: unknown[]) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).gtag?.(...args);
    }

    function handleClick(e: MouseEvent) {
      const target = e.target as Element;
      const link = target.closest("a");
      if (!link) return;

      const href = link.getAttribute("href") ?? "";
      const section = getSection(link);

      // CTA principal (lp-cta class) — marca como conversão
      if (link.classList.contains("lp-cta")) {
        gtag("event", "cta_click", { section, destination: href });
        gtag("event", "signup_intent", { source: "landing", section });
      }

      // Botão de login da landing
      if (link.classList.contains("lp-login-btn")) {
        gtag("event", "login_click", { source: "landing", section });
      }

      // Qualquer link para /cadastro
      if (href.includes("/cadastro") && !link.classList.contains("lp-cta")) {
        gtag("event", "signup_intent", { source: "landing", section });
      }
    }

    // Scroll profundo — marca quando usuário vê seções importantes
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = (entry.target as HTMLElement).id;
          const label = SECTION_LABELS[id] ?? id;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).gtag?.("event", "section_view", { section: label });
          observer.unobserve(entry.target); // dispara só uma vez por seção
        });
      },
      { threshold: 0.3 }
    );

    document.querySelectorAll("section[id]").forEach((s) => observer.observe(s));
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
      observer.disconnect();
    };
  }, []);

  return null;
}
