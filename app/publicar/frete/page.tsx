"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Check, Loader2, MapPin, Pencil } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { getCategoriaConfig } from "@/lib/publicar/categorias"
import { CotacaoFrete, LocalizacaoFrete, getDraft, saveDraft } from "@/lib/publicar/storage"

// TODO: substituir por dado real vindo do cadastro do usuário (capturado via GPS no onboarding).
// Aqui o vendedor só confirma ou corrige, não preenche do zero.
function getLocalizacaoDoCadastro(): LocalizacaoFrete {
  return { endereco: "Rua das Bicicletas, 123", cidade: "Igaporã", estado: "BA", cep: "46550-000" }
}

// TODO: substituir pela chamada real à API da transportadora, enviando
// localizacao + peso/altura/largura/comprimento e recebendo o valor e prazo.
async function cotarFrete(): Promise<CotacaoFrete> {
  await new Promise((resolve) => setTimeout(resolve, 900))
  return { transportadora: "Correios PAC", valor_centavos: 2890, prazo_dias: 6 }
}

const PAGADORES = [
  { id: "vendedor", label: "Eu arco com o frete", description: "O valor da transportadora é descontado de você" },
  { id: "comprador", label: "Comprador paga o frete", description: "O valor é somado ao preço na hora da compra" },
  { id: "retirada_local", label: "Retirada no local", description: "Sem envio — combine a retirada com o comprador" },
] as const

