import type { Metadata } from "next"
import Link from "next/link"

import { AuthLayout } from "@/components/auth/auth-layout"
import { SignUpForm } from "@/components/auth/sign-up-form"
import { destinoSeguro } from "@/lib/auth"

export const metadata: Metadata = { title: "Criar conta | Imperium Bikes" }

type Props = { searchParams: Promise<{ redirect_url?: string | string[] }> }

export default async function SignUpPage({ searchParams }: Props) {
    const redirectTo = destinoSeguro((await searchParams).redirect_url)
    return (
        <AuthLayout
            title="Criar conta"
            description="Cadastre-se para anunciar, comprar e se inscrever em eventos."
            image="/header/cadastrodownhill.jpg"
            footer={
                <>
                    Já tem conta?{" "}
                    <Link
                        href={`/sign-in?redirect_url=${encodeURIComponent(redirectTo)}`}
                        className="font-semibold text-primary hover:underline"
                    >
                        Entrar
                    </Link>
                </>
            }
        >
            <SignUpForm redirectTo={redirectTo} />
        </AuthLayout>
    )
}
