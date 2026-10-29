"use client"

import Script from "next/script"

/** Google Analytics 4. Só é montado depois do "Aceitar" no aviso de cookies. */
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-QN9F2SG63V"

type Gtag = (...args: unknown[]) => void

/** Recusa depois de ter aceitado: o script já carregado para de gravar cookies. */
export function negarGoogleAnalytics() {
    const gtag = (window as unknown as { gtag?: Gtag }).gtag
    gtag?.("consent", "update", { analytics_storage: "denied" })
}

export function GoogleAnalytics() {
    return (
        <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga-config" strategy="afterInteractive">
                {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
gtag('js', new Date());
gtag('config', '${GA_ID}', { allow_google_signals: false, allow_ad_personalization_signals: false });`}
            </Script>
        </>
    )
}
