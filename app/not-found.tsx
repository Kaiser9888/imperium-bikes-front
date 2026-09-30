import Link from "next/link"

export default function NotFound() {
  return <main className="grid min-h-[70vh] place-items-center px-4 text-center"><div><p className="font-heading text-sm font-semibold uppercase tracking-widest text-primary">404</p><h1 className="mt-2 font-heading text-3xl font-bold">Página não encontrada</h1><p className="mt-2 text-sm text-muted-foreground">O endereço pode ter mudado ou não existe.</p><div className="mt-6 flex justify-center gap-3"><Link href="/" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Início</Link><Link href="/produtos" className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium">Ver produtos</Link></div></div></main>
}
