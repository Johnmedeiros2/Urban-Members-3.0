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
import LandingTracker from "@/components/landing/LandingTracker";

const BASE_URL = "https://urbanicsa.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: "Urban Members | Ganhe Criando, Vendendo e Aprendendo",
  description:
    "A primeira plataforma brasileira para criadores ganharem com marketplace, cursos, lives e comunidade. Sem taxas adicionais, apenas 10% em vendas.",
  keywords: [
    "marketplace",
    "cursos online",
    "creator economy",
    "live streaming",
    "gamificação",
    "monetização",
    "plataforma criadores",
    "vender produtos digitais",
    "urban members",
    "cidade digital brasileira",
    "criadores brasileiros",
    "trilhas de aprendizado",
  ],

  authors: [{ name: "Urban Members", url: BASE_URL }],
  creator: "Urban Members",
  publisher: "Urbanicsa Tecnologia",
  applicationName: "Urban Members",
  category: "Tecnologia",

  alternates: {
    canonical: BASE_URL,
    languages: { "pt-BR": BASE_URL },
  },

  openGraph: {
    type: "website",
    url: BASE_URL,
    siteName: "Urban Members",
    locale: "pt_BR",
    title: "Urban Members | Ganhe Criando, Vendendo e Aprendendo",
    description:
      "A primeira plataforma brasileira para criadores ganharem com marketplace, cursos, lives e comunidade. Apenas 10% em vendas concluídas.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Urban Members — Ganhe criando, vendendo e aprendendo",
        type: "image/png",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    site: "@urbanmembers",
    creator: "@urbanmembers",
    title: "Urban Members | Ganhe Criando, Vendendo e Aprendendo",
    description:
      "A primeira plataforma brasileira para criadores ganharem com marketplace, cursos, lives e comunidade.",
    images: [{ url: "/og-image.png", alt: "Urban Members" }],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
    apple: [{ url: "/logo.svg", sizes: "180x180" }],
  },
};

/* ─── JSON-LD Schemas ─────────────────────────────────────────────────── */

const schemaOrganization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${BASE_URL}/#organization`,
  name: "Urban Members",
  alternateName: "Urbanicsa Tecnologia",
  url: BASE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${BASE_URL}/logo.svg`,
    width: 200,
    height: 200,
  },
  description:
    "A primeira plataforma brasileira para criadores ganharem com marketplace, cursos, lives e comunidade.",
  foundingDate: "2026",
  foundingLocation: { "@type": "Place", addressCountry: "BR" },
  contactPoint: {
    "@type": "ContactPoint",
    email: "contato@urbanicsa.com",
    contactType: "customer support",
    availableLanguage: "Portuguese",
  },
  sameAs: [
    "https://instagram.com/urbanmembers",
    "https://twitter.com/urbanmembers",
  ],
};

const schemaSoftwareApplication = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": `${BASE_URL}/#app`,
  name: "Urban Members",
  applicationCategory: "BusinessApplication",
  applicationSubCategory: "CreatorEconomy",
  operatingSystem: "Web, iOS, Android",
  url: BASE_URL,
  description:
    "Plataforma all-in-one para criadores brasileiros: marketplace, cursos, lives com monetização e gamificação.",
  inLanguage: "pt-BR",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "BRL",
    description: "Cadastro gratuito. 10% de comissão apenas em vendas concluídas.",
    availability: "https://schema.org/InStock",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "5",
    reviewCount: "3",
    bestRating: "5",
    worstRating: "1",
  },
  publisher: {
    "@id": `${BASE_URL}/#organization`,
  },
};

const schemaFAQ = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Quanto custa usar Urban?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Grátis para criar conta e começar. Você paga apenas 10% quando vende — e só em vendas concluídas. Sem mensalidade, sem taxa de setup.",
      },
    },
    {
      "@type": "Question",
      name: "Como recebo meu dinheiro?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Transferência automática todo final de mês para sua conta bancária. Sem burocracia — você vende, nós transferimos.",
      },
    },
    {
      "@type": "Question",
      name: "Posso vender de tudo?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Produtos digitais, cursos, serviços e itens físicos. Proibido: itens ilegais e conteúdo protegido por direitos autorais sem autorização.",
      },
    },
    {
      "@type": "Question",
      name: "Preciso de experiência para ensinar?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Não. Se você sabe algo valioso, pode criar um curso. Nossa equipe pedagógica valida o conteúdo e a IA adapta o aprendizado para cada aluno.",
      },
    },
    {
      "@type": "Question",
      name: "Como começar no Urban Members?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "1) Crie conta com Google (30 segundos). 2) Complete seu perfil de criador. 3) Comece a criar e vender.",
      },
    },
  ],
};

const schemaWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${BASE_URL}/#website`,
  url: BASE_URL,
  name: "Urban Members",
  description: "A primeira plataforma brasileira para criadores ganharem com marketplace, cursos, lives e comunidade.",
  inLanguage: "pt-BR",
  publisher: { "@id": `${BASE_URL}/#organization` },
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${BASE_URL}/buscar?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

export default function Home() {
  return (
    <>
      {/* JSON-LD Schemas */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrganization) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaSoftwareApplication) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaFAQ) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaWebSite) }} />

      {/* Skip navigation para acessibilidade */}
      <a href="#main-content" className="skip-nav">
        Ir para o conteúdo principal
      </a>

      <NavBar />

      <main id="main-content">
        <section id="hero"><HeroSection /></section>
        <section id="features"><FeaturesGrid /></section>
        <section id="use-cases"><UseCasesSection /></section>
        <section id="comparison"><ComparisonTable /></section>
        <section id="social-proof"><SocialProof /></section>
        <section id="faq"><FAQ /></section>
        <section id="trust"><TrustSection /></section>
        <section id="final-cta"><FinalCTA /></section>
      </main>

      <Footer />
      <LandingTracker />
    </>
  );
}
