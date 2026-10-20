"use client"

import { useEffect, useState } from "react"
import { Download, Share, SquarePlus } from "lucide-react"

import { Button } from "@/components/ui/button"

/** Evento do Chrome/Android para abrir a instalação do PWA (não existe no Safari). */
type EventoInstalacao = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> }

type Estado = "carregando" | "instalado" | "android" | "ios" | "indisponivel"

/**
 * Instalar o Imperium como app. Android/Chrome: abre a instalação. iPhone: o Safari
 * não deixa instalar por botão, então mostra o passo a passo.
 */
export function InstalarApp() {
  const [estado, setEstado] = useState<Estado>("carregando")
  const [evento, setEvento] = useState<EventoInstalacao | null>(null)

  useEffect(() => {
    const instalado =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- só dá para saber no navegador
    setEstado(instalado ? "instalado" : ios ? "ios" : "indisponivel")

    const aoOferecer = (e: Event) => {
      e.preventDefault()
      setEvento(e as EventoInstalacao)
      setEstado("android")
    }
    const aoInstalar = () => setEstado("instalado")
    window.addEventListener("beforeinstallprompt", aoOferecer)
    window.addEventListener("appinstalled", aoInstalar)
    return () => {
      window.removeEventListener("beforeinstallprompt", aoOferecer)
      window.removeEventListener("appinstalled", aoInstalar)
    }
  }, [])

  async function instalar() {
    if (!evento) return
    await evento.prompt()
    const { outcome } = await evento.userChoice
    if (outcome === "accepted") setEstado("instalado")
    setEvento(null)
  }

  if (estado === "carregando") return null

  return (
    <section aria-labelledby="app-title" className="mt-10">
      <h2 id="app-title" className="type-h3 text-foreground">
        App
      </h2>
      <div className="mt-4 flex items-start gap-4 rounded-xl border border-border bg-surface p-4">
        {/* eslint-disable-next-line @next/next/no-img-element -- ícone estático do app */}
        <img src="/icons/icon-192.png" alt="" className="size-14 shrink-0 rounded-2xl" />
        <div className="min-w-0 flex-1">
          <p className="type-label text-foreground">Imperium Bikes no seu celular</p>
          {estado === "instalado" && (
            <p className="type-body-small mt-1 text-muted-foreground">O app já está instalado neste aparelho.</p>
          )}
          {estado === "android" && (
            <>
              <p className="type-body-small mt-1 text-muted-foreground">Ícone na tela inicial e tela cheia, sem a barra do navegador.</p>
              <Button className="mt-3" onClick={instalar}>
                <Download aria-hidden="true" />
                Instalar o app
              </Button>
            </>
          )}
          {estado === "ios" && (
            <ol className="type-body-small mt-2 flex flex-col gap-1.5 text-muted-foreground">
              <li className="flex items-center gap-1.5">
                1. No Safari, toque em <Share className="size-4 text-foreground" aria-label="Compartilhar" />
              </li>
              <li className="flex items-center gap-1.5">
                2. Escolha <SquarePlus className="size-4 text-foreground" aria-hidden="true" /> <b className="text-foreground">Adicionar à Tela de Início</b>
              </li>
              <li>3. Toque em Adicionar.</li>
            </ol>
          )}
          {estado === "indisponivel" && (
            <p className="type-body-small mt-1 text-muted-foreground">
              Abra o site pelo Chrome no celular e use o menu ⋮ → <b className="text-foreground">Instalar app</b> (ou Adicionar à tela inicial).
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
