
"use client"

import { useEffect, useMemo, useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Check,
  Wrench,
  GraduationCap,
  Salad,
  HeartPulse,
  Truck,
  ClipboardCheck,
  MoreHorizontal,
  Bike,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

/* ------------------------------------------------------------------ */
/* ÁREAS                                                              */
/* ------------------------------------------------------------------ */

const AREAS_BY_SPORT: Record<
  string,
  {
    id: string
    label: string
    description: string
    icon: typeof Wrench
  }[]
> = {

  ciclismo: [
    {
      id: "manutencao",
      label: "Manutenção",
      description: "Oficina, ajustes e cuidados com a bike",
      icon: Wrench,
    },
    {
      id: "aulas",
      label: "Aulas e treinamento",
      description: "Aprendizado e evolução técnica",
      icon: GraduationCap,
    },
    {
      id: "bike-fit",
      label: "Bike Fit",
      description: "Ajuste de posição e biomecânica",
      icon: ClipboardCheck,
    },
    {
      id: "nutricao",
      label: "Nutrição esportiva",
      description: "Alimentação e acompanhamento",
      icon: Salad,
    },
    {
      id: "fisioterapia",
      label: "Fisioterapia",
      description: "Recuperação e prevenção de lesões",
      icon: HeartPulse,
    },
    {
      id: "assessoria",
      label: "Assessoria esportiva",
      description: "Treinamento e acompanhamento",
      icon: ClipboardCheck,
    },
    {
      id: "transporte",
      label: "Transporte",
      description: "Transporte e logística",
      icon: Truck,
    },
    {
      id: "outros",
      label: "Outro serviço",
      description: "Serviço não listado",
      icon: MoreHorizontal,
    },
  ],

  corrida: [
    {
      id: "aulas",
      label: "Aulas e treinamento",
      description: "Treinamento para evolução",
      icon: GraduationCap,
    },
    {
      id: "assessoria",
      label: "Assessoria esportiva",
      description: "Planos e acompanhamento",
      icon: ClipboardCheck,
    },
    {
      id: "nutricao",
      label: "Nutrição esportiva",
      description: "Alimentação para desempenho",
      icon: Salad,
    },
    {
      id: "fisioterapia",
      label: "Fisioterapia",
      description: "Recuperação e prevenção",
      icon: HeartPulse,
    },
    {
      id: "outros",
      label: "Outro serviço",
      description: "Serviço não listado",
      icon: MoreHorizontal,
    },
  ],

  musculacao: [
    {
      id: "personal",
      label: "Personal trainer",
      description: "Treinamento individual",
      icon: GraduationCap,
    },
    {
      id: "avaliacao",
      label: "Avaliação física",
      description: "Avaliação e acompanhamento",
      icon: ClipboardCheck,
    },
    {
      id: "nutricao",
      label: "Nutrição esportiva",
      description: "Alimentação e desempenho",
      icon: Salad,
    },
    {
      id: "fisioterapia",
      label: "Fisioterapia",
      description: "Recuperação e prevenção",
      icon: HeartPulse,
    },
    {
      id: "outros",
      label: "Outro serviço",
      description: "Serviço não listado",
      icon: MoreHorizontal,
    },
  ],

  natacao: [
    {
      id: "aulas",
      label: "Aulas",
      description: "Aprendizado e evolução",
      icon: GraduationCap,
    },
    {
      id: "treinamento",
      label: "Treinamento",
      description: "Preparação e desempenho",
      icon: ClipboardCheck,
    },
    {
      id: "nutricao",
      label: "Nutrição esportiva",
      description: "Alimentação para atletas",
      icon: Salad,
    },
    {
      id: "fisioterapia",
      label: "Fisioterapia",
      description: "Recuperação e prevenção",
      icon: HeartPulse,
    },
    {
      id: "outros",
      label: "Outro serviço",
      description: "Serviço não listado",
      icon: MoreHorizontal,
    },
  ],

  futebol: [
    {
      id: "treinamento",
      label: "Treinamento",
      description: "Treinamento individual ou coletivo",
      icon: GraduationCap,
    },
    {
      id: "assessoria",
      label: "Assessoria esportiva",
      description: "Acompanhamento e preparação",
      icon: ClipboardCheck,
    },
    {
      id: "nutricao",
      label: "Nutrição esportiva",
      description: "Alimentação e desempenho",
      icon: Salad,
    },
    {
      id: "fisioterapia",
      label: "Fisioterapia",
      description: "Recuperação e prevenção",
      icon: HeartPulse,
    },
    {
      id: "outros",
      label: "Outro serviço",
      description: "Serviço não listado",
      icon: MoreHorizontal,
    },
  ],

  lutas: [
    {
      id: "aulas",
      label: "Aulas",
      description: "Aulas individuais ou em grupo",
      icon: GraduationCap,
    },
    {
      id: "treinamento",
      label: "Treinamento",
      description: "Preparação e evolução",
      icon: ClipboardCheck,
    },
    {
      id: "nutricao",
      label: "Nutrição esportiva",
      description: "Alimentação para desempenho",
      icon: Salad,
    },
    {
      id: "fisioterapia",
      label: "Fisioterapia",
      description: "Recuperação e prevenção",
      icon: HeartPulse,
    },
    {
      id: "outros",
      label: "Outro serviço",
      description: "Serviço não listado",
      icon: MoreHorizontal,
    },
  ],

  "saude-esportiva": [
    {
      id: "nutricao",
      label: "Nutrição esportiva",
      description: "Atendimento nutricional",
      icon: Salad,
    },
    {
      id: "fisioterapia",
      label: "Fisioterapia esportiva",
      description: "Avaliação e recuperação",
      icon: HeartPulse,
    },
    {
      id: "medicina",
      label: "Medicina esportiva",
      description: "Atendimento médico",
      icon: HeartPulse,
    },
    {
      id: "psicologia",
      label: "Psicologia esportiva",
      description: "Acompanhamento psicológico",
      icon: HeartPulse,
    },
    {
      id: "avaliacao",
      label: "Avaliação física",
      description: "Avaliação profissional",
      icon: ClipboardCheck,
    },
  ],

  outros: [
    {
      id: "aulas",
      label: "Aulas e treinamento",
      description: "Ensino e treinamento",
      icon: GraduationCap,
    },
    {
      id: "assessoria",
      label: "Assessoria esportiva",
      description: "Acompanhamento esportivo",
      icon: ClipboardCheck,
    },
    {
      id: "nutricao",
      label: "Nutrição esportiva",
      description: "Alimentação e desempenho",
      icon: Salad,
    },
    {
      id: "fisioterapia",
      label: "Fisioterapia",
      description: "Recuperação e prevenção",
      icon: HeartPulse,
    },
    {
      id: "outros",
      label: "Outro serviço",
      description: "Serviço não listado",
      icon: MoreHorizontal,
    },
  ],
}

/* ------------------------------------------------------------------ */
/* PÁGINA                                                             */
/* ------------------------------------------------------------------ */

export default function PublicarServicoAreaPage() {

  const router = useRouter()

  const [sport, setSport] =
    useState("")

  const [area, setArea] =
    useState("")

  const [expanded, setExpanded] =
    useState(true)

  useEffect(() => {

    const stored =
      sessionStorage.getItem(
        "imperium_bikes_publish"
      )

    if (!stored) {
      router.replace(
        "/publicar/servicos"
      )

      return
    }

    try {

      const data = JSON.parse(stored)

      if (!data.sportId) {
        router.replace(
          "/publicar/servicos"
        )

        return
      }

      setSport(data.sportId)

    } catch {

      router.replace(
        "/publicar/servicos"
      )
    }

  }, [router])

  const areas = useMemo(
    () =>
      sport
        ? AREAS_BY_SPORT[sport] ?? []
        : [],
    [sport]
  )

  const sportName = useMemo(() => {

    const names: Record<
      string,
      string
    > = {
      ciclismo: "Ciclismo",
      corrida: "Corrida",
      musculacao: "Musculação",
      natacao: "Natação",
      futebol: "Futebol",
      lutas: "Lutas",
      "saude-esportiva":
        "Saúde esportiva",
      outros: "Outro esporte",
    }

    return names[sport] ?? ""

  }, [sport])

  const handleSelect = (
    areaId: string
  ) => {

    setArea(areaId)

    setExpanded(false)

  }

  const handleContinue = () => {

    if (!area) return

    const stored =
      sessionStorage.getItem(
        "imperium_bikes_publish"
      )

    if (!stored) return

    try {

      const data =
        JSON.parse(stored)

      const selected =
        areas.find(
          (item) =>
            item.id === area
        )

      const updated = {
        ...data,

        serviceAreaId: area,

        serviceAreaName:
          selected?.label ?? "",
      }

      sessionStorage.setItem(
        "imperium_bikes_publish",
        JSON.stringify(updated)
      )

      router.push(
        "/publicar/servicos/informacoes"
      )

    } catch {

      return

    }

  }

  return (

    <main className="min-h-screen bg-background text-foreground">

      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-lg">

        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">

          <Link
            href="/publicar/servicos"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
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

      <div className="mx-auto max-w-2xl px-4 pb-32 pt-6">

        <section className="mb-7">

          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {sportName}
          </p>

          <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight">
            Qual é a sua área?
          </h1>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Escolha a área que melhor representa o serviço que você oferece.
          </p>

        </section>

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
                Área do serviço
              </p>

              <p
                className={`mt-0.5 truncate text-xs ${
  area
    ? "font-medium text-primary"
    : "text-muted-foreground"
}`}
              >
                {area
                  ? areas.find(
                      (item) =>
                        item.id === area
                    )?.label
                  : "Selecione uma opção"}
              </p>

            </div>

            <span className="flex items-center gap-2">

              {area && (
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

              {areas.map((item) => {

                const Icon = item.icon

                const selected =
                  area === item.id

                return (

                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      handleSelect(
                        item.id
                      )
                    }
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left ${
  selected
    ? "bg-primary/10"
    : "hover:bg-muted/60"
}`}
                  >

                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">

                      <Icon
                        className={`size-5 ${
  selected
    ? "text-primary"
    : "text-muted-foreground"
}`}
                      />

                    </div>

                    <div className="min-w-0 flex-1">

                      <p
                        className={`text-sm ${
  selected
    ? "font-semibold text-primary"
    : "font-medium"
}`}
                      >
                        {item.label}
                      </p>

                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.description}
                      </p>

                    </div>

                    {selected && (
                      <Check className="size-4 text-primary" />
                    )}

                  </button>

                )

              })}

            </div>

          )}

        </section>

      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur-lg">

        <div className="mx-auto max-w-2xl px-4 py-3">

          <button
            type="button"
            onClick={handleContinue}
            disabled={!area}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >

            Continuar

            <ArrowRight className="size-4" />

          </button>

        </div>

      </div>

    </main>
  )
}