export default function FretePage() {
  const params = useParams<{ categoria: string }>()
  const categoria = params.categoria
  const config = getCategoriaConfig(categoria)
  const router = useRouter()

  const [localizacao, setLocalizacao] = useState<LocalizacaoFrete>(getLocalizacaoDoCadastro())
  const [editandoLocalizacao, setEditandoLocalizacao] = useState(false)

  const [peso, setPeso] = useState("")
  const [altura, setAltura] = useState("")
  const [largura, setLargura] = useState("")
  const [comprimento, setComprimento] = useState("")

  const [pagador, setPagador] = useState<(typeof PAGADORES)[number]["id"] | "">("")
  const [cotacao, setCotacao] = useState<CotacaoFrete | null>(null)
  const [buscandoCotacao, setBuscandoCotacao] = useState(false)

  useEffect(() => {
    const draft = getDraft(categoria).frete
    if (!draft) return
    if (draft.localizacao) setLocalizacao(draft.localizacao)
    if (draft.peso_g) setPeso(String(draft.peso_g))
    if (draft.altura_cm) setAltura(String(draft.altura_cm))
    if (draft.largura_cm) setLargura(String(draft.largura_cm))
    if (draft.comprimento_cm) setComprimento(String(draft.comprimento_cm))
    if (draft.pagador) setPagador(draft.pagador)
    if (draft.cotacao) setCotacao(draft.cotacao)
  }, [categoria])

  const dimensoesPreenchidas = Boolean(peso && altura && largura && comprimento)

  async function handleBuscarCotacao() {
    if (!dimensoesPreenchidas) return
    setBuscandoCotacao(true)
    try {
      const resultado = await cotarFrete()
      setCotacao(resultado)
    } finally {
      setBuscandoCotacao(false)
    }
  }

  function handlePagadorChange(id: (typeof PAGADORES)[number]["id"]) {
    setPagador(id)
    if (id !== "vendedor") setCotacao(null)
  }

  const canContinue =
    dimensoesPreenchidas &&
    Boolean(pagador) &&
    (pagador !== "vendedor" || Boolean(cotacao))

  function handleContinue() {
    if (!canContinue) return
    saveDraft(categoria, {
      frete: {
        localizacao,
        peso_g: Number(peso),
        altura_cm: Number(altura),
        largura_cm: Number(largura),
        comprimento_cm: Number(comprimento),
        pagador: pagador || undefined,
        cotacao,
      },
    })
    router.push(`/publicar/${categoria}/preco`)
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link
            href={`/publicar/${categoria}/fotos`}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Voltar
          </Link>
          <span className="text-sm font-semibold">{config?.label ?? "Anúncio"}</span>
          <div className="w-[52px]" />
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 pb-32 pt-6">
        <section className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Frete</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Confirme de onde o produto sai e como ele será entregue.
          </p>
        </section>

        <section className="mb-6">
          <span className="text-sm font-semibold">Local de envio</span>
          {!editandoLocalizacao ? (
            <div className="mt-2 flex items-start justify-between gap-3 rounded-xl border border-border px-4 py-3">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="text-sm">
                  <p className="font-medium">{localizacao.endereco}</p>
                  <p className="text-muted-foreground">
                    {localizacao.cidade} - {localizacao.estado} · {localizacao.cep}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditandoLocalizacao(true)}
                className="flex shrink-0 items-center gap-1 text-xs font-semibold text-primary"
              >
                <Pencil className="size-3.5" />
                Trocar
              </button>
            </div>
          ) : (
            <div className="mt-2 space-y-2 rounded-xl border border-border p-3">
              <input
                value={localizacao.endereco}
                onChange={(e) => setLocalizacao((p) => ({ ...p, endereco: e.target.value }))}
                placeholder="Endereço"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  value={localizacao.cidade}
                  onChange={(e) => setLocalizacao((p) => ({ ...p, cidade: e.target.value }))}
                  placeholder="Cidade"
                  className="col-span-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <input
                  value={localizacao.estado}
                  onChange={(e) => setLocalizacao((p) => ({ ...p, estado: e.target.value.toUpperCase() }))}
                  placeholder="UF"
                  maxLength={2}
                  className="col-span-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <input
                  value={localizacao.cep}
                  onChange={(e) => setLocalizacao((p) => ({ ...p, cep: e.target.value }))}
                  placeholder="CEP"
                  className="col-span-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <button
                type="button"
                onClick={() => setEditandoLocalizacao(false)}
                className="text-xs font-semibold text-primary"
              >
                Confirmar localização
              </button>
            </div>
          )}
        </section>

        <section className="mb-6">
          <span className="text-sm font-semibold">Dimensões da embalagem</span>
          <p className="mt-1 text-xs text-muted-foreground">Usadas para calcular o valor do frete com a transportadora.</p>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs text-muted-foreground">Peso (g)</span>
              <input
                type="number"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                placeholder="Ex.: 12000"
                className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">Altura (cm)</span>
              <input
                type="number"
                value={altura}
                onChange={(e) => setAltura(e.target.value)}
                className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">Largura (cm)</span>
              <input
                type="number"
                value={largura}
                onChange={(e) => setLargura(e.target.value)}
                className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">Comprimento (cm)</span>
              <input
                type="number"
                value={comprimento}
                onChange={(e) => setComprimento(e.target.value)}
                className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
          </div>
        </section>

        <fieldset className="mb-6">
          <legend className="text-sm font-semibold">Quem paga o frete?</legend>
          <div className="mt-2 space-y-2">
            {PAGADORES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handlePagadorChange(item.id)}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                  pagador === item.id ? "border-primary bg-primary/10" : "border-border hover:bg-muted/50"
                }`}
              >
                <span>
                  <span className="block text-sm font-medium">{item.label}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{item.description}</span>
                </span>
                {pagador === item.id && (
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </fieldset>

        {pagador === "vendedor" && (
          <section>
            {!cotacao ? (
              <button
                type="button"
                onClick={handleBuscarCotacao}
                disabled={!dimensoesPreenchidas || buscandoCotacao}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {buscandoCotacao ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Consultando transportadora…
                  </>
                ) : (
                  "Calcular valor do frete"
                )}
              </button>
            ) : (
              <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-4 py-3">
                <div className="text-sm">
                  <p className="font-medium">{cotacao.transportadora}</p>
                  <p className="text-xs text-muted-foreground">Prazo estimado: {cotacao.prazo_dias} dias úteis</p>
                </div>
                <p className="text-sm font-semibold">
                  {(cotacao.valor_centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
              </div>
            )}
          </section>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur-lg">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <button
            type="button"
            onClick={handleContinue}
            disabled={!canContinue}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continuar
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </main>
  )
}