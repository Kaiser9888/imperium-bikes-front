"use client"

import { useEffect } from "react"

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Erro ao renderizar página:", error) }, [error])
  return <main className="grid min-h-[70vh] place-items-center px-4 text-center"><div><h1 className="font-heading text-2xl font-bold">Não foi possível carregar esta página</h1><p className="mt-2 text-sm text-muted-foreground">Tente novamente. Se o problema continuar, volte ao início.</p><div className="mt-5 flex justify-center gap-3"><button onClick={reset} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Tentar novamente</button><a href="/" className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium">Ir ao início</a></div></div></main>
}
