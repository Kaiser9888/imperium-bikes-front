"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Check, Loader2, MapPin, Pencil, Truck } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { getCategoriaConfig } from "@/lib/publicar/categorias"
import { CotacaoFrete, LocalizacaoFrete, getDraft, saveDraft } from "@/lib/publicar/storage"

const API_URL = "https://imperium-bikes.onrender.com"

function getLocalizacaoDoCadastro(): LocalizacaoFrete {
  return { endereco: "Rua das Bicicletas, 123", cidade: "Igaporã", estado: "BA", cep: "46550-000" }
}

interface OpcaoFrete {
  transportadora: string
  servico: string
  prazo_dias: number
  valor: number
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
  const [cepDestino, setCepDestino] = useState("")

  const [pagador, setPagador] = useState<(typeof PAGADORES)[number]["id"] | "">("")
  const [opcoesFrete, setOpcoesFrete] = useState<OpcaoFrete[]>([])
  const [cotacaoSelecionada, setCotacaoSelecionada] = useState<OpcaoFrete | null>(null)
  const [buscandoCotacao, setBuscandoCotacao] = useState(false)
  const [erroCotacao, setErroCotacao] = useState<string | null>(null)

  useEffect(() => {
    const draft = getDraft(categoria).frete
    if (!draft) return
    if (draft.localizacao) setLocalizacao(draft.localizacao)
    if (draft.peso_g) setPeso(String(draft.peso_g))
    if (draft.altura_cm) setAltura(String(draft.altura_cm))
    if (draft.largura_cm) setLargura(String(draft.largura_cm))
    if (draft.comprimento_cm) setComprimento(String(draft.comprimento_cm))
    if (draft.pagador) setPagador(draft.pagador)
  }, [categoria])

  const dimensoesPreenchidas = Boolean(
    Number(peso) > 0 &&
    Number(altura) > 0 &&
    Number(largura) > 0 &&
    Number(comprimento) > 0 &&
    cepDestino.trim().length === 8
  )

