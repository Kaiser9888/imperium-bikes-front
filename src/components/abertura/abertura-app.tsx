"use client"

import { useState, useSyncExternalStore } from "react"

import { AberturaNeon } from "./abertura-neon"

/** Marca no <html> posta pelo script de SCRIPT_ABERTURA: esta abertura deve tocar. */
const ATRIBUTO = "data-abertura"

/**
 * Roda antes da página pintar: só no app instalado (PWA) e uma vez por abertura
 * (sessionStorage zera quando o app é fechado). Marca o <html> (o CSS então mostra a
 * orca, que já vem no HTML) e guarda a hora em que a abertura começou.
 */
export const SCRIPT_ABERTURA = `try{var a=matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;if(a&&!sessionStorage.getItem("abertura-vista")){sessionStorage.setItem("abertura-vista","1");window.__aberturaInicio=performance.now();document.documentElement.setAttribute("${ATRIBUTO}","")}}catch(e){}`

/**
 * A abertura É a tela de carregamento: vem pronta no HTML do servidor e toca só com
 * CSS enquanto o app carrega. Quando o React assume (app pronto), ela sai — esperando
 * a orca terminar o arco, se o carregamento foi mais rápido que isso.
 */
export function AberturaApp() {
    // No servidor é sempre true (a marcação vai no HTML, escondida pelo CSS sem a marca);
    // no navegador, sem a marca (site comum ou já vista) ela sai logo após hidratar
    const marcado = useSyncExternalStore(
        nada,
        () => document.documentElement.hasAttribute(ATRIBUTO),
        () => true,
    )
    const [acabou, setAcabou] = useState(false)
    if (!marcado || acabou) return null
    return (
        <AberturaNeon
            noCarregamento
            onFim={() => {
                setAcabou(true)
                document.documentElement.removeAttribute(ATRIBUTO)
            }}
        />
    )
}

const nada = () => () => {}
