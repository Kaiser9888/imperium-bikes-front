"use client"

import { useEffect, useState, useCallback } from "react"

const banners = [
    {
        img: "/images/banner-1.png",
        tag: "Coleção Mountain",
        title: "Domine qualquer terreno",
        subtitle: "Até 30% off em mountain bikes selecionadas",
    },
    {
        img: "/images/banner-2.png",
        tag: "Linha Speed",
        title: "Velocidade de imperador",
        subtitle: "Road bikes de carbono com frete grátis",
    },
    {
        img: "/images/banner-3.png",
        tag: "Acessórios",
        title: "Equipe-se para a glória",
        subtitle: "Capacetes, luvas e componentes premium",
    },
]

export function BannerCarousel() {
    const [index, setIndex] = useState(0)

    const next = useCallback(() => {
        setIndex((i) => (i + 1) % banners.length)
    }, [])

    useEffect(() => {
        const id = setInterval(next, 5000)
        return () => clearInterval(id)
    }, [next])

    return (
        <section aria-label="Destaques" className="px-4">
            <div className="relative overflow-hidden rounded-xl">
                <div
                    className="flex transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(-${index * 100}%)` }}
                >
                    {banners.map((banner) => (
                        <div key={banner.title} className="relative aspect-[16/9] w-full shrink-0">
                            <img
                                src={banner.img || "/placeholder.svg"}
                                alt={banner.title}
                                className="absolute inset-0 size-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/40 to-transparent" />
                            <div className="absolute inset-0 flex flex-col justify-center gap-1.5 p-5">
                <span className="w-fit rounded-full bg-primary px-2.5 py-0.5 font-heading text-[0.6rem] font-semibold uppercase tracking-widest text-primary-foreground">
                  {banner.tag}
                </span>
                                <h2 className="max-w-[14rem] text-balance font-heading text-xl font-bold leading-tight text-background">
                                    {banner.title}
                                </h2>
                                <p className="max-w-[16rem] text-pretty text-xs text-background/85">{banner.subtitle}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Indicadores */}
                <div className="absolute bottom-3 left-5 flex gap-1.5">
                    {banners.map((banner, i) => (
                        <button
                            key={banner.title}
                            type="button"
                            aria-label={`Ir para banner ${i + 1}`}
                            onClick={() => setIndex(i)}
                            className={`h-1.5 rounded-full transition-all ${
                                i === index ? "w-6 bg-background" : "w-1.5 bg-background/50"
                            }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}