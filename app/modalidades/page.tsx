import Link from "next/link"

const modalities = [
  ["Downhill", "downhill"], ["BMX", "bmx"], ["Mountain Bike", "mountain"],
  ["Speed", "speed"], ["Urbana", "urbana"], ["Outros", "outros"],
]

export default function ModalitiesPage() {
  return <main className="mx-auto min-h-screen max-w-5xl px-4 py-10"><Link href="/" className="text-sm text-muted-foreground hover:text-foreground">← Início</Link><h1 className="mt-4 font-heading text-3xl font-bold">Modalidades</h1><p className="mt-2 text-muted-foreground">Explore produtos por modalidade.</p><div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">{modalities.map(([name, slug]) => <Link key={slug} href={`/modalidades/${slug}`} className="rounded-xl border border-border bg-card p-6 font-heading text-lg font-semibold transition hover:border-primary/40 hover:shadow-md">{name}<span className="mt-2 block text-sm font-normal text-muted-foreground">Ver produtos →</span></Link>)}</div></main>
}
