import Link from "next/link"
import { CategoryStep } from "@/components/publish/CategoryStep"

export default function PublicarPage() {
  return (
    <main className="imperium-page">
      <header className="imperium-header">
        <Link className="header-back" href="/">
          Voltar
        </Link>

        <div
          className="brand-mark"
          aria-label="Imperium Bikes"
        >
          IB
        </div>

        <div>
          <p className="eyebrow">
            Imperium Bikes
          </p>

          <p className="header-context">
            Novo anúncio
          </p>
        </div>
      </header>

      <div className="category-shell">
        <CategoryStep />
      </div>
    </main>
  )
}