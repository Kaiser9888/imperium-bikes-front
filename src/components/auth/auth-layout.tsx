import Image from "next/image"
import { Logo } from "@/components/layout/logo"

type AuthLayoutProps = {
    title: string
    description: string
    /** Foto lateral, visível a partir de telas grandes. */
    image: string
    children: React.ReactNode
    footer: React.ReactNode
}

/** Estrutura das telas de entrar e cadastrar: formulário à esquerda, foto à direita. */
export function AuthLayout({ title, description, image, children, footer }: AuthLayoutProps) {
    return (
        <div className="grid min-h-screen bg-background lg:grid-cols-2">
            <main className="flex flex-col px-6 py-8 sm:px-10">
                <Logo className="self-start" />

                <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
                    <h1 className="type-h1 text-foreground">{title}</h1>
                    <p className="type-body-small mt-2 text-muted-foreground">{description}</p>
                    <div className="mt-8">{children}</div>
                    <p className="type-body-small mt-8 text-center text-muted-foreground">{footer}</p>
                </div>
            </main>

            <div className="relative hidden lg:block">
                <Image src={image} alt="" fill priority sizes="50vw" className="object-cover" />
            </div>
        </div>
    )
}
