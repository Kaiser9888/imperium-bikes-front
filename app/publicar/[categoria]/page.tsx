"use client"

import { Fragment, useState } from "react"
import { notFound, useParams, useRouter } from "next/navigation"
import { X } from "lucide-react"

import { BackButton } from "@/components/ui/back-button"
import { nomeDaCategoria, readDraft, startDraft } from "@/lib/publicar/categorias"
import {
  PERGUNTAS,
  opcoesDe,
  respondida,
  textoDaResposta,
  visivel,
  type Opcao,
  type Pergunta,
  type Respostas,
} from "@/lib/publicar/perguntas"

/** Primeira etapa do publicar, igual para todas as categorias: as perguntas vêm de lib/publicar/perguntas.ts. */
export default function ClassificarPage() {
  const { categoria } = useParams<{ categoria: string }>()
  const router = useRouter()
  const config = PERGUNTAS[categoria]

  // Voltando da etapa 2, as escolhas continuam lá; "Novo anúncio" (?novo=1) começa do zero.
  // (A tela só monta no navegador: o GateRecebimentos do layout carrega antes.)
  const [respostas, setRespostas] = useState<Respostas>(() => {
    if (!config || typeof window === "undefined" || new URLSearchParams(window.location.search).has("novo")) return {}
    const rascunho = readDraft(categoria)
    const salvas: Respostas = {}
    for (const p of config.secoes.flatMap((s) => s.perguntas)) {
      if (typeof rascunho[p.chave] === "string") salvas[p.chave] = rascunho[p.chave] as string
    }
    return salvas
  })
  const [aberta, setAberta] = useState(0)

  if (!config) notFound()

  // Seção sem pergunta que valha (ex.: tamanho de um GPS) não aparece
  const secoes = config.secoes.filter((s) => s.perguntas.some((p) => visivel(p, respostas)))
  const secaoPronta = (i: number) => secoes[i].perguntas.every((p) => respondida(p, respostas))
  // Uma seção só abre depois que as anteriores estão completas
  const liberada = (i: number) => secoes.slice(0, i).every((_, j) => secaoPronta(j))
  const tudoPronto = secoes.every((_, i) => secaoPronta(i))

  const resumoDe = (p: Pergunta) => {
    const texto = textoDaResposta(p, respostas)
    return texto && p.resumo ? p.resumo(texto) : texto
  }

  const resumo = secoes
    .flatMap((s) => s.perguntas)
    .map(resumoDe)
    .filter(Boolean)
    .join(" · ")

  function responder(p: Pergunta, valor: string) {
    setRespostas((atual) => {
      const nova = { ...atual, [p.chave]: valor }
      for (const chave of p.limpa ?? []) nova[chave] = ""
      return nova
    })
  }

  function continuar() {
    if (!tudoPronto) return
    // Pergunta escondida não vale (ex.: shock de uma bike que não é full suspension)
    const finais: Respostas = {}
    for (const p of config.secoes.flatMap((s) => s.perguntas)) {
      finais[p.chave] = visivel(p, respostas) ? (respostas[p.chave] ?? "").trim() : ""
    }
    startDraft(categoria, finais)
    // Sem o ?novo=1 no histórico: o "voltar" do celular reabre esta tela com as escolhas
    window.history.replaceState(window.history.state, "", `/publicar/${categoria}`)
    router.push(`/publicar/${categoria}/informacoes`)
  }

  return (
    <main className="imperium-page">
      <header className="publish-header">
        <BackButton href="/vendedor" />

        <strong>{nomeDaCategoria(categoria)}</strong>

        <button type="button" className="publish-cancel" onClick={() => router.push("/vendedor")}>
          <X />
          Cancelar
        </button>
      </header>

      <div className="classification-layout">
        <section className="classification-intro" aria-labelledby="page-title">
          <p className="eyebrow">Etapa 1 de 6</p>

          <h1 id="page-title">{config.titulo}</h1>

          <p>Escolha as características principais. Elas aparecem na ficha do anúncio e ajudam quem procura.</p>

          <div className="publish-progress" aria-label="Etapa 1 de 6">
            <span style={{ width: "17%" }} />
          </div>
        </section>

        <section className="steps-panel" aria-label="Classificação">
          {secoes.map((secao, i) => {
            const pronta = secaoPronta(i)
            const pode = liberada(i)
            const ativa = aberta === i && pode
            const escolhas = secao.perguntas.map(resumoDe).filter(Boolean).join(" · ")
            const perguntas = secao.perguntas.filter((p) => visivel(p, respostas))

            return (
              <div
                key={secao.titulo}
                className={`step-block ${ativa ? "step-block-active" : ""} ${pode ? "" : "step-block-locked"}`}
              >
                <button
                  type="button"
                  className="step-heading"
                  onClick={() => pode && setAberta(i)}
                  disabled={!pode}
                  aria-expanded={ativa}
                >
                  <span className="step-number">{String(i + 1).padStart(2, "0")}</span>

                  <span className="step-heading-copy">
                    <strong>{secao.titulo}</strong>
                    <small>{escolhas || secao.dica}</small>
                  </span>

                  {pronta && escolhas ? <span className="step-status">Concluído</span> : null}
                </button>

                {ativa ? (
                  <div className="step-content">
                    {perguntas.map((p, k) => (
                      <Fragment key={p.chave}>
                        <CampoPergunta
                          pergunta={p}
                          respostas={respostas}
                          espaco={k > 0}
                          onEscolher={(valor) => responder(p, valor)}
                        />
                        {p.aviso?.(respostas) ? <p className="field-note">{p.aviso(respostas)}</p> : null}
                      </Fragment>
                    ))}

                    {i < secoes.length - 1 ? (
                      <button
                        type="button"
                        className="text-action"
                        disabled={!pronta}
                        onClick={() => setAberta(i + 1)}
                      >
                        Continuar para {secoes[i + 1].titulo.toLowerCase()} <span aria-hidden="true">→</span>
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            )
          })}
        </section>

        <aside className="classification-summary" aria-live="polite">
          <div>
            <p className="summary-label">Sua classificação</p>
            <p className={`summary-value ${resumo ? "" : "summary-placeholder"}`}>
              {resumo || "As escolhas aparecerão aqui"}
            </p>
          </div>

          <div className="summary-actions">
            <button type="button" className="primary-action" disabled={!tudoPronto} onClick={continuar}>
              Continuar
            </button>
          </div>
        </aside>
      </div>
    </main>
  )
}

function CampoPergunta({
  pergunta,
  respostas,
  espaco,
  onEscolher,
}: {
  pergunta: Pergunta
  respostas: Respostas
  espaco: boolean
  onEscolher: (valor: string) => void
}) {
  const rotulo = `${pergunta.titulo}${pergunta.opcional ? " (opcional)" : ""}`
  const classeRotulo = `field-label ${espaco ? "field-label-spaced" : ""}`

  if (pergunta.numero) {
    return (
      <div className="field-group">
        <label className={classeRotulo} htmlFor={pergunta.chave}>
          {pergunta.titulo} em {pergunta.numero.unidade}
          {pergunta.opcional ? " (opcional)" : ""}
        </label>
        <input
          id={pergunta.chave}
          type="number"
          min="1"
          inputMode="numeric"
          placeholder={pergunta.numero.placeholder}
          value={respostas[pergunta.chave] ?? ""}
          onChange={(e) => onEscolher(e.target.value)}
        />
      </div>
    )
  }

  const opcoes = opcoesDe(pergunta, respostas)
  const cartao = (o: Opcao) => (
    <button
      key={o.id}
      type="button"
      className={`choice-card ${respostas[pergunta.chave] === o.id ? "choice-card-selected" : ""}`}
      aria-pressed={respostas[pergunta.chave] === o.id}
      onClick={() => onEscolher(o.id)}
    >
      <span className="choice-card-label">{o.label}</span>
      {o.descricao ? <span className="choice-card-description">{o.descricao}</span> : null}
    </button>
  )

  // Lista longa com grupos (peças, serviços): cartões menores sob cada grupo
  const grupos = [...new Set(opcoes.map((o) => o.grupo).filter(Boolean))] as string[]
  if (grupos.length > 0) {
    return (
      <>
        <p className={classeRotulo}>{rotulo}</p>
        {grupos.map((grupo) => (
          <div key={grupo} className="choice-group" role="group" aria-label={grupo}>
            <p className="choice-group-title">{grupo}</p>
            <div className="choice-grid choice-grid-compact">
              {opcoes.filter((o) => o.grupo === grupo).map(cartao)}
            </div>
          </div>
        ))}
      </>
    )
  }

  // Opções curtas (aro, tamanho) cabem lado a lado
  const curtas = opcoes.every((o) => o.label.length <= 6)

  return (
    <>
      <p className={classeRotulo}>{rotulo}</p>
      <div className={`choice-grid ${curtas ? "choice-grid-sizes" : "choice-grid-types"}`}>{opcoes.map(cartao)}</div>
    </>
  )
}
