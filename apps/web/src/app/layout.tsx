import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PostHogProvider } from "@/components/PostHogProvider";
import { SessionGuard } from "@/components/SessionGuard";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Urban Members — A primeira cidade digital brasileira",
    template: "%s · Urban Members",
  },
  description: "Urban Members é a primeira cidade digital brasileira. Conecte-se, aprenda, venda e cresça num só lugar.",
  applicationName: "Urban Members",
  authors: [{ name: "Urban Members" }],
  keywords: ["cidade digital", "rede social", "educação", "marketplace", "Brasil", "criadores"],
  metadataBase: new URL("https://urbanicsa.com"),
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/logo.svg", type: "image/svg+xml", sizes: "any" },
    ],
    shortcut: "/icon.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://urbanicsa.com",
    siteName: "Urban Members",
    title: "Urban Members — A primeira cidade digital brasileira",
    description: "Conecte-se, aprenda, venda e cresça num só lugar.",
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "Urban Members",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Urban Members",
    description: "A primeira cidade digital brasileira.",
    images: ["/logo.svg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <PostHogProvider>
          <SessionGuard />
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
