"use client"

import { useId, useState } from "react"
import Link from "next/link"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export type SelosDaConta = {
    vendedorVerificado?: boolean | null
    criadorVerificado?: boolean | null
    lojaVerificada?: boolean | null
    lojaNome?: string | null
}

type Chave = "vendedor" | "loja" | "criador"

type TipoDeSelo = {
    chave: Chave
    rotulo: string
    /** Pontas da medalha: cada selo tem um formato próprio (não depende só da cor). */
    pontas: number
    cores: [string, string]
    explica: string
    comoConquistar: string
}

/** Ordem = do mais fácil ao mais raro. Todos aparecem no "O que os selos significam", conquistados ou não. */
const TIPOS: TipoDeSelo[] = [
    {
        chave: "vendedor",
        rotulo: "Vendedor verificado",
        pontas: 12,
        cores: ["#34d399", "#047857"],
        explica:
            "Identidade confirmada pela Stripe, pelo menos 3 vendas entregues pelo Imperium, boa avaliação e nenhuma denúncia procedente recente. O site confere todo dia: se deixar de cumprir, o selo sai sozinho.",
        comoConquistar: "Confirme a identidade na Stripe e entregue 3 vendas pelo site com boa avaliação.",
    },
    {
        chave: "loja",
        rotulo: "Loja verificada",
        pontas: 8,
        cores: ["#60a5fa", "#1d4ed8"],
        explica: "Empresa com CNPJ ativo na Receita Federal. A equipe do Imperium conferiu que esta conta é mesmo da empresa.",
        comoConquistar: "Envie o CNPJ da sua loja ativa para a equipe conferir.",
    },
    {
        chave: "criador",
        rotulo: "Criador verificado",
        pontas: 16,
        cores: ["#fbbf24", "#dc2626"],
        explica:
            "Perfil com mais de 10 mil seguidores em outra rede (Instagram, TikTok, YouTube...). A equipe do Imperium conferiu que o perfil é mesmo desta pessoa.",
        comoConquistar: "Tenha mais de 10 mil seguidores em outra rede e prove que o perfil é seu.",
    },
]

function tem(s: SelosDaConta, c: Chave) {
    return c === "vendedor" ? !!s.vendedorVerificado : c === "loja" ? !!s.lojaVerificada : !!s.criadorVerificado
}

/** Estrela de pontas suaves (as pontas ficam arredondadas pelo traço com junção redonda). */
function estrela(pontas: number) {
    const pts: string[] = []
    for (let i = 0; i < pontas * 2; i++) {
        const r = i % 2 === 0 ? 10.4 : 8.9
        const a = (Math.PI * i) / pontas - Math.PI / 2
        pts.push(`${(12 + r * Math.cos(a)).toFixed(2)},${(12 + r * Math.sin(a)).toFixed(2)}`)
    }
    return pts.join(" ")
}

/** O símbolo em si: medalha com degradê, brilho e check. `apagado` = selo ainda não conquistado. */
export function SimboloSelo({ tipo, className, apagado }: { tipo: TipoDeSelo; className?: string; apagado?: boolean }) {
    const id = useId().replace(/:/g, "")
    const [claro, escuro] = apagado ? ["#d4d4d8", "#a1a1aa"] : tipo.cores
    return (
        <svg viewBox="0 0 24 24" className={cn("shrink-0", className)} aria-hidden="true">
            <defs>
                <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor={claro} />
                    <stop offset="1" stopColor={escuro} />
                </linearGradient>
                <linearGradient id={`b${id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#fff" stopOpacity="0.45" />
                    <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon points={estrela(tipo.pontas)} fill={`url(#g${id})`} stroke={`url(#g${id})`} strokeWidth="1.6" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="7.6" fill={`url(#b${id})`} />
            <path d="M8.2 12.3l2.5 2.5 5.1-5.3" fill="none" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

/**
 * Selos da conta como símbolos ao lado do nome (sem texto). Tocar abre o que cada um significa
 * e mostra os que faltam conquistar. Nada aparece se a conta não tem selo.
 */
export function Selos({ selos, pequeno, className }: { selos: SelosDaConta; pequeno?: boolean; className?: string }) {
    const [aberto, setAberto] = useState(false)
    const lista = TIPOS.filter((t) => tem(selos, t.chave))
    if (lista.length === 0) return null

    const nome = (t: TipoDeSelo) => (t.chave === "loja" && selos.lojaNome ? `Loja verificada · ${selos.lojaNome}` : t.rotulo)

    return (
        <>
            <button
                type="button"
                onClick={() => setAberto(true)}
                aria-label={lista.map(nome).join(", ")}
                title={lista.map(nome).join(" · ")}
                className={cn(
                    "inline-flex shrink-0 cursor-pointer items-center rounded-full transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    pequeno ? "-space-x-0.5" : "gap-0.5",
                    className,
                )}
            >
                {lista.map((t) => (
                    <SimboloSelo key={t.chave} tipo={t} className={pequeno ? "size-[18px]" : "size-6"} />
                ))}
            </button>

            <Dialog open={aberto} onOpenChange={setAberto}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Selos do Imperium</DialogTitle>
                        <DialogDescription>Ninguém compra selo: cada um é conquistado e conferido pelo Imperium.</DialogDescription>
                    </DialogHeader>
                    <ul className="flex flex-col gap-4">
                        {TIPOS.map((t) => {
                            const ganhou = tem(selos, t.chave)
                            return (
                                <li key={t.chave} className={cn("flex gap-3", !ganhou && "opacity-70")}>
                                    <SimboloSelo tipo={t} apagado={!ganhou} className="size-9" />
                                    <span>
                                        <span className="type-label block text-foreground">
                                            {nome(t)}
                                            {!ganhou && <span className="type-caption ml-2 text-muted-foreground">ainda não</span>}
                                        </span>
                                        <span className="type-body-small text-muted-foreground">
                                            {ganhou ? t.explica : t.comoConquistar}
                                        </span>
                                    </span>
                                </li>
                            )
                        })}
                    </ul>
                    <p className="type-caption text-muted-foreground">
                        Selo não é garantia: pague sempre pelo site, que é o que protege o seu dinheiro.{" "}
                        <Link href="/configuracoes/selos" className="font-semibold text-primary hover:underline">
                            Conquistar os meus
                        </Link>
                    </p>
                </DialogContent>
            </Dialog>
        </>
    )
}
