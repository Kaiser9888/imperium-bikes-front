"use client"

import { useState } from "react"
import { Check, Copy, ExternalLink, PackageCheck, Truck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatarPreco } from "@/lib/format"
import { cn } from "@/lib/utils"

export type Envio = {
    transportadora: string | null
    servico: string | null
    /** Parte do frete paga pelo comprador (vai junto no repasse). */
    valor: number | null
    prazoDias: number | null
    pesoKg: number | null
    alturaCm: number | null
    larguraCm: number | null
    comprimentoCm: number | null
    /** Até quando o vendedor deve postar. */
    prazoEnvio: string
    rastreioCodigo: string | null
    enviadoEm: string | null
    destino: {
        nome: string | null
        telefone: string | null
        cpf: string | null
        logradouro: string
        numero: string | null
        complemento: string | null
        bairro: string | null
        cidade: string | null
        uf: string | null
        cep: string | null
    } | null
}

const dia = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })
const cep = (v?: string | null) => (v && v.length === 8 ? `${v.slice(0, 5)}-${v.slice(5)}` : v ?? "")
const cpf = (v?: string | null) => (v && v.length === 11 ? `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6, 9)}-${v.slice(9)}` : v ?? "")
const telefone = (v?: string | null) =>
    v && v.length >= 10 ? `(${v.slice(0, 2)}) ${v.slice(2, v.length - 4)}-${v.slice(-4)}` : v ?? ""

/** Melhor Rastreio acompanha Correios, Jadlog e as outras do Melhor Envio. */
export const linkRastreio = (codigo: string) => `https://www.melhorrastreio.com.br/rastreio/${encodeURIComponent(codigo)}`

function enderecoEmTexto(d: NonNullable<Envio["destino"]>): string {
    return [
        d.nome,
        `${d.logradouro}, ${d.numero ?? "s/n"}${d.complemento ? ` - ${d.complemento}` : ""}`,
        [d.bairro, [d.cidade, d.uf].filter(Boolean).join("/")].filter(Boolean).join(" - "),
        `CEP ${cep(d.cep)}`,
    ].filter(Boolean).join("\n")
}

