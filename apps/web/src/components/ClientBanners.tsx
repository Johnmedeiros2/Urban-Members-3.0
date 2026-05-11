"use client";
import dynamic from "next/dynamic";

const CookieBanner = dynamic(() => import("@/components/CookieBanner"), { ssr: false });
const GoogleAnalytics = dynamic(() => import("@/components/GoogleAnalytics"), { ssr: false });

export default function ClientBanners() {
  return (
    <>
      <CookieBanner />
      <GoogleAnalytics />
    </>
  );
}
