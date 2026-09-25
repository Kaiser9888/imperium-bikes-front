"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"
import { paymentService } from "@/services/publish/payment.service"
import type { PaymentStatus } from "@/types/payment"

// Você precisa guardar o paymentId (não o session_id do Stripe) em algum
// lugar acessível aqui. Duas opções simples:
// 1) success_url do backend leva paymentId como query além do session_id
// 2) endpoint GET /api/payments/by-session/{sessionId} no backend
// Abaixo assumo a opção 1: success_url = ".../sucesso?paymentId={id}"

export default function PedidoSucessoPage() {
  const { getToken } = useAuth()
  const params = useSearchParams()
  const paymentId = params.get("paymentId")

  const [status, setStatus] = useState<PaymentStatus | "LOADING">("LOADING")

  useEffect(() => {
    if (!paymentId) {
      setStatus("FAILED")
      return
    }

    const id = paymentId

    let tentativas = 0
    let ativo = true

    async function verificar() {
      try {
        const pagamento = await paymentService.findById(
          id,
          getToken
        )

        if (!ativo) return

        if (pagamento.status === "PAID" || pagamento.status === "FAILED") {
          setStatus(pagamento.status)
          return
        }

        tentativas += 1

        if (tentativas < 10) {
          setTimeout(verificar, 2000)
        } else {
          // webhook pode estar atrasado; não trava o usuário aqui
          setStatus(pagamento.status)
        }
      } catch (error) {
        console.error("Erro ao verificar pagamento:", error)

        if (ativo) {
          setStatus("FAILED")
        }
      }
    }

    verificar()

    return () => {
      ativo = false
    }
  }, [paymentId, getToken])

  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f3ee] px-6 text-center text-[#1d282b]">
      <div className="max-w-md">

        {status === "LOADING" && (
          <>
            <Loader2 className="mx-auto size-10 animate-spin text-[#a33c36]" />

            <h1 className="mt-5 font-serif text-3xl">
              Confirmando pagamento...
            </h1>

            <p className="mt-2 text-sm text-[#68737a]">
              Isso pode levar alguns segundos.
            </p>
          </>
        )}

        {status === "PAID" && (
          <>
            <CheckCircle2 className="mx-auto size-12 text-[#386148]" />

            <h1 className="mt-5 font-serif text-3xl">
              Pagamento confirmado!
            </h1>

            <p className="mt-2 text-sm text-[#68737a]">
              O vendedor foi notificado e vai preparar o envio.
              O valor fica protegido até a entrega ser confirmada.
            </p>

            <Link
              href="/"
              className="mt-6 inline-block bg-[#1d282b] px-5 py-3 text-sm font-bold text-white"
            >
              Voltar ao marketplace
            </Link>
          </>
        )}

        {(status === "FAILED" || status === "CANCELED") && (
          <>
            <XCircle className="mx-auto size-12 text-[#a33c36]" />

            <h1 className="mt-5 font-serif text-3xl">
              Algo deu errado
            </h1>

            <p className="mt-2 text-sm text-[#68737a]">
              Não conseguimos confirmar seu pagamento. Nenhum valor foi
              cobrado indevidamente — tente novamente.
            </p>

            <Link
              href="/"
              className="mt-6 inline-block border border-[#1d282b] px-5 py-3 text-sm font-bold"
            >
              Voltar
            </Link>
          </>
        )}

      </div>
    </main>
  )
}