/** Vendedor: o que precisa para comprar a etiqueta e onde informar o rastreio. */
export function EnvioDoVendedor({ envio, onInformar }: { envio: Envio; onInformar: (codigo: string) => Promise<void> }) {
    const [codigo, setCodigo] = useState("")
    const [salvando, setSalvando] = useState(false)
    const [copiado, setCopiado] = useState(false)
    const [corrigindo, setCorrigindo] = useState(false)
    const atrasado = !envio.enviadoEm && new Date(envio.prazoEnvio) < new Date()
    const d = envio.destino

    async function informar(e: React.FormEvent) {
        e.preventDefault()
        setSalvando(true)
        try {
            await onInformar(codigo)
            setCodigo("")
            setCorrigindo(false)
        } catch {
            // a página mostra o erro; o código digitado continua no campo
        } finally {
            setSalvando(false)
        }
    }

    async function copiar() {
        if (!d) return
        try {
            await navigator.clipboard.writeText(enderecoEmTexto(d))
            setCopiado(true)
            window.setTimeout(() => setCopiado(false), 2000)
        } catch {
            // sem permissão de área de transferência: o endereço está na tela
        }
    }

    if (envio.enviadoEm && !corrigindo) {
        return (
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-surface-muted px-3 py-2.5">
                <PackageCheck className="size-4 text-success" aria-hidden="true" />
                <span className="type-body-small text-foreground">
                    Enviado em {dia(envio.enviadoEm)} · <span className="font-mono">{envio.rastreioCodigo}</span>
                </span>
                <button type="button" onClick={() => setCorrigindo(true)} className="type-caption cursor-pointer text-muted-foreground underline underline-offset-2 hover:text-foreground">
                    Corrigir código
                </button>
            </div>
        )
    }

    return (
        <div className={cn("mt-3 rounded-lg border px-3 py-3", atrasado ? "border-destructive/40 bg-destructive/5" : "border-primary/30 bg-primary/5")}>
            {!envio.enviadoEm && (
                <p className={cn("type-label flex items-center gap-2", atrasado ? "text-destructive" : "text-foreground")}>
                    <Truck className="size-4" aria-hidden="true" />
                    {atrasado ? `Envio atrasado: era até ${dia(envio.prazoEnvio)}` : `Poste até ${dia(envio.prazoEnvio)}`}
                </p>
            )}

            <ol className="type-body-small mt-2 flex list-decimal flex-col gap-2 pl-5 text-muted-foreground">
                <li>
                    Compre a etiqueta no{" "}
                    <a href="https://melhorenvio.com.br" target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 font-medium text-foreground underline underline-offset-2">
                        Melhor Envio <ExternalLink className="size-3" aria-hidden="true" />
                    </a>{" "}
                    em <strong className="text-foreground">{[envio.transportadora, envio.servico].filter(Boolean).join(" · ")}</strong>, o serviço que o
                    comprador escolheu. Assim o valor bate com o frete pago
                    {envio.valor != null && Number(envio.valor) > 0 && <> ({formatarPreco(Number(envio.valor))}, que você recebe junto com a venda)</>}.
                </li>
                <li>
                    Use a caixa com as medidas do anúncio:{" "}
                    <strong className="text-foreground">
                        {envio.pesoKg ?? "?"} kg · {envio.comprimentoCm ?? "?"} × {envio.larguraCm ?? "?"} × {envio.alturaCm ?? "?"} cm
                    </strong>
                    . Caixa maior sai mais cara.
                </li>
                <li>Poste e informe aqui o código de rastreio da etiqueta.</li>
            </ol>

            {d && (
                <div className="mt-3 rounded-lg border border-border bg-surface px-3 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                        <p className="type-caption uppercase tracking-wider text-muted-foreground">Destinatário</p>
                        <button type="button" onClick={copiar} className="type-caption inline-flex cursor-pointer items-center gap-1 text-primary hover:underline">
                            {copiado ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
                            {copiado ? "Copiado" : "Copiar endereço"}
                        </button>
                    </div>
                    <p className="type-body-small mt-1 whitespace-pre-line text-foreground">{enderecoEmTexto(d)}</p>
                    {(d.cpf || d.telefone) && (
                        <p className="type-caption mt-1 text-muted-foreground">
                            {d.cpf && <>CPF {cpf(d.cpf)}</>}
                            {d.cpf && d.telefone && " · "}
                            {d.telefone && <>Tel. {telefone(d.telefone)}</>}
                        </p>
                    )}
                </div>
            )}

            <form onSubmit={informar} className="mt-3 flex flex-col gap-1.5">
                <Label htmlFor="rastreio">Código de rastreio</Label>
                <div className="flex gap-2">
                    <Input
                        id="rastreio"
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                        maxLength={40}
                        autoCapitalize="characters"
                        placeholder={envio.rastreioCodigo ?? "Ex.: AB123456789BR"}
                        className="min-w-0 flex-1 font-mono"
                    />
                    <Button type="submit" size="sm" className="h-10" loading={salvando} disabled={codigo.trim().length < 5}>
                        {envio.enviadoEm ? "Salvar" : "Marcar como enviado"}
                    </Button>
                </div>
            </form>
        </div>
    )
}

/** Comprador: aguardando a postagem ou acompanhando a entrega. */
export function EnvioDoComprador({ envio }: { envio: Envio }) {
    if (!envio.enviadoEm || !envio.rastreioCodigo) {
        return (
            <p className="type-body-small mt-3 flex items-start gap-2 rounded-lg bg-surface-muted px-3 py-2.5 text-muted-foreground">
                <Truck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <span>
                    Aguardando o vendedor postar (até {dia(envio.prazoEnvio)}). O pagamento continua retido e você é avisado quando sair.
                </span>
            </p>
        )
    }
    return (
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-surface-muted px-3 py-2.5">
            <PackageCheck className="size-4 text-success" aria-hidden="true" />
            <span className="type-body-small text-foreground">
                Enviado em {dia(envio.enviadoEm)} · <span className="font-mono">{envio.rastreioCodigo}</span>
            </span>
            <a href={linkRastreio(envio.rastreioCodigo)} target="_blank" rel="noreferrer" className="type-caption inline-flex items-center gap-1 font-semibold text-primary hover:underline">
                Acompanhar <ExternalLink className="size-3" aria-hidden="true" />
            </a>
        </div>
    )
}
