import { ptBR } from "@clerk/localizations"

/** Só aceita caminho interno, para o ?redirect_url= não levar a outro site. */
export function destinoSeguro(redirectUrl: string | string[] | undefined): string {
    const url = Array.isArray(redirectUrl) ? redirectUrl[0] : redirectUrl
    return url && url.startsWith("/") && !url.startsWith("//") && !url.startsWith("/\\") ? url : "/"
}

/** Traduz o erro do Clerk pelo código; sem tradução, devolve uma mensagem genérica. */
export function mensagemDeErro(error: unknown): string {
    const { code, errors } = (error ?? {}) as { code?: unknown; errors?: { code?: unknown }[] }
    const codigo = errors?.[0]?.code ?? code
    const traducoes = ptBR.unstable__errors as Record<string, unknown> | undefined
    const traduzida = typeof codigo === "string" ? traducoes?.[codigo] : undefined
    return typeof traduzida === "string" && traduzida
        ? traduzida
        : "Não foi possível concluir. Confira os dados e tente novamente."
}
