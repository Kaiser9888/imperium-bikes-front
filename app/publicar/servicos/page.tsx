
"use client"

import { useMemo, useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Check,
  Bike,
  Dumbbell,
  Footprints,
  Waves,
  CircleDot,
  Trophy,
  HeartPulse,
  MoreHorizontal,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

/* ------------------------------------------------------------------ */
/* ESPORTES                                                            */
/* ------------------------------------------------------------------ */

const SPORTS = [
  {
    id: "ciclismo",
    label: "Ciclismo",
    description: "Bike, MTB, estrada e outras modalidades",
    icon: Bike,
  },
  {
    id: "corrida",
    label: "Corrida",
    description: "Corrida, atletismo e treinamento",
    icon: Footprints,
  },
  {
    id: "musculacao",
    label: "Musculação",
    description: "Treinamento de força e condicionamento",
    icon: Dumbbell,
  },
  {
    id: "natacao",
    label: "Natação",
    description: "Aulas, treinamento e preparação",
    icon: Waves,
  },
  {
    id: "futebol",
    label: "Futebol",
    description: "Treinamento e preparação esportiva",
    icon: CircleDot,
  },
  {
    id: "lutas",
    label: "Lutas",
    description: "Artes marciais e esportes de combate",
    icon: Trophy,
  },
  {
    id: "saude-esportiva",
    label: "Saúde esportiva",
    description: "Serviços especializados para atletas",
    icon: HeartPulse,
  },
  {
    id: "outros",
    label: "Outro esporte",
    description: "Não encontrou seu esporte?",
    icon: MoreHorizontal,
  },
] as const

type SportId = (typeof SPORTS)[number]["id"]

/* ------------------------------------------------------------------ */
/* MODELO                                                              */
/* ------------------------------------------------------------------ */

type Answers = {
  sportId: SportId | ""
}

const EMPTY_ANSWERS: Answers = {
  sportId: "",
}

/* ------------------------------------------------------------------ */
/* PÁGINA                                                              */
/* ------------------------------------------------------------------ */

export default function PublicarServicosPage() {
  const router = useRouter()

  const [answers, setAnswers] =
    useState<Answers>(EMPTY_ANSWERS)

  const [expanded, setExpanded] =
    useState(true)

  const selectedSport = useMemo(
    () =>
      SPORTS.find(
        (sport) =>
          sport.id === answers.sportId
      ),
    [answers.sportId]
  )

  const handleSelect = (
    sportId: SportId
  ) => {
    setAnswers({
      sportId,
    })

    setExpanded(false)
  }

  const handleContinue = () => {
    if (!answers.sportId) return

    const currentData =
      sessionStorage.getItem(
        "imperium_bikes_publish"
      )

    let publishData: Record<
      string,
      unknown
    > = {}

    if (currentData) {
      try {
        const parsed =
          JSON.parse(currentData)

        if (
          parsed &&
          typeof parsed === "object" &&
          !Array.isArray(parsed)
        ) {
          publishData = parsed
        }
      } catch {
        publishData = {}
      }
    }

    const updatedData = {
      ...publishData,

      categoryId: "servicos",

      sportId: answers.sportId,

      sportName:
        selectedSport?.label ?? "",
    }

    sessionStorage.setItem(
      "imperium_bikes_publish",
      JSON.stringify(updatedData)
    )

    router.push(
      "/publicar/servicos/area"
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* ------------------------------------------------------------ */}
      {/* HEADER                                                        */}
      {/* ------------------------------------------------------------ */}

      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-lg">

        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">

          <Link
            href="/publicar"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Voltar
          </Link>

          <span className="text-sm font-semibold">
            Serviço
          </span>

          <div className="w-[52px]" />

        </div>

      </header>

      {/* ------------------------------------------------------------ */}
      {/* CONTEÚDO                                                      */}
      {/* ------------------------------------------------------------ */}

      <div className="mx-auto max-w-2xl px-4 pb-32 pt-6">

        <section className="mb-7">

          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Qual esporte?
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Escolha o esporte relacionado ao serviço que você oferece.
          </p>

        </section>

        {/* ---------------------------------------------------------- */}
        {/* SELEÇÃO                                                     */}
        {/* ---------------------------------------------------------- */}

        <section className="overflow-hidden rounded-xl border border-border">

          <button
            type="button"
            onClick={() =>
              setExpanded(
                (previous) => !previous
              )
            }
            className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
          >

            <div className="min-w-0">

              <p className="text-sm font-semibold">
                Esporte
              </p>

              <p
                className={`mt-0.5 truncate text-xs ${
  selectedSport
    ? "font-medium text-primary"
    : "text-muted-foreground"
}`}
              >
                {selectedSport
                  ? selectedSport.label
                  : "Selecione uma opção"}
              </p>

            </div>

            <span className="flex shrink-0 items-center gap-2">

              {selectedSport && (
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-white">
                  <Check className="size-3" />
                </span>
              )}

              <ChevronDown
                className={`size-4 text-muted-foreground transition-transform ${
  expanded
    ? "rotate-180"
    : ""
}`}
              />

            </span>

          </button>

          {expanded && (

            <div className="border-t border-border px-2 pb-2 pt-1">

              {SPORTS.map((sport) => {

                const Icon = sport.icon

                const isSelected =
                  answers.sportId ===
                  sport.id

                return (

                  <button
                    key={sport.id}
                    type="button"
                    onClick={() =>
                      handleSelect(
                        sport.id
                      )
                    }
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors ${
  isSelected
    ? "bg-primary/10"
    : "hover:bg-muted/60"
}`}
                  >

                    <div
                      className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
  isSelected
    ? "bg-primary/15"
    : "bg-muted"
}`}
                    >
                      <Icon
                        className={`size-5 ${
  isSelected
    ? "text-primary"
    : "text-muted-foreground"
}`}
                      />
                    </div>

                    <div className="min-w-0 flex-1">

                      <p
                        className={`text-sm ${
  isSelected
    ? "font-semibold text-primary"
    : "font-medium"
}`}
                      >
                        {sport.label}
                      </p>

                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {sport.description}
                      </p>

                    </div>

                    {isSelected && (
                      <Check className="size-4 shrink-0 text-primary" />
                    )}

                  </button>

                )
              })}

            </div>

          )}

        </section>

        {/* ---------------------------------------------------------- */}
        {/* RESUMO                                                       */}
        {/* ---------------------------------------------------------- */}

        {selectedSport && (

          <section className="mt-6 rounded-2xl border border-border bg-muted/30 p-4">

            <p className="text-xs text-muted-foreground">
              Você está anunciando um serviço para
            </p>

            <div className="mt-3 flex items-center gap-3">

              {(() => {

                const Icon =
                  selectedSport.icon

                return (
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">

                    <Icon className="size-5 text-primary" />

                  </div>
                )

              })()}

              <div>

                <p className="text-sm font-semibold">
                  {selectedSport.label}
                </p>

                <p className="text-xs text-muted-foreground">
                  {selectedSport.description}
                </p>

              </div>

            </div>

          </section>

        )}

      </div>

      {/* ------------------------------------------------------------ */}
      {/* CONTINUAR                                                     */}
      {/* ------------------------------------------------------------ */}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur-lg">

        <div className="mx-auto max-w-2xl px-4 py-3">

          <button
            type="button"
            onClick={handleContinue}
            disabled={!answers.sportId}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-white transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
          >

            Continuar

            <ArrowRight className="size-4" />

          </button>

        </div>

      </div>

    </main>
  )
}

