// lib/stream.ts
"use client"

import { useEffect, useState } from "react"
import { StreamChat } from "stream-chat"
import axios from "axios"
import { useUser } from "@clerk/nextjs"
import api from "@/lib/api"

const API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY

// Evita conectar duas vezes (React StrictMode roda o effect 2x em dev)
let conexao: Promise<StreamChat> | null = null

async function buscarToken() {
  // Backend devolve: { userId, token, name?, image? }
  const { data } = await api.post("/api/chat/token")
  return data as { userId: string; token: string; name?: string; image?: string }
}

function conectar(fallback: { name?: string | null; image?: string | null }): Promise<StreamChat> {
  if (conexao) return conexao

  conexao = (async () => {
    if (!API_KEY) throw new Error("NEXT_PUBLIC_STREAM_API_KEY não configurada")

    const client = StreamChat.getInstance(API_KEY)
    const inicial = await buscarToken()

    if (client.userID === inicial.userId) return client
    if (client.userID) await client.disconnectUser()

    // Usa o token que já buscamos e, quando expirar, busca outro
    let primeiro: string | null = inicial.token
    const tokenProvider = async () => {
      if (primeiro) {
        const t = primeiro
        primeiro = null
        return t
      }
      return (await buscarToken()).token
    }

    await client.connectUser(
      {
        id: inicial.userId,
        name: inicial.name ?? fallback.name ?? "Usuário",
        image: inicial.image ?? fallback.image ?? undefined,
      },
      tokenProvider,
    )
    return client
  })()

  conexao.catch(() => {
    conexao = null
  })
  return conexao
}

/** Chame ao fazer logout para desconectar do Stream */
export async function desconectarStream() {
  conexao = null
  if (!API_KEY) return
  await StreamChat.getInstance(API_KEY).disconnectUser()
}

export function useStreamClient() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [client, setClient] = useState<StreamChat | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    let cancelado = false

    conectar({ name: user?.fullName, image: user?.imageUrl })
      .then((c) => {
        if (!cancelado) setClient(c)
      })
      .catch((e) => {
        console.error("[Stream] erro ao conectar:", e)
        if (!cancelado) setErro("Não foi possível conectar ao chat.")
      })

    return () => {
      cancelado = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, user?.id])

  return { client, erro }
}

/**
 * Abre (ou cria) a conversa com outro usuário e devolve o id do canal.
 * O backend cria o canal no Stream com os dois membros.
 */
export async function iniciarConversa(
  otherUserId: string,
  produtoId: string | undefined,
  getToken: () => Promise<string | null>,
): Promise<string> {
  const token = await getToken()
  if (!token) throw new Error("Sua sessão expirou. Entre novamente para falar com o vendedor.")

  try {
    const { data } = await api.post(
      "/api/chat/start",
      { otherUserId, produtoId },
      { headers: { Authorization: `Bearer ${token}` } },
    )
    const channelId = data?.channelId ?? data?.channel_id ?? data?.channel?.id ?? data?.id
    if (typeof channelId !== "string" || !channelId.trim()) {
      throw new Error("A API de chat não retornou o identificador da conversa.")
    }
    return channelId
  } catch (cause) {
    if (axios.isAxiosError(cause)) {
      const body = cause.response?.data as { message?: unknown; traceId?: unknown } | undefined
      const message = typeof body?.message === "string" ? body.message : cause.message
      const traceId = typeof body?.traceId === "string" ? ` (referência: ${body.traceId})` : ""
      throw new Error(`${message}${traceId}`)
    }
    throw cause
  }
}
