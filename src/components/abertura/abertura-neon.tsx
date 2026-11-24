"use client"

import { useEffect, useRef, useState } from "react"

import s from "./abertura-neon.module.css"

/** Quando a TV começa a "desligar" (a orca já assentou no centro). */
const INICIO_SAIDA = 1500
/** Quanto dura o desligar (linha branca que vira ponto) até aparecer o app. */
const DURACAO_SAIDA = 600
/** Saída rápida quando a pessoa toca na tela. */
const DURACAO_PULO = 200

/**
 * Abertura do app com cara de TV de tubo dos anos 80: a tela liga, a orca (cores
 * do logo, contorno amarelo suave) chega num arco e assenta no centro; então a TV
 * "desliga" (linha branca que vira ponto) e aparece o app. Cerca de 2,1 s; tocar pula.
 */
export function AberturaNeon({
    onFim,
    noCarregamento = false,
}: {
    onFim?: () => void
    /** Tela de carregamento do app: já está tocando desde o HTML; conta o tempo desde lá */
    noCarregamento?: boolean
}) {
    const [fase, setFase] = useState<"" | "saindo" | "pulando">("")
    const acabou = useRef(false)

    const sair = (fase: "saindo" | "pulando", duracao: number) => {
        if (acabou.current) return
        acabou.current = true
        setFase(fase)
        window.setTimeout(() => onFim?.(), duracao)
    }

    useEffect(() => {
        const calmo = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        // No carregamento a orca começou antes do React: desconta o tempo que já passou
        // (se o app demorou mais que o arco, sai na hora; a orca ficou flutuando esperando)
        const inicio = (window as { __aberturaInicio?: number }).__aberturaInicio
        const passou = noCarregamento && inicio != null ? performance.now() - inicio : 0
        const espera = Math.max(0, (calmo ? 800 : INICIO_SAIDA) - passou)
        const t = window.setTimeout(() => sair("saindo", DURACAO_SAIDA), espera)
        return () => window.clearTimeout(t)
        // eslint-disable-next-line react-hooks/exhaustive-deps -- roda uma vez por montagem
    }, [])

    return (
        <div
            className={`${s.raiz} ${noCarregamento ? s.carregamento : ""} ${fase ? s[fase] : ""}`}
            onClick={() => sair("pulando", DURACAO_PULO)}
            role="presentation"
            aria-hidden="true"
        >
            <div className={s.tela}>
                <div className={s.palco}>
                    {/* Movimento em três camadas (avanço, subida, giro), cada uma com a sua curva */}
                    <div className={s.avanco}>
                        <div className={s.subida}>
                            <div className={s.giro}>
                                <div className={s.corpo} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={s.crt} />
        </div>
    )
}
