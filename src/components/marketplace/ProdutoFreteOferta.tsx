"use client"

import { useState } from "react"
import { Check, ChevronDown, Loader2, Send, Tag, Truck } from "lucide-react"

const API_URL = "https://imperium-bikes.onrender.com"

interface OpcaoFrete {
  transportadora: string
  servico: string
  prazo_dias: number
  valor: number
}

type TipoOferta = "padrao" | "frete_gratis" | "frete_gratis_desconto" | "desconto_produto"

interface TipoOfertaConfig {
  id: TipoOferta
  titulo: string
  descricao: string
  precisaDesconto: boolean
}

const TIPOS_OFERTA: TipoOfertaConfig[] = [
  {
    id: "padrao",
    titulo: "Comprar como está",
    descricao: "Você paga o produto no preço anunciado, mais o frete calculado.",
    precisaDesconto: false,
  },
  {
    id: "frete_gratis",
    titulo: "Pedir frete grátis",
    descricao: "Propor que o vendedor arque com o frete, sem mexer no preço do produto.",
    precisaDesconto: false,
  },
  {
    id: "frete_gratis_desconto",
    titulo: "Frete grátis + desconto",
    descricao: "Propor que o vendedor arque com o frete e ainda dê um desconto no produto.",
    precisaDesconto: true,
  },
  {
    id: "desconto_produto",
    titulo: "Desconto no produto",
    descricao: "Você paga o frete integral, mas propõe um desconto no valor do produto.",
    precisaDesconto: true,
  },
]

