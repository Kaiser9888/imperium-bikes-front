"use client"

import { useState } from "react"
import { BadgeCheck, Clapperboard, Store, type LucideIcon } from "lucide-react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export type SelosDaConta = {
    vendedorVerificado?: boolean | null
    criadorVerificado?: boolean | null
    lojaVerificada?: boolean | null
    lojaNome?: string | null
}

type Selo = { chave: string; rotulo: string; icone: LucideIcon; classe: string; explica: string }

/** Cada selo com cor e ícone próprios; o texto diz exatamente o que foi conferido. */
function selosDe(s: SelosDaConta): Selo[] {
    return [
        s.vendedorVerificado && {
            chave: "vendedor",
            rotulo: "Vendedor verificado",
            icone: BadgeCheck,
            classe: "bg-success/10 text-success",
            explica:
                "Identidade confirmada pela Stripe, pelo menos 3 vendas entregues pelo Imperium, boa avaliação e nenhuma denúncia procedente recente. O site confere todo dia: se deixar de cumprir, o selo sai sozinho.",
        },
        s.lojaVerificada && {
            chave: "loja",
            rotulo: s.lojaNome ? `Loja verificada · ${s.lojaNome}` : "Loja verificada",
            icone: Store,
            classe: "bg-info/10 text-info",
            explica:
                "Empresa com CNPJ ativo na Receita Federal. A equipe do Imperium conferiu que esta conta é mesmo da empresa.",
        },
        s.criadorVerificado && {
            chave: "criador",
            rotulo: "Criador verificado",
            icone: Clapperboard,
            classe: "bg-primary/10 text-primary",
            explica:
                "Perfil com mais de 10 mil seguidores em outra rede (Instagram, TikTok, YouTube...). A equipe do Imperium conferiu que o perfil é mesmo desta pessoa.",
        },
    ].filter(Boolean) as Selo[]
}

/** Selos da conta. Tocar abre o que cada um significa. Nada aparece se a conta não tem selo. */
export function Selos({ selos, pequeno, className }: { selos: SelosDaConta; pequeno?: boolean; className?: string }) {
    const [aberto, setAberto] = useState(false)
    const lista = selosDe(selos)
    if (lista.length === 0) return null

    return (
        <>
            <span className={cn("flex flex-wrap gap-1.5", className)}>
                {lista.map((s) => (
                    <button
                        key={s.chave}
                        type="button"
                        onClick={() => setAberto(true)}
                        title={s.explica}
                        className={cn(
                            "inline-flex max-w-full cursor-pointer items-center gap-1 rounded-full font-semibold",
                            pequeno ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
                            s.classe,
                        )}
                    >
                        <s.icone className={pequeno ? "size-3" : "size-3.5"} aria-hidden="true" />
                        <span className="truncate">{s.rotulo}</span>
                    </button>
                ))}
            </span>

            <Dialog open={aberto} onOpenChange={setAberto}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>O que os selos significam</DialogTitle>
                        <DialogDescription>Selos dados pelo Imperium Bikes depois de conferir. Ninguém compra selo.</DialogDescription>
                    </DialogHeader>
                    <ul className="flex flex-col gap-4">
                        {lista.map((s) => (
                            <li key={s.chave} className="flex gap-3">
                                <span className={cn("grid size-8 shrink-0 place-items-center rounded-full", s.classe)}>
                                    <s.icone className="size-4" aria-hidden="true" />
                                </span>
                                <span>
                                    <span className="type-label block text-foreground">{s.rotulo}</span>
                                    <span className="type-body-small text-muted-foreground">{s.explica}</span>
                                </span>
                            </li>
                        ))}
                    </ul>
                    <p className="type-caption text-muted-foreground">
                        Selo não é garantia: pague sempre pelo site, que é o que protege o seu dinheiro.
                    </p>
                </DialogContent>
            </Dialog>
        </>
    )
}
