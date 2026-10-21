"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { FileText, LifeBuoy, Search } from "lucide-react"

import { AppShell } from "@/components/layout/app-shell"
import { Footer } from "@/components/layout/footer"
import { PageHeading } from "@/components/layout/page-heading"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { topicos } from "@/lib/ajuda"

/** Busca sem acento e sem diferença de maiúsculas ("reembolso" acha "Reembolso"). */
const normalizar = (texto: string) => texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

export default function AjudaPage() {
    const [busca, setBusca] = useState("")
    const termo = normalizar(busca.trim())

    const resultado = useMemo(
        () =>
            topicos
                .map((t) => ({
                    ...t,
                    perguntas: termo
                        ? t.perguntas.filter((p) => normalizar(`${p.pergunta} ${p.resposta}`).includes(termo))
                        : t.perguntas,
                }))
                .filter((t) => t.perguntas.length > 0),
        [termo],
    )

    return (
        <AppShell>
            <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-4 sm:px-6">
                <PageHeading title="Central de Ajuda" description="Respostas rápidas sobre compras, vendas, eventos, vídeos e pagamentos." back={{ href: "/", label: "Início" }} />

                <label className="mt-6 flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-3 focus-within:border-primary">
                    <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span className="sr-only">Buscar na ajuda</span>
                    <input
                        type="search"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        placeholder="Buscar: reembolso, frete, saque…"
                        data-plain
                        className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
                    />
                </label>

                {!termo && (
                    <nav aria-label="Assuntos" className="mt-5 flex flex-wrap gap-2">
                        {topicos.map((t) => (
                            <a key={t.id} href={`#${t.id}`} className="type-label inline-flex min-h-9 items-center rounded-full border border-border bg-surface px-3.5 hover:border-primary/60">
                                {t.titulo}
                            </a>
                        ))}
                    </nav>
                )}

                <p className="sr-only" aria-live="polite">
                    {termo ? `${resultado.reduce((n, t) => n + t.perguntas.length, 0)} respostas encontradas` : ""}
                </p>

                {resultado.length === 0 ? (
                    <p className="type-body-small mt-10 text-muted-foreground">Nada encontrado para “{busca}”. Fale com o suporte logo abaixo.</p>
                ) : (
                    resultado.map((t) => (
                        <section key={t.id} id={t.id} aria-labelledby={`${t.id}-titulo`} className="mt-10 scroll-mt-24">
                            <h2 id={`${t.id}-titulo`} className="type-h3 border-b border-border pb-2 text-foreground">
                                {t.titulo}
                            </h2>
                            <Accordion type="multiple">
                                {t.perguntas.map((p) => (
                                    <AccordionItem key={p.pergunta} value={p.pergunta}>
                                        <AccordionTrigger className="text-left">{p.pergunta}</AccordionTrigger>
                                        <AccordionContent>
                                            <p className="type-body-small text-muted-foreground">{p.resposta}</p>
                                            {p.link && (
                                                <Link href={p.link.href} className="type-label mt-2 inline-flex min-h-9 items-center text-primary underline underline-offset-2">
                                                    {p.link.label}
                                                </Link>
                                            )}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </section>
                    ))
                )}

                <section aria-labelledby="suporte-titulo" className="mt-12 rounded-2xl border border-primary/40 bg-surface p-5 sm:p-6">
                    <h2 id="suporte-titulo" className="type-h3 flex items-center gap-2 text-foreground">
                        <LifeBuoy className="size-5 text-primary" aria-hidden="true" />
                        Não encontrou sua resposta?
                    </h2>
                    <p className="type-body-small mt-1 text-muted-foreground">Abra um chamado. A resposta chega nas suas notificações.</p>
                    <Link href="/ajuda/contato" className="line-btn line-btn--accent mt-4">
                        Falar com o suporte
                    </Link>
                </section>

                <nav aria-label="Documentos" className="mt-8 flex flex-col gap-1">
                    {[
                        { href: "/termos", label: "Termos de Uso" },
                        { href: "/privacidade", label: "Política de Privacidade" },
                        { href: "/reembolso", label: "Política de Reembolso" },
                    ].map((d) => (
                        <Link key={d.href} href={d.href} className="type-body-small inline-flex min-h-10 items-center gap-2 text-muted-foreground hover:text-foreground">
                            <FileText className="size-4" aria-hidden="true" />
                            {d.label}
                        </Link>
                    ))}
                </nav>
            </main>
            <Footer />
        </AppShell>
    )
}