function formatarReal(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function calcularTotais(tipo: TipoOferta, precoProduto: number, valorFrete: number, desconto: number) {
  switch (tipo) {
    case "padrao":
      return { compradorPaga: precoProduto + valorFrete, vendedorRecebe: precoProduto }
    case "frete_gratis":
      return { compradorPaga: precoProduto, vendedorRecebe: precoProduto - valorFrete }
    case "frete_gratis_desconto":
      return {
        compradorPaga: precoProduto - desconto,
        vendedorRecebe: precoProduto - valorFrete - desconto,
      }
    case "desconto_produto":
      return {
        compradorPaga: precoProduto - desconto + valorFrete,
        vendedorRecebe: precoProduto - desconto,
      }
  }
}

interface ProdutoFreteOfertaProps {
  anuncioId: string
  precoProduto: number
  cepOrigemVendedor: string
}

export default function ProdutoFreteOferta({ anuncioId, precoProduto, cepOrigemVendedor }: ProdutoFreteOfertaProps) {
  // Calculadora de frete
  const [cepDestino, setCepDestino] = useState("")
  const [opcoesFrete, setOpcoesFrete] = useState<OpcaoFrete[]>([])
  const [freteSelecionado, setFreteSelecionado] = useState<OpcaoFrete | null>(null)
  const [buscandoFrete, setBuscandoFrete] = useState(false)
  const [erroFrete, setErroFrete] = useState<string | null>(null)

  // Painel de oferta
  const [mostrarOferta, setMostrarOferta] = useState(false)
  const [tipoOferta, setTipoOferta] = useState<TipoOferta>("padrao")
  const [valorDesconto, setValorDesconto] = useState("")
  const [mensagem, setMensagem] = useState("")
  const [enviandoOferta, setEnviandoOferta] = useState(false)
  const [ofertaEnviada, setOfertaEnviada] = useState(false)
  const [erroOferta, setErroOferta] = useState<string | null>(null)

  async function handleCalcularFrete() {
    if (cepDestino.length !== 8) return
    setBuscandoFrete(true)
    setErroFrete(null)
    setFreteSelecionado(null)
    setOpcoesFrete([])
    setMostrarOferta(false)
    setOfertaEnviada(false)

    try {
      const res = await fetch(`${API_URL}/api/frete/cotar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cepOrigem: cepOrigemVendedor.replace(/\D/g, ""),
          cepDestino,
          peso: 12000,
          altura: 30,
          largura: 30,
          comprimento: 60,
        }),
      })

      if (!res.ok) throw new Error(`Erro ${res.status}`)
      const data = await res.json()

      if (!data.opcoes?.length) {
        setErroFrete("Nenhuma transportadora atende esse CEP.")
        return
      }

      setOpcoesFrete(data.opcoes)
      setFreteSelecionado(data.opcoes[0])
    } catch {
      setErroFrete("Não foi possível calcular o frete agora. Confira o CEP e tente de novo.")
    } finally {
      setBuscandoFrete(false)
    }
  }

  const descontoNumero = Number(valorDesconto.replace(",", ".")) || 0
  const valorFreteAtual = freteSelecionado?.valor ?? 0
  const tipoAtual = TIPOS_OFERTA.find((t) => t.id === tipoOferta)!
  const totais = calcularTotais(tipoOferta, precoProduto, valorFreteAtual, descontoNumero)

  const descontoInvalido = tipoAtual.precisaDesconto && (descontoNumero <= 0 || descontoNumero >= precoProduto)
  const podeEnviarOferta = Boolean(freteSelecionado) && !descontoInvalido

  async function handleEnviarOferta() {
    if (!podeEnviarOferta || !freteSelecionado) return
    setEnviandoOferta(true)
    setErroOferta(null)

    try {
      const res = await fetch(`${API_URL}/api/anuncios/${anuncioId}/ofertas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: tipoOferta,
          cepDestino,
          transportadora: freteSelecionado.transportadora,
          valorFrete: freteSelecionado.valor,
          valorDesconto: tipoAtual.precisaDesconto ? descontoNumero : 0,
          valorTotalComprador: totais.compradorPaga,
          mensagem: mensagem.trim() || undefined,
        }),
      })

      if (!res.ok) throw new Error(`Erro ${res.status}`)
      setOfertaEnviada(true)
    } catch {
      setErroOferta("Não foi possível enviar a oferta agora. Tente novamente em instantes.")
    } finally {
      setEnviandoOferta(false)
    }
  }

  return (
    <section className="rounded-xl border border-border p-4">
      {/* Calculadora de frete */}
      <div className="flex items-center gap-2">
        <Truck className="size-4 text-muted-foreground" />
        <span className="text-sm font-semibold">Calcular frete</span>
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={cepDestino}
          onChange={(e) => setCepDestino(e.target.value.replace(/\D/g, "").slice(0, 8))}
          inputMode="numeric"
          placeholder="Seu CEP"
          className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="button"
          onClick={handleCalcularFrete}
          disabled={cepDestino.length !== 8 || buscandoFrete}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {buscandoFrete ? <Loader2 className="size-4 animate-spin" /> : "Calcular"}
        </button>
      </div>

      {erroFrete && <p className="mt-2 text-xs text-destructive">{erroFrete}</p>}

      {opcoesFrete.length > 0 && (
        <div className="mt-3 space-y-2">
          {opcoesFrete.map((opcao, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setFreteSelecionado(opcao)}
              className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition ${
                freteSelecionado?.transportadora === opcao.transportadora
                  ? "border-primary bg-primary/10"
                  : "border-border hover:bg-muted/50"
              }`}
            >
              <span>
                <span className="block text-sm font-medium">{opcao.transportadora}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {opcao.servico} · {opcao.prazo_dias} dias úteis
                </span>
              </span>
              <span className="text-sm font-semibold">{formatarReal(opcao.valor)}</span>
            </button>
          ))}
        </div>
      )}

      {/* Resumo + gatilho pra oferta */}
      {freteSelecionado && (
        <div className="mt-4 border-t border-border pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Produto</span>
            <span>{formatarReal(precoProduto)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Frete</span>
            <span>{formatarReal(freteSelecionado.valor)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-sm font-semibold">
            <span>Total</span>
            <span>{formatarReal(precoProduto + freteSelecionado.valor)}</span>
          </div>

          {!mostrarOferta ? (
            <button
              type="button"
              onClick={() => setMostrarOferta(true)}
              className="mt-3 flex w-full items-center justify-center gap-1.5 text-sm font-semibold text-primary"
            >
              <Tag className="size-3.5" />
              Negociar o frete com o vendedor
              <ChevronDown className="size-3.5" />
            </button>
          ) : (
            <div className="mt-4 space-y-3">
              <span className="text-sm font-semibold">Como você quer propor?</span>

              <div className="space-y-2">
                {TIPOS_OFERTA.map((tipo) => (
                  <button
                    key={tipo.id}
                    type="button"
                    onClick={() => {
                      setTipoOferta(tipo.id)
                      setOfertaEnviada(false)
                    }}
                    className={`flex w-full items-start justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition ${
                      tipoOferta === tipo.id ? "border-primary bg-primary/10" : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <span>
                      <span className="block text-sm font-medium">{tipo.titulo}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{tipo.descricao}</span>
                    </span>
                    {tipoOferta === tipo.id && (
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-3" />
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {tipoAtual.precisaDesconto && (
                <label className="block">
                  <span className="text-xs text-muted-foreground">Desconto que você está pedindo (R$)</span>
                  <input
                    value={valorDesconto}
                    onChange={(e) => setValorDesconto(e.target.value.replace(/[^0-9,]/g, ""))}
                    inputMode="decimal"
                    placeholder="Ex.: 30,00"
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  {descontoInvalido && descontoNumero > 0 && (
                    <p className="mt-1 text-xs text-destructive">O desconto precisa ser menor que o preço do produto.</p>
                  )}
                </label>
              )}

              {/* Resultado da simulação da oferta */}
              <div className="rounded-lg bg-muted/50 px-3 py-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Você pagaria</span>
                  <span className="font-semibold">{formatarReal(Math.max(totais.compradorPaga, 0))}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>O vendedor receberia (estimativa)</span>
                  <span>{formatarReal(Math.max(totais.vendedorRecebe, 0))}</span>
                </div>
              </div>

              <label className="block">
                <span className="text-xs text-muted-foreground">Mensagem para o vendedor (opcional)</span>
                <textarea
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  rows={2}
                  placeholder="Ex.: Posso retirar também, se preferir."
                  className="mt-1 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>

              {erroOferta && <p className="text-xs text-destructive">{erroOferta}</p>}

              {ofertaEnviada ? (
                <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2.5 text-sm font-medium text-primary">
                  <Check className="size-4 shrink-0" />
                  Oferta enviada! O vendedor costuma responder em até 48h.
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleEnviarOferta}
                  disabled={!podeEnviarOferta || enviandoOferta}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {enviandoOferta ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="size-4" />
                      Enviar oferta ao vendedor
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  )
}