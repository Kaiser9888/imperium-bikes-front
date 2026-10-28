import * as Sentry from "@sentry/nextjs"

// Sem NEXT_PUBLIC_SENTRY_DSN (local) o Sentry não envia nada
Sentry.init({ dsn: process.env.NEXT_PUBLIC_SENTRY_DSN })
