import Link from "next/link"
import { XCircle } from "lucide-react"

export default function PedidoCanceladoPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-6 text-center text-foreground">
      <div>
        <XCircle className="mx-auto size-12 text-muted-foreground" />
        <h1 className="mt-5 font-serif text-3xl">Compra cancelada</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Você pode voltar ao anúncio e tentar novamente quando quiser.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block bg-foreground px-5 py-3 text-sm font-bold text-white"
        >
          Voltar ao marketplace
        </Link>
      </div>
    </main>
  )
}
