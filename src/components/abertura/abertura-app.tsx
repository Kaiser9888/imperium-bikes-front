"use client"

import { useState, useSyncExternalStore } from "react"

import { AberturaNeon } from "./abertura-neon"

/** Marca no <html> posta pelo script de SCRIPT_ABERTURA: esta abertura deve tocar. */
const ATRIBUTO = "data-abertura"

/**
 * Roda antes da página pintar: só no app instalado (PWA) e uma vez por abertura
 * (sessionStorage zera quando o app é fechado). Marca o <html>, e o CSS cobre a tela
 * de preto até a animação montar, para o conteúdo não piscar entre o splash e a orca.
 */
export const SCRIPT_ABERTURA = `try{var a=matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;if(a&&!sessionStorage.getItem("abertura-vista")){sessionStorage.setItem("abertura-vista","1");document.documentElement.setAttribute("${ATRIBUTO}","")}}catch(e){}`

/** Toca a abertura quando o script marcou o <html>; depois some e não volta até reabrir o app. */
export function AberturaApp() {
    // Lê a marca só no navegador (no servidor é sempre false), sem divergir na hidratação
    const marcado = useSyncExternalStore(
        nada,
        () => document.documentElement.hasAttribute(ATRIBUTO),
        () => false,
    )
    const [acabou, setAcabou] = useState(false)
    if (!marcado || acabou) return null
    return (
        <AberturaNeon
            onFim={() => {
                setAcabou(true)
                document.documentElement.removeAttribute(ATRIBUTO)
            }}
        />
    )
}

const nada = () => () => {}
