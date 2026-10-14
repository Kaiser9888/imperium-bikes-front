"use client"


import { BackButton } from "@/components/ui/back-button"

interface Props {
  onClear: () => void
}

export function PublishHeader({ onClear }: Props) {
  return (
    <header
      className="sticky top-0 z-40 border-b border-border/60 bg-marble bg-cover bg-center shadow-sm"
      style={{ backgroundImage: "url(/images/marble-light.png)" }}
    >
      <div className="bg-white/60 backdrop-blur-[2px] dark:bg-background/90">
        <div className="flex h-14 items-center justify-between px-4">
          {/* Botão Voltar */}
          <BackButton href="/" />


          {/* Espaço vazio para centralizar o título */}
          <div className="w-16" />
        </div>
      </div>
    </header>
  )
}