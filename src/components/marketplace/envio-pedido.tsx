"use client"

import { useState } from "react"
import Link from "next/link"
import { AlertTriangle, Check, Copy, ExternalLink, Loader2, PackageCheck, Printer, Truck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import api from "@/lib/api"
import { formatarPreco } from "@/lib/format"
import { cn } from "@/lib/utils"
import { mensagemDaApi } from "@/services/tournamentService"

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
    /** Etiqueta gerada pelo site (Melhor Envio); null quando o vendedor compra a dele. */
    etiqueta: {
        status: "PENDENTE" | "GERADA" | "POSTADA" | "ENTREGUE" | "ERRO" | "MANUAL" | "CANCELADA"
        /** Motivo da falha (só para o vendedor). */
        erro: string | null
        /** Onde postar. */
        postagem: string | null
        /** Parte do frete que o vendedor cobre (sai do repasse dele). */
        pagoVendedor: number | null
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

/**
 * Etiqueta automática: o site já comprou a etiqueta com o frete do comprador. O vendedor imprime,
 * cola e posta; o rastreio entra sozinho. Se travar, dá para tentar de novo ou enviar por conta própria.
 */
function EtiquetaDoVendedor({
    orderId,
    envio,
    onMudou,
    onErro,
}: {
    orderId: string
    envio: Envio
    onMudou: () => Promise<void>
    onErro: (mensagem: string | null) => void
}) {
    const etiqueta = envio.etiqueta!
    const [ocupado, setOcupado] = useState<"imprimir" | "gerar" | "manual" | null>(null)
    const [confirmandoManual, setConfirmandoManual] = useState(false)
    const atrasado = !envio.enviadoEm && new Date(envio.prazoEnvio) < new Date()
    const freteManual = Number(envio.valor ?? 0) + Number(etiqueta.pagoVendedor ?? 0)
    const faltaEndereco = etiqueta.erro?.toLowerCase().includes("endereço de envio")

    async function executar(qual: "imprimir" | "gerar" | "manual", acao: () => Promise<void>, falha: string) {
        setOcupado(qual)
        onErro(null)
        try {
            await acao()
        } catch (cause) {
            onErro(mensagemDaApi(cause, falha))
        } finally {
            setOcupado(null)
        }
    }

    function imprimir() {
        // Abre a aba já no clique (o navegador bloqueia janela aberta depois de uma espera)
        const aba = window.open("", "_blank")
        void executar("imprimir", async () => {
            try {
                const { data } = await api.get<{ url: string }>(`/api/orders/${orderId}/etiqueta`)
                if (aba) aba.location.href = data.url
                else window.location.assign(data.url)
            } catch (cause) {
                aba?.close()
                throw cause
            }
        }, "Não foi possível abrir a etiqueta. Tente de novo.")
    }

    const caixa = `${envio.pesoKg ?? "?"} kg · ${envio.comprimentoCm ?? "?"} × ${envio.larguraCm ?? "?"} × ${envio.alturaCm ?? "?"} cm`

    if (etiqueta.status === "POSTADA" || etiqueta.status === "ENTREGUE") {
        return (
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-surface-muted px-3 py-2.5">
                <PackageCheck className="size-4 text-success" aria-hidden="true" />
                <span className="type-body-small text-foreground">
                    {etiqueta.status === "ENTREGUE" ? "Entregue ao comprador" : `Postado${envio.enviadoEm ? ` em ${dia(envio.enviadoEm)}` : ""}`}
                    {envio.rastreioCodigo && <> · <span className="font-mono">{envio.rastreioCodigo}</span></>}
                </span>
                {envio.rastreioCodigo && (
                    <a href={linkRastreio(envio.rastreioCodigo)} target="_blank" rel="noreferrer" className="type-caption inline-flex items-center gap-1 font-semibold text-primary hover:underline">
                        Acompanhar <ExternalLink className="size-3" aria-hidden="true" />
                    </a>
                )}
            </div>
        )
    }

    if (etiqueta.status === "GERADA") {
        return (
            <div className={cn("mt-3 rounded-lg border px-3 py-3", atrasado ? "border-destructive/40 bg-destructive/5" : "border-primary/30 bg-primary/5")}>
                <p className={cn("type-label flex items-center gap-2", atrasado ? "text-destructive" : "text-foreground")}>
                    <Truck className="size-4" aria-hidden="true" />
                    {atrasado ? `Envio atrasado: era até ${dia(envio.prazoEnvio)}` : `Etiqueta pronta · poste até ${dia(envio.prazoEnvio)}`}
                </p>
                <ol className="type-body-small mt-2 flex list-decimal flex-col gap-2 pl-5 text-muted-foreground">
                    <li>
                        Imprima a etiqueta e cole na caixa <strong className="text-foreground">({caixa})</strong>. Caixa maior que essa pode ser recusada.
                    </li>
                    <li>
                        Poste em: <strong className="text-foreground">{etiqueta.postagem ?? "ponto indicado na etiqueta"}</strong>. Não precisa pagar nada: o frete já está pago.
                    </li>
                    <li>O rastreio aparece aqui sozinho quando a transportadora receber o pacote.</li>
                </ol>
                <Button type="button" className="mt-3" onClick={imprimir} loading={ocupado === "imprimir"}>
                    <Printer aria-hidden="true" />
                    Imprimir etiqueta
                </Button>
                <p className="type-caption mt-2 text-muted-foreground">Sem impressora? Salve o PDF e peça para imprimir na agência ou numa papelaria.</p>
            </div>
        )
    }

    // PENDENTE ou ERRO
    const comErro = etiqueta.status === "ERRO"
    return (
        <div className={cn("mt-3 rounded-lg border px-3 py-3", comErro ? "border-destructive/40 bg-destructive/5" : "border-border bg-surface-muted")}>
            <p className={cn("type-label flex items-center gap-2", comErro ? "text-destructive" : "text-foreground")}>
                {comErro ? <AlertTriangle className="size-4" aria-hidden="true" /> : <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                {comErro ? "Não conseguimos gerar a etiqueta" : "Gerando a etiqueta…"}
            </p>
            <p className="type-body-small mt-1.5 text-muted-foreground">
                {etiqueta.erro ?? "O site está comprando a etiqueta com o frete que o comprador pagou. Em alguns minutos ela aparece aqui para imprimir."}
            </p>
            {comErro && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                    {faltaEndereco && (
                        <Button asChild size="sm" variant="outline">
                            <Link href="/configuracoes/endereco-envio">Cadastrar endereço de envio</Link>
                        </Button>
                    )}
                    <Button
                        type="button"
                        size="sm"
                        loading={ocupado === "gerar"}
                        onClick={() => executar("gerar", async () => {
                            await api.post(`/api/orders/${orderId}/etiqueta/gerar`)
                            await onMudou()
                        }, "Não foi possível gerar a etiqueta.")}
                    >
                        Gerar etiqueta
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => setConfirmandoManual(true)}>
                        Enviar por conta própria
                    </Button>
                </div>
            )}
            {confirmandoManual && (
                <div role="alertdialog" aria-labelledby={`manual-${orderId}`} className="mt-3 rounded-lg border border-border bg-surface px-3 py-3">
                    <p id={`manual-${orderId}`} className="type-label text-foreground">Comprar a etiqueta você mesmo?</p>
                    <p className="type-body-small mt-1 text-muted-foreground">
                        Você compra a etiqueta no Melhor Envio ou nos Correios, posta e informa o rastreio aqui.
                        {freteManual > 0 && <> O frete ({formatarPreco(freteManual)}) passa a ir para você junto com a venda.</>}
                    </p>
                    <div className="mt-3 flex gap-2">
                        <Button
                            type="button"
                            size="sm"
                            loading={ocupado === "manual"}
                            onClick={() => executar("manual", async () => {
                                await api.post(`/api/orders/${orderId}/etiqueta/conta-propria`)
                                setConfirmandoManual(false)
                                await onMudou()
                            }, "Não foi possível mudar para envio por conta própria.")}
                        >
                            Sim, vou comprar a etiqueta
                        </Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => setConfirmandoManual(false)}>
                            Voltar
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

/** Vendedor: etiqueta do site (quando houver) ou o passo a passo para comprar a dele e informar o rastreio. */
export function EnvioDoVendedor({
    orderId,
    envio,
    onInformar,
    onMudou,
    onErro,
}: {
    orderId: string
    envio: Envio
    onInformar: (codigo: string) => Promise<void>
    onMudou: () => Promise<void>
    onErro: (mensagem: string | null) => void
}) {
    if (envio.etiqueta && envio.etiqueta.status !== "MANUAL" && envio.etiqueta.status !== "CANCELADA") {
        return <EtiquetaDoVendedor orderId={orderId} envio={envio} onMudou={onMudou} onErro={onErro} />
    }
    return <EnvioManual envio={envio} onInformar={onInformar} />
}

/** Fluxo antigo: o vendedor compra a etiqueta e informa o rastreio. */
function EnvioManual({ envio, onInformar }: { envio: Envio; onInformar: (codigo: string) => Promise<void> }) {
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
