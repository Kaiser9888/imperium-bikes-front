import Link from "next/link"

import { AppShell } from "@/components/layout/app-shell"
import { Footer } from "@/components/layout/footer"
import { PageHeading } from "@/components/layout/page-heading"
import { REVISAO_DOCUMENTOS } from "@/lib/empresa"

/** Casca dos documentos legais: título, data de revisão, índice e texto com leitura confortável. */
export function Documento({
    titulo,
    resumo,
    secoes,
    children,
}: {
    titulo: string
    resumo: string
    /** id e título de cada seção, para o índice. */
    secoes: { id: string; titulo: string }[]
    children: React.ReactNode
}) {
    return (
        <AppShell>
            <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-4 sm:px-6">
                <PageHeading title={titulo} description={resumo} back={{ href: "/ajuda", label: "Ajuda" }} />
                <p className="type-caption mt-2 text-muted-foreground">Última atualização: {REVISAO_DOCUMENTOS}</p>

                <nav aria-label="Nesta página" className="mt-6 rounded-2xl border border-border bg-surface p-4">
                    <p className="type-label text-foreground">Nesta página</p>
                    <ol className="mt-2 grid gap-1 sm:grid-cols-2">
                        {secoes.map((s, i) => (
                            <li key={s.id}>
                                <a href={`#${s.id}`} className="type-body-small inline-flex min-h-9 items-center text-primary hover:underline">
                                    {i + 1}. {s.titulo}
                                </a>
                            </li>
                        ))}
                    </ol>
                </nav>

                <div className="documento mt-8">{children}</div>

                <p className="type-body-small mt-10 border-t border-border pt-5 text-muted-foreground">
                    Ficou alguma dúvida? Veja a <Link href="/ajuda" className="font-semibold text-primary underline underline-offset-2">Central de Ajuda</Link> ou{" "}
                    <Link href="/ajuda/contato" className="font-semibold text-primary underline underline-offset-2">fale com o suporte</Link>.
                </p>
            </main>
            <Footer />
        </AppShell>
    )
}

export function Secao({ id, titulo, children }: { id: string; titulo: string; children: React.ReactNode }) {
    return (
        <section id={id} aria-labelledby={`${id}-titulo`} className="scroll-mt-24">
            <h2 id={`${id}-titulo`}>{titulo}</h2>
            {children}
        </section>
    )
}
