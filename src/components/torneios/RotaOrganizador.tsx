"use client"

import { useRef, useState } from "react"
import { Route, Trash2, Upload } from "lucide-react"

import { distanciasAcumuladas, formatarDistancia, lerGpx, simplificar, subida } from "@/lib/gpx"
import { mensagemDaApi, tournamentService, type PontoRota } from "@/services/tournamentService"

/** Organizador: sobe o GPX do percurso, confere distância e subida e salva (ou tira). */
export function RotaOrganizador({
    torneioId,
    resumo,
    aoMudar,
}: {
    torneioId: string
    resumo: { distanciaM: number; subidaM: number | null } | null
    aoMudar: () => Promise<void>
}) {
    const input = useRef<HTMLInputElement>(null)
    const [previa, setPrevia] = useState<{ pontos: PontoRota[]; distanciaM: number; subidaM: number | null; nome: string } | null>(null)
    const [ocupado, setOcupado] = useState(false)
    const [erro, setErro] = useState<string | null>(null)

    async function escolher(event: React.ChangeEvent<HTMLInputElement>) {
        const arquivo = event.target.files?.[0]
        event.target.value = ""
        if (!arquivo) return
        setErro(null)
        try {
            if (arquivo.size > 15 * 1024 * 1024) throw new Error("Arquivo grande demais (máx. 15 MB).")
            const pontos = simplificar(lerGpx(await arquivo.text()))
            const distancias = distanciasAcumuladas(pontos)
            setPrevia({ pontos, distanciaM: distancias[distancias.length - 1], subidaM: subida(pontos), nome: arquivo.name })
        } catch (cause) {
            setPrevia(null)
            setErro(cause instanceof Error ? cause.message : "Não foi possível ler o arquivo.")
        }
    }

    async function salvar() {
        if (!previa) return
        setOcupado(true)
        setErro(null)
        try {
            await tournamentService.salvarRota(torneioId, previa.pontos)
            setPrevia(null)
            await aoMudar()
        } catch (cause) {
            setErro(mensagemDaApi(cause, "Não foi possível salvar o percurso."))
        } finally {
            setOcupado(false)
        }
    }

    async function remover() {
        if (!window.confirm("Tirar o percurso da página do evento?")) return
        setOcupado(true)
        setErro(null)
        try {
            await tournamentService.removerRota(torneioId)
            await aoMudar()
        } catch (cause) {
            setErro(mensagemDaApi(cause, "Não foi possível tirar o percurso."))
        } finally {
            setOcupado(false)
        }
    }

    return (
        <section aria-labelledby="rota-titulo" className="mt-12">
            <h2 id="rota-titulo" className="type-h2">Percurso</h2>
            <p className="type-body-small mt-1 text-muted-foreground">
                Envie o arquivo GPX do trajeto (Strava, Garmin, Komoot ou Wikiloc exportam). A página do evento mostra o mapa, a distância e a altimetria.
            </p>

            {resumo && !previa && (
                <p className="type-body-small mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-foreground">
                    <Route className="size-4 text-primary" aria-hidden="true" />
                    Publicado: <strong className="tabular-nums">{formatarDistancia(resumo.distanciaM)}</strong>
                    {resumo.subidaM != null && <span className="tabular-nums text-muted-foreground">· {resumo.subidaM.toLocaleString("pt-BR")} m de subida</span>}
                </p>
            )}

            {previa && (
                <div className="mt-3 rounded-lg border border-primary/30 bg-primary/5 px-3 py-3">
                    <p className="type-label text-foreground">{previa.nome}</p>
                    <p className="type-body-small mt-1 tabular-nums text-muted-foreground">
                        {formatarDistancia(previa.distanciaM)}
                        {previa.subidaM != null ? ` · ${previa.subidaM.toLocaleString("pt-BR")} m de subida` : " · sem altitude no arquivo"}
                    </p>
                    <div className="mt-3 flex gap-2">
                        <button type="button" onClick={salvar} disabled={ocupado} className="line-btn line-btn--sm">
                            {ocupado ? "Salvando…" : resumo ? "Trocar o percurso" : "Publicar percurso"}
                        </button>
                        <button type="button" onClick={() => setPrevia(null)} className="line-btn line-btn--sm line-btn--muted">
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" onClick={() => input.current?.click()} disabled={ocupado} className="line-btn line-btn--sm">
                    <Upload aria-hidden="true" />
                    {resumo ? "Enviar outro GPX" : "Enviar GPX"}
                </button>
                {resumo && !previa && (
                    <button type="button" onClick={remover} disabled={ocupado} className="line-btn line-btn--sm line-btn--danger">
                        <Trash2 aria-hidden="true" />
                        Tirar percurso
                    </button>
                )}
                <input ref={input} type="file" accept=".gpx,application/gpx+xml,application/xml,text/xml" className="sr-only" onChange={escolher} tabIndex={-1} aria-hidden="true" />
            </div>
            {erro && (
                <p role="alert" className="type-body-small mt-3 border-l-2 border-destructive pl-3 text-destructive">
                    {erro}
                </p>
            )}
        </section>
    )
}
