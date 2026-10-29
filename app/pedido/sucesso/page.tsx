import { redirect } from "next/navigation"

/** Endereço antigo: o pagamento confirmado hoje cai em /checkout/sucesso. Link velho vai para Pedidos. */
export default function PedidoSucessoPage() {
  redirect("/pedidos")
}
