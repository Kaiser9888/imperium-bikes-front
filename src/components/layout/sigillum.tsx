"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

// Konami: ↑ ↑ ↓ ↓ ← → ← → B A
const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"]

const recompensas = {
    signifer: { src: "/sigillum/signifer.jpg", frase: "Ave. Poucos chegam até aqui." },
    galea: { src: "/sigillum/galea.jpg", frase: "Memento mori — pedale enquanto pode." },
}

/** Assinatura do rodapé. Cinco cliques no louro, ou o código Konami, revelam um segredo. */
export function Sigillum() {
    const [cliques, setCliques] = useState(0)
    const [aberto, setAberto] = useState<keyof typeof recompensas | null>(null)

    useEffect(() => {
        let pos = 0
        function onKey(e: KeyboardEvent) {
            pos = e.key === KONAMI[pos] ? pos + 1 : e.key === KONAMI[0] ? 1 : 0
            if (pos === KONAMI.length) {
                pos = 0
                setAberto("galea")
            }
            if (e.key === "Escape") setAberto(null)
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [])

    function tocar() {
        if (cliques + 1 >= 5) {
            setCliques(0)
            setAberto("signifer")
        } else setCliques(cliques + 1)
    }

    const recompensa = aberto && recompensas[aberto]

    return (
        <>
            <button
                type="button"
                onClick={tocar}
                aria-label="Selo do Imperium"
                className="type-caption inline-flex items-center gap-2 text-muted-foreground/60 transition-colors hover:text-muted-foreground"
            >
                <Image
                    src="/sigillum/laurea.jpg"
                    alt=""
                    width={48}
                    height={48}
                    className="size-6 object-cover opacity-50 invert mix-blend-multiply dark:invert-0 dark:mix-blend-screen"
                />
                Imperium Bikes · MMXXVI
            </button>

            {recompensa && (
                <div
                    role="dialog"
                    aria-label="Segredo do Imperium"
                    onClick={() => setAberto(null)}
                    className="fixed inset-0 z-[100] grid cursor-pointer place-items-center bg-black/85 p-6 backdrop-blur-sm animate-in fade-in duration-700"
                >
                    <figure className="flex max-w-xs flex-col items-center gap-4 text-center">
                        <Image
                            src={recompensa.src}
                            alt=""
                            width={564}
                            height={810}
                            className={`max-h-[60vh] w-auto rounded-sm ${aberto === "galea" ? "invert mix-blend-screen" : ""}`}
                        />
                        <figcaption className="brand-name text-xl">{recompensa.frase}</figcaption>
                    </figure>
                </div>
            )}
        </>
    )
}
