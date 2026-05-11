"use client";

import Script from "next/script";
import { useState, useEffect } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function GoogleAnalytics() {
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("urban_cookie_consent") === "granted") {
      setConsent(true);
    }
    const handler = () => setConsent(true);
    window.addEventListener("urban_consent_granted", handler);
    return () => window.removeEventListener("urban_consent_granted", handler);
  }, []);

  if (!consent || !GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_ID}', { send_page_view: true });
      `}</Script>
    </>
  );
}
