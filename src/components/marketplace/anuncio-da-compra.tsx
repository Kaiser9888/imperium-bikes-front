"use client"

import { useState } from "react"
import { FileText } from "lucide-react"

import { ProductImage } from "@/components/marketplace/ProductImage"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader } from "@/components/ui/loader"
import api from "@/lib/api"
import { formatarPreco } from "@/lib/format"
import { lerFicha, type ItemFicha } from "@/lib/publicar/perguntas"
import { PRODUCT_CONDITIONS, type ProductCondition } from "@/types/publish/product"

type Copia = {
    titulo: string
    descricao?: string | null
    condicao?: ProductCondition | null
    marca?: string | null
    modelo?: string | null
    ano?: number | null
    tipo?: string | null
    categoria?: string | null
    numeroSerieFinal?: string | null
    ficha?: ItemFicha[] | null
    fotos?: string[] | null
    preco?: number | null
    copiadoEm?: string | null
}

type Estado = { status: "fechado" } | { status: "carregando" } | { status: "sem-copia" } | { status: "erro" } | { status: "ok"; copia: Copia }

/**
 * "Anúncio comprado": o anúncio como estava na hora da compra (guardado no pedido).
 * Comprador, vendedor e admin veem o mesmo; é o que vale numa disputa.
 */
export function AnuncioDaCompra({ orderId, className }: { orderId: string; className?: string }) {
    const [estado, setEstado] = useState<Estado>({ status: "fechado" })

    async function abrir() {
        setEstado({ status: "carregando" })
        try {
            const r = await api.get<Copia | "">(`/api/orders/${orderId}/anuncio`)
            setEstado(r.status === 204 || !r.data ? { status: "sem-copia" } : { status: "ok", copia: r.data })
        } catch {
            setEstado({ status: "erro" })
        }
    }

    return (
        <>
            <Button size="sm" variant="outline" onClick={abrir} className={className}>
                <FileText aria-hidden="true" />
                Anúncio comprado
            </Button>

            <Dialog open={estado.status !== "fechado"} onOpenChange={(open) => !open && setEstado({ status: "fechado" })}>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Anúncio comprado</DialogTitle>
                        <DialogDescription>
                            Como estava na hora da compra. Se o vendedor mudar o anúncio depois, isto não muda.
                        </DialogDescription>
                    </DialogHeader>

                    {estado.status === "carregando" && <Loader className="py-10" />}
                    {estado.status === "erro" && <p className="type-body-small text-destructive">Não foi possível abrir. Tente de novo.</p>}
                    {estado.status === "sem-copia" && (
                        <p className="type-body-small text-muted-foreground">
                            Este pedido é de antes de o site guardar a cópia do anúncio. Use o anúncio atual e a conversa como referência.
                        </p>
                    )}
                    {estado.status === "ok" && <Detalhe copia={estado.copia} />}
                </DialogContent>
            </Dialog>
        </>
    )
}

function Detalhe({ copia }: { copia: Copia }) {
    const condicao = PRODUCT_CONDITIONS.find((c) => c.value === copia.condicao)?.label
    const ficha = lerFicha(copia.categoria, copia.ficha)
    const linhas = ([
        ["Condição", copia.categoria === "servicos" ? undefined : condicao],
        ...ficha.map(({ rotulo, valor }) => [rotulo, valor]),
        ["Marca", copia.marca],
        ["Modelo", copia.modelo],
        ["Ano", copia.ano ? String(copia.ano) : undefined],
        ["Nº de série", copia.numeroSerieFinal],
        ["Tipo", ficha.length ? undefined : copia.tipo],
    ] as [string, string | null | undefined][]).filter((l): l is [string, string] => Boolean(l[1]))

    return (
        <div className="flex min-w-0 flex-col gap-4">
            {!!copia.fotos?.length && (
                <ul className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1">
                    {copia.fotos.map((url) => (
                        <li key={url} className="aspect-square w-40 shrink-0 snap-start overflow-hidden rounded-lg bg-surface-muted">
                            <ProductImage src={url} alt="" className="size-full object-cover" />
                        </li>
                    ))}
                </ul>
            )}

            <div>
                <p className="type-h3 text-foreground">{copia.titulo}</p>
                {copia.preco != null && <p className="type-label mt-1 text-foreground">{formatarPreco(Number(copia.preco))}</p>}
                {copia.copiadoEm && (
                    <p className="type-caption mt-1 text-muted-foreground">
                        Guardado em {new Date(copia.copiadoEm).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                    </p>
                )}
            </div>

            {linhas.length > 0 && (
                <dl className="divide-y divide-border rounded-lg border border-border">
                    {linhas.map(([rotulo, valor]) => (
                        <div key={rotulo} className="flex justify-between gap-4 px-3 py-2">
                            <dt className="type-body-small text-muted-foreground">{rotulo}</dt>
                            <dd className="type-body-small text-right font-medium text-foreground">{valor}</dd>
                        </div>
                    ))}
                </dl>
            )}

            {copia.descricao && <p className="type-body-small whitespace-pre-line text-foreground">{copia.descricao}</p>}
        </div>
    )
}
