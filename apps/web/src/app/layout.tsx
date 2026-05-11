import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PostHogProvider } from "@/components/PostHogProvider";
import { SessionGuard } from "@/components/SessionGuard";
import ClientBanners from "@/components/ClientBanners";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FF5C2E",
};

export const metadata: Metadata = {
  title: {
    default: "Urban Members — A primeira cidade digital brasileira",
    template: "%s · Urban Members",
  },
  description:
    "A primeira plataforma brasileira para criadores ganharem com marketplace, cursos, lives e comunidade. Apenas 10% em vendas concluídas.",
  applicationName: "Urban Members",
  authors: [{ name: "Urban Members", url: "https://urbanicsa.com" }],
  creator: "Urban Members",
  publisher: "Urbanicsa Tecnologia",
  keywords: [
    "marketplace",
    "cursos online",
    "creator economy",
    "live streaming",
    "gamificação",
    "monetização criadores",
    "plataforma criadores brasil",
    "urban members",
  ],
  metadataBase: new URL("https://urbanicsa.com"),
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
    apple: [{ url: "/logo.svg", sizes: "180x180", type: "image/svg+xml" }],
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://urbanicsa.com",
    siteName: "Urban Members",
    title: "Urban Members — A primeira cidade digital brasileira",
    description:
      "Marketplace, cursos, lives e comunidade para criadores brasileiros. Apenas 10% em vendas.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Urban Members" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@urbanmembers",
    title: "Urban Members — A primeira cidade digital brasileira",
    description: "Marketplace, cursos, lives e comunidade para criadores brasileiros.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  verification: {
    google: "",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full`}>
      <head>
        {/* Preconnect para performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* DNS prefetch para serviços externos */}
        <link rel="dns-prefetch" href="https://izsuvdojvsuiyhkeuyll.supabase.co" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      </head>
      <body className="min-h-full flex flex-col">
        <PostHogProvider>
          <SessionGuard />
          {children}
          <ClientBanners />
        </PostHogProvider>
      </body>
    </html>
  );
}
