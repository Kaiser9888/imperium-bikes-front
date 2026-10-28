import * as Sentry from "@sentry/nextjs"

export function register() {
    Sentry.init({ dsn: process.env.NEXT_PUBLIC_SENTRY_DSN })
}

// Erros de renderização e rotas do servidor
export const onRequestError = Sentry.captureRequestError
