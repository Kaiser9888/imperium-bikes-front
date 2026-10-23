import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"

import { AuthLayout } from "@/components/auth/auth-layout"
import { SignInForm } from "@/components/auth/sign-in-form"
import { destinoSeguro } from "@/lib/auth"

export const metadata: Metadata = { title: "Entrar | Imperium Bikes" }

type Props = { searchParams: Promise<{ redirect_url?: string | string[] }> }

export default async function SignInPage({ searchParams }: Props) {
    const redirectTo = destinoSeguro((await searchParams).redirect_url)
    if ((await auth()).userId) redirect(redirectTo)
    return (
        <AuthLayout
            title="Entrar"
            description="Acesse sua conta para comprar, vender e participar de eventos."
            image="/header/logindownhill.jpg"
            kicker="Bem-vindo de volta"
            headline="A trilha continua de onde você parou."
            footer={
                <>
                    Ainda não tem conta?{" "}
                    <Link
                        href={`/sign-up?redirect_url=${encodeURIComponent(redirectTo)}`}
                        className="font-semibold text-primary hover:underline"
                    >
                        Cadastre-se
                    </Link>
                </>
            }
        >
            <SignInForm redirectTo={redirectTo} />
        </AuthLayout>
    )
}
