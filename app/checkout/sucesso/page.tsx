"use client"

import { Suspense, useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"
import { apiFetch } from "@/lib/apiClient"
import type { PedidoResponse } from "@/types/pedido"

function SuccessContent() {
  const params = useSearchParams()
  const orderId = params.get("orderId")
  const { getToken, isLoaded } = useAuth()
  const [status, setStatus] = useState<"LOADING" | "PAGO" | "FAILED" | "PENDING">("LOADING")

  useEffect(() => {
    if (!isLoaded || !orderId) return
    let active = true
    let attempts = 0
    let timer: ReturnType<typeof setTimeout>
    const check = async () => {
      try {
        const order = await apiFetch<PedidoResponse>(`/api/pedidos/${encodeURIComponent(orderId)}`, getToken)
        if (!active) return
        if (order.status === "PAGO" || order.status === "PAID") { setStatus("PAGO"); return }
        if (["FAILED", "FALHOU", "CANCELADO", "CANCELED"].includes(order.status.toUpperCase())) { setStatus("FAILED"); return }
        attempts += 1
        if (attempts >= 10) { setStatus("PENDING"); return }
        timer = setTimeout(check, 2000)
      } catch {
        if (active) setStatus("FAILED")
      }
    }
    void check()
    return () => { active = false; clearTimeout(timer) }
  }, [getToken, isLoaded, orderId])

  if (!orderId) return <main className="grid min-h-screen place-items-center px-6 text-center"><div><XCircle className="mx-auto size-12 text-primary"/><h1 className="mt-5 font-serif text-3xl">Não foi possível confirmar</h1><p className="mt-2 text-sm text-muted-foreground">O pedido não foi informado.</p><Link href="/" className="mt-6 inline-block underline">Voltar ao marketplace</Link></div></main>
  return <main className="grid min-h-screen place-items-center bg-background px-6 text-center text-foreground"><div className="max-w-md">{status === "LOADING" && <><Loader2 className="mx-auto size-10 animate-spin text-primary"/><h1 className="mt-5 font-serif text-3xl">Confirmando pagamento...</h1><p className="mt-2 text-sm text-muted-foreground">Isso pode levar alguns segundos.</p></>}{status === "PAGO" && <><CheckCircle2 className="mx-auto size-12 text-green-700"/><h1 className="mt-5 font-serif text-3xl">Pagamento confirmado!</h1><p className="mt-2 text-sm text-muted-foreground">Seu pedido foi pago e o vendedor foi notificado.</p><Link href="/" className="mt-6 inline-block bg-foreground px-5 py-3 text-sm font-bold text-white">Voltar ao marketplace</Link></>}{status === "PENDING" && <><Loader2 className="mx-auto size-10 text-primary"/><h1 className="mt-5 font-serif text-3xl">Pagamento em confirmação</h1><p className="mt-2 text-sm text-muted-foreground">O provedor ainda está atualizando o pedido. Consulte novamente em alguns instantes.</p><Link href="/" className="mt-6 inline-block underline">Voltar ao marketplace</Link></>}{status === "FAILED" && <><XCircle className="mx-auto size-12 text-primary"/><h1 className="mt-5 font-serif text-3xl">Não foi possível confirmar</h1><p className="mt-2 text-sm text-muted-foreground">Não encontramos a confirmação do pedido. Verifique seu pedido ou tente novamente.</p><Link href="/" className="mt-6 inline-block underline">Voltar ao marketplace</Link></>}</div></main>
}

export default function CheckoutSuccessPage() {
  return <Suspense fallback={<main className="grid min-h-screen place-items-center"><Loader2 className="size-8 animate-spin"/></main>}><SuccessContent/></Suspense>
}