  async function handleBuscarCotacao() {
    if (!dimensoesPreenchidas) return
    setBuscandoCotacao(true)
    setErroCotacao(null)

    try {
      const res = await fetch(`${API_URL}/api/frete/cotar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cepDestino: cepDestino.replace(/\D/g, ""),
          peso: Number(peso),
          altura: Number(altura),
          largura: Number(largura),
          comprimento: Number(comprimento),
        }),
      })

      if (!res.ok) {
        throw new Error(`Erro ${res.status}`)
      }

      const data = await res.json()
      setOpcoesFrete(data.opcoes || [])
    } catch (err) {
      setErroCotacao("Não foi possível cotar o frete. Verifique o CEP e tente novamente.")
    } finally {
      setBuscandoCotacao(false)
    }
  }

  function handlePagadorChange(id: (typeof PAGADORES)[number]["id"]) {
    setPagador(id)
    if (id !== "vendedor") {
      setCotacaoSelecionada(null)
      setOpcoesFrete([])
    }
  }

  const canContinue = Boolean(
    Number(peso) > 0 &&
    Number(altura) > 0 &&
    Number(largura) > 0 &&
    Number(comprimento) > 0 &&
    pagador &&
    (pagador !== "vendedor" || cotacaoSelecionada)
  )

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
        cotacao: cotacaoSelecionada ? {
          transportadora: cotacaoSelecionada.transportadora,
          valor_centavos: Math.round(cotacaoSelecionada.valor * 100),
          prazo_dias: cotacaoSelecionada.prazo_dias,
        } : undefined,
      },
    })
    router.push(`/publicar/${categoria}/preco`)
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <style>{`
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>

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

        {/* Local de envio */}
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
              <button type="button" onClick={() => setEditandoLocalizacao(true)} className="flex shrink-0 items-center gap-1 text-xs font-semibold text-primary">
                <Pencil className="size-3.5" />
                Trocar
              </button>
            </div>
          ) : (
            <div className="mt-2 space-y-2 rounded-xl border border-border p-3">
              <input value={localizacao.endereco} onChange={(e) => setLocalizacao((p) => ({ ...p, endereco: e.target.value }))} placeholder="Endereço" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              <div className="grid grid-cols-3 gap-2">
                <input value={localizacao.cidade} onChange={(e) => setLocalizacao((p) => ({ ...p, cidade: e.target.value }))} placeholder="Cidade" className="col-span-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                <input value={localizacao.estado} onChange={(e) => setLocalizacao((p) => ({ ...p, estado: e.target.value.toUpperCase() }))} placeholder="UF" maxLength={2} className="col-span-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                <input value={localizacao.cep} onChange={(e) => setLocalizacao((p) => ({ ...p, cep: e.target.value }))} placeholder="CEP" className="col-span-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
              <button type="button" onClick={() => setEditandoLocalizacao(false)} className="text-xs font-semibold text-primary">Confirmar localização</button>
            </div>
          )}
        </section>

        {/* CEP destino */}
        <section className="mb-6">
          <label className="block">
            <span className="text-sm font-semibold">CEP de destino</span>
            <input
              type="text"
              inputMode="numeric"
              value={cepDestino}
              onChange={(e) => setCepDestino(e.target.value.replace(/\D/g, "").slice(0, 8))}
              placeholder="Ex.: 01310100"
              className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
        </section>

        {/* Dimensões */}
        <section className="mb-6">
          <span className="text-sm font-semibold">Dimensões da embalagem</span>
          <p className="mt-1 text-xs text-muted-foreground">Usadas para calcular o valor do frete.</p>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs text-muted-foreground">Peso (g)</span>
              <input type="number" min="1" value={peso} onChange={(e) => setPeso(e.target.value.replace(/[^0-9]/g, ""))} placeholder="Ex.: 12000" className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">Altura (cm)</span>
              <input type="number" min="1" value={altura} onChange={(e) => setAltura(e.target.value.replace(/[^0-9]/g, ""))} className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">Largura (cm)</span>
              <input type="number" min="1" value={largura} onChange={(e) => setLargura(e.target.value.replace(/[^0-9]/g, ""))} className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">Comprimento (cm)</span>
              <input type="number" min="1" value={comprimento} onChange={(e) => setComprimento(e.target.value.replace(/[^0-9]/g, ""))} className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </label>
          </div>
        </section>

        {/* Quem paga */}
        <fieldset className="mb-6">
          <legend className="text-sm font-semibold">Quem paga o frete?</legend>
          <div className="mt-2 space-y-2">
            {PAGADORES.map((item) => (
              <button key={item.id} type="button" onClick={() => handlePagadorChange(item.id)}
                      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                        pagador === item.id ? "border-primary bg-primary/10" : "border-border hover:bg-muted/50"
                      }`}>
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

        {/* Cotação */}
        {pagador === "vendedor" && (
          <section>
            {!opcoesFrete.length && (
              <button type="button" onClick={handleBuscarCotacao} disabled={!dimensoesPreenchidas || buscandoCotacao}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40">
                {buscandoCotacao ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Consultando transportadoras…
                  </>
                ) : (
                  <>
                    <Truck className="size-4" />
                    Calcular valor do frete
                  </>
                )}
              </button>
            )}

            {erroCotacao && (
              <p className="mt-2 text-xs text-destructive">{erroCotacao}</p>
            )}

            {opcoesFrete.length > 0 && (
              <div className="space-y-2">
                {opcoesFrete.map((opcao, index) => (
                  <button key={index} type="button" onClick={() => setCotacaoSelecionada(opcao)}
                          className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                            cotacaoSelecionada?.transportadora === opcao.transportadora
                              ? "border-primary bg-primary/10"
                              : "border-border hover:bg-muted/50"
                          }`}>
                    <span>
                      <span className="block text-sm font-medium">{opcao.transportadora}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {opcao.servico} · {opcao.prazo_dias} dias úteis
                      </span>
                    </span>
                    <span className="text-sm font-semibold">
                      {opcao.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* Botão continuar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur-lg">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <button type="button" onClick={handleContinue} disabled={!canContinue}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40">
            Continuar
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </main>
  )
}