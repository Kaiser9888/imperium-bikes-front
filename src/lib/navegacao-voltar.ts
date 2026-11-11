"use client"

import { useEffect } from "react"

/*
  Saber se a página atual foi aberta pelo botão voltar/avançar do navegador (popstate) ou por um
  clique. O ouvinte fica no layout raiz, montado desde o começo, porque o popstate dispara antes
  de a página nova montar.
*/
let ultimoVoltar: { caminho: string; em: number } | null = null

/** Montar uma vez no layout raiz. */
export function OuvirVoltar() {
    useEffect(() => {
        const marcar = () => {
            ultimoVoltar = { caminho: window.location.pathname, em: Date.now() }
        }
        window.addEventListener("popstate", marcar)
        return () => window.removeEventListener("popstate", marcar)
    }, [])
    return null
}

/** Esta página chegou pelo voltar/avançar do navegador (agora há pouco)? */
export function chegouPeloVoltar(caminho: string): boolean {
    return !!ultimoVoltar && ultimoVoltar.caminho === caminho && Date.now() - ultimoVoltar.em < 3000
}
