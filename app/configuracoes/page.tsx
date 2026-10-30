"use client"

import Link from "next/link"
import { useSyncExternalStore } from "react"
import { useClerk, useUser } from "@clerk/nextjs"
import { ChevronRight, Megaphone, Monitor, Moon, Sun, Truck, UserRound, type LucideIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { AppShell } from "@/components/layout/app-shell"
import { ExcluirConta } from "@/components/configuracoes/excluir-conta"
import { SegurancaConta } from "@/components/configuracoes/seguranca-conta"
import { InstalarApp } from "@/components/layout/instalar-app"
import { PageHeading } from "@/components/layout/page-heading"
import { Button } from "@/components/ui/button"
import { RadioCard } from "@/components/ui/radio-group"
import { ETIQUETA_AUTOMATICA } from "@/lib/etiqueta"

const TEMAS: { value: string; label: string; icon: LucideIcon }[] = [
    { value: "light", label: "Claro", icon: Sun },
    { value: "dark", label: "Escuro", icon: Moon },
    { value: "system", label: "Automático", icon: Monitor },
]

const ATALHOS: { href: string; label: string; icon: LucideIcon }[] = [
    { href: "/perfil", label: "Editar perfil", icon: UserRound },
    ...(ETIQUETA_AUTOMATICA ? [{ href: "/configuracoes/endereco-envio", label: "Endereço de envio", icon: Truck }] : []),
    { href: "/configuracoes/patrocinadores", label: "Patrocinadores", icon: Megaphone },
]

const semAssinatura = () => () => {}

export default function ConfiguracoesPage() {
    const { theme, setTheme } = useTheme()
    const { isSignedIn } = useUser()
    const { signOut } = useClerk()
    // O tema só é conhecido no navegador; no servidor nenhuma opção vem marcada
    const noNavegador = useSyncExternalStore(semAssinatura, () => true, () => false)

    return (
        <AppShell>
            <main className="mx-auto w-full max-w-2xl px-4 pb-16 pt-4 sm:px-6">
                <PageHeading title="Configurações" back={{ href: "/perfil", label: "Perfil" }} />

                <section aria-labelledby="tema-title" className="mt-8">
                    <h2 id="tema-title" className="type-h3 text-foreground">
                        Aparência
                    </h2>
                    <div role="radiogroup" aria-labelledby="tema-title" className="mt-4 grid gap-3 sm:grid-cols-3">
                        {TEMAS.map(({ value, label, icon: Icon }) => (
                            <RadioCard key={value} name="tema" value={value} checked={noNavegador && theme === value} onChange={() => setTheme(value)}>
                                <span className="flex items-center gap-2.5">
                                    <Icon className="size-5" aria-hidden="true" />
                                    {label}
                                </span>
                            </RadioCard>
                        ))}
                    </div>
                </section>

                <InstalarApp />

                {isSignedIn && (
                    <section aria-labelledby="conta-title" className="mt-10">
                        <h2 id="conta-title" className="type-h3 text-foreground">
                            Conta
                        </h2>
                        <ul className="mt-4 divide-y divide-border rounded-xl border border-border bg-surface">
                            {ATALHOS.map(({ href, label, icon: Icon }) => (
                                <li key={href}>
                                    <Link href={href} className="type-label flex h-14 items-center gap-3 px-4 text-foreground hover:bg-surface-muted">
                                        <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
                                        <span className="flex-1">{label}</span>
                                        <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <Button variant="outline" className="mt-6 w-full" onClick={() => signOut({ redirectUrl: "/" })}>
                            Sair da conta
                        </Button>
                        <SegurancaConta />
                        <ExcluirConta />
                    </section>
                )}
            </main>
        </AppShell>
    )
}
