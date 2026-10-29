import { redirect } from "next/navigation"

/** Endereço antigo: o Stripe hoje volta para /checkout. Link velho cai em Pedidos. */
export default function PedidoCanceladoPage() {
  redirect("/pedidos")
}
