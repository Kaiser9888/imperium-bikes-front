import Image from "next/image"
import Link from "next/link"

export default function NotFound() {
  return <main className="relative isolate grid min-h-[70vh] place-items-center overflow-hidden px-4 text-center"><Image src="/sigillum/aquila.jpg" alt="" width={626} height={700} aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[85%] w-auto -translate-x-1/2 -translate-y-1/2 select-none opacity-[0.06] mix-blend-multiply dark:invert dark:mix-blend-screen" /><div><p className="font-heading text-sm font-semibold uppercase tracking-widest text-primary" title="404">CDIV</p><h1 className="mt-2 font-heading text-3xl font-bold">Página não encontrada</h1><p className="mt-2 text-sm text-muted-foreground">O endereço pode ter mudado ou não existe.</p><div className="mt-6 flex justify-center gap-3"><Link href="/" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Início</Link><Link href="/produtos" className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium">Ver produtos</Link></div></div></main>
}
