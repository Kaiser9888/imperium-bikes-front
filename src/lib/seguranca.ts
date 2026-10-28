/**
 * Sinais de negociação fora do Imperium numa mensagem de chat. Não bloqueia: avisa as duas
 * pessoas (quem escreve e quem recebe) de que pagamento por fora não tem proteção.
 */
const SINAIS: RegExp[] = [
    // telefone: 8+ dígitos, com ou sem espaços, traços, parênteses ou +55
    /(?:\+?\d[\s().-]*){8,}/,
    /\bpix\b/i,
    /\b(whats\s?app|whats|wpp|zap|zapzap|telegram|insta(gram)?)\b/i,
    /\b(dep[oó]sito|transfer[eê]ncia|ted|doc|boleto|em esp[eé]cie|dinheiro vivo)\b/i,
    /\bpor fora\b/i,
    /\b(chave|conta)\s+(pix|banc[aá]ria)\b/i,
    /https?:\/\/|www\.|\b[a-z0-9-]+\.(com|com\.br|net|link|me|io)\b/i,
]

export function pareceNegociacaoFora(texto: string | null | undefined): boolean {
    if (!texto) return false
    return SINAIS.some((r) => r.test(texto))
}

export const AVISO_PAGAMENTO_FORA =
    "Pagamento sempre pelo Imperium. Pix, depósito, dinheiro ou link fora do site não têm proteção nem reembolso, e quem paga por fora assume o risco."
