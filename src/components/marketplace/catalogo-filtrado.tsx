"use client"

import { useState } from "react"
import { SlidersHorizontal, X } from "lucide-react"

import { ProductsCatalog } from "@/components/marketplace/ProductsCatalog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const chipClasses = (ativo: boolean) =>
    cn(
        "type-label inline-flex h-10 cursor-pointer items-center rounded-full px-4 transition-colors",
        ativo ? "bg-primary text-primary-foreground" : "bg-surface-muted text-foreground hover:bg-border",
    )

type Props = {
    /** Termo que define a página (modalidade ou esporte). */
    category: string
    /** Tipos de produto oferecidos no filtro; sem eles, o grupo não aparece. */
    tipos?: string[]
}

/** Catálogo de uma modalidade ou esporte, com filtros de condição, preço e tipo. */
export function CatalogoFiltrado({ category, tipos = [] }: Props) {
    const [aberto, setAberto] = useState(false)
    const [condicao, setCondicao] = useState<string | null>(null)
    const [tipo, setTipo] = useState<string | null>(null)
    const [precoMin, setPrecoMin] = useState("")
    const [precoMax, setPrecoMax] = useState("")

    const ativos = [
        condicao && { label: condicao, limpar: () => setCondicao(null) },
        tipo && { label: tipo, limpar: () => setTipo(null) },
        precoMin && { label: `A partir de R$ ${precoMin}`, limpar: () => setPrecoMin("") },
        precoMax && { label: `Até R$ ${precoMax}`, limpar: () => setPrecoMax("") },
    ].filter((item): item is { label: string; limpar: () => void } => Boolean(item))

    const limpar = () => ativos.forEach((item) => item.limpar())

    return (
        <section aria-label="Produtos" className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
                <Button variant="outline" onClick={() => setAberto(true)}>
                    <SlidersHorizontal aria-hidden="true" />
                    Filtros{ativos.length > 0 && ` (${ativos.length})`}
                </Button>
                {ativos.map(({ label, limpar: remover }) => (
                    <Button key={label} variant="secondary" size="sm" className="rounded-full" onClick={remover}>
                        {label}
                        <X aria-hidden="true" />
                        <span className="sr-only">Remover filtro</span>
                    </Button>
                ))}
                {ativos.length > 1 && (
                    <Button variant="link" size="sm" onClick={limpar}>
                        Limpar todos
                    </Button>
                )}
            </div>

            <ProductsCatalog category={category} condition={condicao} minPrice={precoMin} maxPrice={precoMax} subcategory={tipo} />

            <Sheet open={aberto} onOpenChange={setAberto}>
                <SheetContent className="flex flex-col gap-0 overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Filtros</SheetTitle>
                        <SheetDescription>Refine os produtos desta página.</SheetDescription>
                    </SheetHeader>

                    <div className="flex flex-1 flex-col gap-7 px-4 py-2">
                        <fieldset>
                            <legend className="type-label mb-3 text-foreground">Condição</legend>
                            <div className="flex gap-2">
                                {["Novo", "Usado"].map((opcao) => (
                                    <button
                                        key={opcao}
                                        type="button"
                                        aria-pressed={condicao === opcao}
                                        onClick={() => setCondicao(condicao === opcao ? null : opcao)}
                                        className={chipClasses(condicao === opcao)}
                                    >
                                        {opcao}
                                    </button>
                                ))}
                            </div>
                        </fieldset>

                        <fieldset>
                            <legend className="type-label mb-3 text-foreground">Preço (R$)</legend>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="preco-min">Mínimo</Label>
                                    <Input id="preco-min" type="number" inputMode="decimal" min={0} value={precoMin} onChange={(event) => setPrecoMin(event.target.value)} />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="preco-max">Máximo</Label>
                                    <Input id="preco-max" type="number" inputMode="decimal" min={0} value={precoMax} onChange={(event) => setPrecoMax(event.target.value)} />
                                </div>
                            </div>
                        </fieldset>

                        {tipos.length > 0 && (
                            <fieldset>
                                <legend className="type-label mb-3 text-foreground">Tipo de produto</legend>
                                <div className="flex flex-wrap gap-2">
                                    {tipos.map((opcao) => (
                                        <button
                                            key={opcao}
                                            type="button"
                                            aria-pressed={tipo === opcao}
                                            onClick={() => setTipo(tipo === opcao ? null : opcao)}
                                            className={chipClasses(tipo === opcao)}
                                        >
                                            {opcao}
                                        </button>
                                    ))}
                                </div>
                            </fieldset>
                        )}
                    </div>

                    <SheetFooter className="flex-row gap-2">
                        <Button variant="outline" className="flex-1" onClick={limpar}>
                            Limpar
                        </Button>
                        <Button className="flex-1" onClick={() => setAberto(false)}>
                            Ver produtos
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </section>
    )
}
