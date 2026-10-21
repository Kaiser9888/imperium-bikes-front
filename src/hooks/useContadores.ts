"use client"

import { useEffect, useSyncExternalStore } from "react"
import { useAuth } from "@clerk/nextjs"

import api from "@/lib/api"

/** Não lidas: notificações e mensagens do chat. Uma busca só para a página inteira. */
export type Contadores = { notificacoes: number; mensagens: number }

const ZERO: Contadores = { notificacoes: 0, mensagens: 0 }
const INTERVALO_MS = 60_000
/** Dispare depois de ler notificações ou abrir uma conversa para o selo atualizar na hora. */
export const ATUALIZAR_CONTADORES = "imperium:contadores"

let atual = ZERO
let assinantes = 0
let timer: number | null = null
const ouvintes = new Set<() => void>()

async function buscar() {
    // Aba escondida não gasta requisição; ao voltar, o "visibilitychange" busca de novo
    if (document.visibilityState !== "visible") return
    const [n, m] = await Promise.allSettled([
        api.get("/api/notifications/unread/count"),
        api.get("/api/chat/unread"),
    ])
    const novo = {
        notificacoes: n.status === "fulfilled" ? Number(n.value.data?.count ?? 0) : atual.notificacoes,
        mensagens: m.status === "fulfilled" ? Number(m.value.data?.count ?? 0) : atual.mensagens,
    }
    if (novo.notificacoes !== atual.notificacoes || novo.mensagens !== atual.mensagens) {
        atual = novo
        ouvintes.forEach((avisar) => avisar())
    }
}

function iniciar() {
    assinantes++
    if (assinantes > 1) return
    void buscar()
    timer = window.setInterval(buscar, INTERVALO_MS)
    document.addEventListener("visibilitychange", buscar)
    window.addEventListener(ATUALIZAR_CONTADORES, buscar)
}

function parar() {
    assinantes--
    if (assinantes > 0) return
    if (timer) window.clearInterval(timer)
    timer = null
    document.removeEventListener("visibilitychange", buscar)
    window.removeEventListener(ATUALIZAR_CONTADORES, buscar)
}

function assinar(avisar: () => void) {
    ouvintes.add(avisar)
    return () => ouvintes.delete(avisar)
}

export function useContadores(): Contadores {
    const { isSignedIn } = useAuth()

    useEffect(() => {
        if (!isSignedIn) return
        iniciar()
        return parar
    }, [isSignedIn])

    const valor = useSyncExternalStore(assinar, () => atual, () => ZERO)
    return isSignedIn ? valor : ZERO
}

export function atualizarContadores() {
    window.dispatchEvent(new Event(ATUALIZAR_CONTADORES))
}

/** "9+" acima de 9; vazio quando zero. */
export function rotuloContador(n: number): string {
    return n <= 0 ? "" : n > 9 ? "9+" : String(n)
}
