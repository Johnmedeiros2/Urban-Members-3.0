import type { Metadata } from "next";
import NavBar from "@/components/landing/NavBar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import UseCasesSection from "@/components/landing/UseCasesSection";
import ComparisonTable from "@/components/landing/ComparisonTable";
import SocialProof from "@/components/landing/SocialProof";
import FAQ from "@/components/landing/FAQ";
import TrustSection from "@/components/landing/TrustSection";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Urban Members — Ganhe criando, vendendo e aprendendo",
  description:
    "A cidade digital brasileira. Venda produtos, crie cursos, faça lives e monetize seu talento. Cadastro gratuito, 10% só em vendas concluídas.",
  keywords: [
    "marketplace digital",
    "cursos online",
    "monetização criadores",
    "plataforma criadores brasil",
    "vender produtos digitais",
    "lives monetizadas",
    "urban members",
  ],
  authors: [{ name: "Urban Members" }],
  metadataBase: new URL("https://urbanicsa.com"),
  openGraph: {
    type: "website",
    url: "https://urbanicsa.com/landing-v2",
    title: "Urban Members — Ganhe criando, vendendo e aprendendo",
    description:
      "Venda produtos, crie cursos, faça lives e monetize seu talento na cidade digital brasileira.",
    siteName: "Urban Members",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Urban Members" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Urban Members — Ganhe criando, vendendo e aprendendo",
    description:
      "Venda produtos, crie cursos, faça lives e monetize seu talento na cidade digital brasileira.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

const schemaOrg = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Urban Members",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://urbanicsa.com",
  description:
    "Plataforma para criadores brasileiros venderem produtos, criarem cursos e fazerem lives com monetização nativa.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "BRL",
    description: "Cadastro gratuito. 10% de comissão sobre vendas concluídas.",
  },
  provider: {
    "@type": "Organization",
    name: "Urbanicsa Tecnologia",
    url: "https://urbanicsa.com",
  },
};

export default function LandingV2() {
  return (
    <>
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />

      <NavBar />

      <main>
        <HeroSection />
        <FeaturesGrid />
        <UseCasesSection />
        <ComparisonTable />
        <SocialProof />
        <FAQ />
        <TrustSection />
        <FinalCTA />
      </main>

      <Footer />
    </>
  );
}
