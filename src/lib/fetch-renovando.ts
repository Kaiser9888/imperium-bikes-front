/** Sessão do Clerk no navegador (a mesma que o interceptor do axios usa em src/lib/api.ts). */
type Sessao = { getToken(opcoes?: { skipCache?: boolean }): Promise<string | null> }

function sessaoClerk(): Sessao | undefined {
    if (typeof window === "undefined") return undefined
    return (window as unknown as { Clerk?: { session?: Sessao } }).Clerk?.session
}

/** Tempo da nova tentativa: o sinal original (AbortSignal.timeout) pode já estar perto de vencer. */
const TIMEOUT_NOVA_TENTATIVA_MS = 10_000

/**
 * fetch igual ao normal, mas numa chamada com token que volta 401 (token de 60 s vencido, por exemplo
 * esperando o backend acordar depois de um deploy) renova o token do Clerk e tenta uma vez de novo.
 */
export async function fetchRenovando(url: string, init: RequestInit = {}): Promise<Response> {
    const res = await fetch(url, init)
    const headers = new Headers(init.headers)
    if (res.status !== 401 || !headers.has("Authorization")) return res

    const sessao = sessaoClerk()
    const token = sessao ? await sessao.getToken({ skipCache: true }).catch(() => null) : null
    if (!token) return res

    headers.set("Authorization", `Bearer ${token}`)
    return fetch(url, { ...init, headers, signal: init.signal ? AbortSignal.timeout(TIMEOUT_NOVA_TENTATIVA_MS) : undefined })
}
