"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Check, Loader2, MapPin, Pencil, Truck } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { getCategoriaConfig } from "@/lib/publicar/categorias"
import { LocalizacaoFrete, getDraft, saveDraft } from "@/lib/publicar/storage"

const API_URL = "https://imperium-bikes.onrender.com"

interface OpcaoFreteSimulada {
  transportadora: string
  servico: string
  prazo_dias: number
  valor: number
}

const PAGADORES = [
  {
    id: "vendedor",
    label: "Eu arco com o frete",
    description: "O valor é calculado no fechamento da compra e descontado de você",
  },
  {
    id: "comprador",
    label: "Comprador paga o frete",
    description: "O valor é calculado no fechamento da compra e somado ao preço",
  },
  {
    id: "retirada_local",
    label: "Retirada no local",
    description: "Sem envio — combine a retirada com o comprador",
  },
] as const

export default function FretePage() {
  const params = useParams<{ categoria: string }>()
  const categoria = params.categoria
  const config = getCategoriaConfig(categoria)
  const router = useRouter()
  const { getToken, isSignedIn } = useAuth()

  const [localizacao, setLocalizacao] = useState<LocalizacaoFrete>({
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
  })
  const [editandoLocalizacao, setEditandoLocalizacao] = useState(true)
  const [buscandoCep, setBuscandoCep] = useState(false)
  const [erroCep, setErroCep] = useState<string | null>(null)

  const [peso, setPeso] = useState("")
  const [altura, setAltura] = useState("")
  const [largura, setLargura] = useState("")
  const [comprimento, setComprimento] = useState("")

  const [pagador, setPagador] = useState<(typeof PAGADORES)[number]["id"] | "">("")

  const [mostrarSimulador, setMostrarSimulador] = useState(false)
  const [cepSimulacao, setCepSimulacao] = useState("")
  const [opcoesSimuladas, setOpcoesSimuladas] = useState<OpcaoFreteSimulada[]>([])
  const [simulando, setSimulando] = useState(false)
  const [erroSimulacao, setErroSimulacao] = useState<string | null>(null)

  // Carrega rascunho salvo
  useEffect(() => {
    const draft = getDraft(categoria).frete
    if (draft?.localizacao) {
      setLocalizacao(draft.localizacao)
      if (draft.localizacao.cep.length === 8) setEditandoLocalizacao(false)
    }
    if (draft?.peso_g) setPeso(String(draft.peso_g))
    if (draft?.altura_cm) setAltura(String(draft.altura_cm))
    if (draft?.largura_cm) setLargura(String(draft.largura_cm))
    if (draft?.comprimento_cm) setComprimento(String(draft.comprimento_cm))
    if (draft?.pagador) setPagador(draft.pagador)
  }, [categoria])

  // Busca CEP do usuário no backend (quando logado)
  useEffect(() => {
    if (!isSignedIn) return

    async function buscarCepDoUsuario() {
      try {
        const token = await getToken()
        if (!token) return

        const res = await fetch(`${API_URL}/api/users/me`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        })
        if (!res.ok) return

        const data = await res.json()
        if (data.cep && data.cep.replace(/\D/g, "").length === 8) {
          setLocalizacao({
            endereco: data.endereco || "",
            cidade: data.cidade || "",
            estado: data.estado || "",
            cep: data.cep.replace(/\D/g, ""),
          })
          setEditandoLocalizacao(false)
        }
      } catch {
        // Silencioso - o usuário preenche manualmente
      }
    }

    void buscarCepDoUsuario()
  }, [isSignedIn, getToken])

  // Autopreenche endereço a partir do CEP (ViaCEP)
  async function handleCepChange(valorDigitado: string) {
    const cepLimpo = valorDigitado.replace(/\D/g, "").slice(0, 8)
    setLocalizacao((p) => ({ ...p, cep: cepLimpo }))
    setErroCep(null)

    if (cepLimpo.length !== 8) return

    setBuscandoCep(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      const data = await res.json()

      if (data.erro) {
        setErroCep("CEP não encontrado. Confira o número e tente de novo.")
        return
      }

      setLocalizacao((p) => ({
        ...p,
        endereco: [data.logradouro, data.bairro].filter(Boolean).join(", ") || p.endereco,
        cidade: data.localidade || p.cidade,
        estado: data.uf || p.estado,
        cep: cepLimpo,
      }))
    } catch {
      setErroCep("Não foi possível buscar o CEP agora. Você pode preencher manualmente.")
    } finally {
      setBuscandoCep(false)
    }
  }

  function handlePagadorChange(id: (typeof PAGADORES)[number]["id"]) {
    setPagador(id)
  }

  const dimensoesPreenchidas = Boolean(
    Number(peso) > 0 && Number(altura) > 0 && Number(largura) > 0 && Number(comprimento) > 0
  )

  const localizacaoPreenchida = Boolean(
    localizacao.cep.length === 8 &&
    localizacao.cidade &&
    localizacao.estado
  )

  async function handleSimularFrete() {
    if (!dimensoesPreenchidas || cepSimulacao.length !== 8) return
    setSimulando(true)
    setErroSimulacao(null)

    try {
      const res = await fetch(`${API_URL}/api/frete/cotar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cepOrigem: localizacao.cep.replace(/\D/g, ""),
          cepDestino: cepSimulacao,
          peso: Number(peso),
          altura: Number(altura),
          largura: Number(largura),
          comprimento: Number(comprimento),
        }),
      })

      if (!res.ok) throw new Error(`Erro ${res.status}`)

      const data = await res.json()

      // Valida se data.opcoes existe e é array
      if (!Array.isArray(data.opcoes)) {
        setErroSimulacao("Resposta inválida do servidor. Tente novamente.")
        setOpcoesSimuladas([])
        return
      }

      setOpcoesSimuladas(data.opcoes)
      if (data.opcoes.length === 0) {
        setErroSimulacao("Nenhuma transportadora atende esse CEP. Tente outro CEP de exemplo.")
      }
    } catch {
      setErroSimulacao("Não foi possível simular agora. Confira o CEP e tente novamente.")
      setOpcoesSimuladas([])
    } finally {
      setSimulando(false)
    }
  }

  const canContinue = Boolean(
    localizacaoPreenchida &&
    Number(peso) > 0 &&
    Number(altura) > 0 &&
    Number(largura) > 0 &&
    Number(comprimento) > 0 &&
    pagador
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
            Confirme de onde o produto sai, as dimensões do pacote e quem paga o envio.
          </p>
        </section>

        {/* Local de envio */}
        <section className="mb-6">
          <span className="text-sm font-semibold">Local de envio</span>
          {!editandoLocalizacao && localizacaoPreenchida ? (
            <div className="mt-2 flex items-start justify-between gap-3 rounded-xl border border-border px-4 py-3">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="text-sm">
                  <p className="font-medium">{localizacao.endereco || "Endereço não informado"}</p>
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
              <label className="block">
                <span className="text-xs text-muted-foreground">CEP de origem</span>
                <div className="relative mt-1">
                  <input
                    value={localizacao.cep}
                    onChange={(e) => handleCepChange(e.target.value)}
                    inputMode="numeric"
                    placeholder="Ex.: 46550000"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  {buscandoCep && (
                    <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                  )}
                </div>
                {erroCep && <p className="mt-1 text-xs text-destructive">{erroCep}</p>}
                {!erroCep && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Digite o CEP e o endereço é preenchido automaticamente.
                  </p>
                )}
              </label>
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
                  className="col-span-2 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <input
                  value={localizacao.estado}
                  onChange={(e) => setLocalizacao((p) => ({ ...p, estado: e.target.value.toUpperCase() }))}
                  placeholder="UF"
                  maxLength={2}
                  className="col-span-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (localizacaoPreenchida) {
                    setEditandoLocalizacao(false)
                  } else {
                    setErroCep("Preencha o CEP corretamente antes de continuar.")
                  }
                }}
                className="text-xs font-semibold text-primary"
              >
                Confirmar localização
              </button>
            </div>
          )}
        </section>

        {/* Dimensões */}
        <section className="mb-6">
          <span className="text-sm font-semibold">Dimensões da embalagem</span>
          <p className="mt-1 text-xs text-muted-foreground">
            Usadas para calcular o frete quando alguém comprar o produto.
          </p>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs text-muted-foreground">Peso (g)</span>
              <input
                type="number"
                min="1"
                value={peso}
                onChange={(e) => setPeso(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="Ex.: 12000"
                className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">Altura (cm)</span>
              <input
                type="number"
                min="1"
                value={altura}
                onChange={(e) => setAltura(e.target.value.replace(/[^0-9]/g, ""))}
                className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">Largura (cm)</span>
              <input
                type="number"
                min="1"
                value={largura}
                onChange={(e) => setLargura(e.target.value.replace(/[^0-9]/g, ""))}
                className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">Comprimento (cm)</span>
              <input
                type="number"
                min="1"
                value={comprimento}
                onChange={(e) => setComprimento(e.target.value.replace(/[^0-9]/g, ""))}
                className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
          </div>
        </section>



        {/* Quem paga */}
        <fieldset className="mb-4">
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

        {pagador && pagador !== "retirada_local" && (
          <section className="flex items-start gap-2 rounded-xl bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
            <Truck className="mt-0.5 size-4 shrink-0" />
            <p>
              O valor exato do frete é calculado automaticamente quando alguém for comprar, com base no CEP
              informado pelo comprador. A simulação acima é só uma referência.
            </p>
          </section>
        )}
      </div>

      {/* Botão continuar */}
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