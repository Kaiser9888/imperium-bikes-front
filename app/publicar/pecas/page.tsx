"use client"

import { useMemo, useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Check,
  Cog,
  Disc,
  Wrench,
  Activity,
  RotateCw,
  Cable,
  CircleDot,
  Sun,
  Move,
  Target,
  Footprints,
  ArrowUpFromLine,
  Circle,
  Box,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

/* ------------------------------------------------------------------ */
/* CATEGORIAS PRINCIPAIS DE PEÇAS                                    */
/* ------------------------------------------------------------------ */

const PECA_CATEGORIES = [
  {
    id: "transmissao",
    label: "Transmissão",
    description: "Câmbios, relação, pedivelas e movimentos centrais",
    icon: Cog,
    image: "/images/categories/pecas/transmissao.jpg",
    categoryIds: [
      "transmissao-cambios",
      "transmissao-desgaste",
      "transmissao-pedivela-central",
    ],
  },

  {
    id: "freios",
    label: "Freios",
    description: "Freios dianteiros, traseiros, discos e pastilhas",
    icon: Disc,
    image: "/images/categories/pecas/freios.jpg",
    categoryIds: [
      "freio-dianteiro",
      "freio-traseiro",
      "discos-rotores",
    ],
  },

  {
    id: "suspensao",
    label: "Suspensão",
    description: "Suspensões dianteiras e amortecedores traseiros",
    icon: Wrench,
    image: "/images/categories/pecas/suspensao.jpg",
    categoryIds: [
      "suspensao-single-crown",
      "suspensao-double-crown",
      "shock-traseiro",
    ],
  },

  {
    id: "rodas",
    label: "Rodas",
    description: "Pares, rodas avulsas, cubos, aros e raios",
    icon: CircleDot,
    image: "/images/categories/pecas/rodas.jpg",
    categoryIds: [
      "rodas-par",
      "rodas-avulsas",
      "cubos-avulsos",
      "aros-raios",
    ],
  },

  {
    id: "cockpit-direcao",
    label: "Cockpit e Direção",
    description: "Guidões, mesas, caixas de direção e espaçadores",
    icon: Move,
    image: "/images/categories/pecas/cockpit.jpg",
    categoryIds: [
      "cockpit",
    ],
  },

  {
    id: "selim-canote",
    label: "Selim e Canote",
    description: "Selins, canotes e abraçadeiras",
    icon: ArrowUpFromLine,
    image: "/images/categories/pecas/selim.jpg",
    categoryIds: [
      "selim-canote",
    ],
  },

  {
    id: "pedais",
    label: "Pedais",
    description: "Pedais de encaixe, plataforma e tacos",
    icon: Footprints,
    image: "/images/categories/pecas/pedais.jpg",
    categoryIds: [
      "pedais",
    ],
  },

  {
    id: "cabos-conduites",
    label: "Cabos e Conduítes",
    description: "Cabos, conduítes, capas e terminais",
    icon: Cable,
    image: "/images/categories/pecas/cabos.jpg",
    categoryIds: [
      "cabos-conduites",
    ],
  },
] as const


/* ------------------------------------------------------------------ */
/* SUBCATEGORIAS                                                      */
/* */
/* ESTES SÃO OS IDS REAIS USADOS PELO SISTEMA                         */
/* NÃO ALTERAR OS IDS                                                 */
/* ------------------------------------------------------------------ */

const PECA_SUBCATEGORIES = [
  /* ---------------- TRANSMISSÃO ---------------- */

  {
    id: "transmissao-cambios",
    parentId: "transmissao",
    label: "Câmbios e Passadores",
    description: "Câmbios dianteiros, traseiros e passadores",
    icon: Cog,
    image: "/images/categories/pecas/cambios.jpg",
  },

  {
    id: "transmissao-desgaste",
    parentId: "transmissao",
    label: "Cassetes, Correntes e Coroas",
    description: "Cassetes, correntes e coroas",
    icon: Activity,
    image: "/images/categories/pecas/relacao.jpg",
  },

  {
    id: "transmissao-pedivela-central",
    parentId: "transmissao",
    label: "Pedivelas e Movimentos Centrais",
    description: "Pedivelas e movimentos centrais",
    icon: RotateCw,
    image: "/images/categories/pecas/pedivela.jpg",
  },


  /* ---------------- FREIOS ---------------- */

  {
    id: "freio-dianteiro",
    parentId: "freios",
    label: "Freio Dianteiro",
    description: "Componentes e kits do freio dianteiro",
    icon: Disc,
    image: "/images/categories/pecas/freio-dianteiro.jpg",
  },

  {
    id: "freio-traseiro",
    parentId: "freios",
    label: "Freio Traseiro",
    description: "Componentes e kits do freio traseiro",
    icon: Disc,
    image: "/images/categories/pecas/freio-traseiro.jpg",
  },

  {
    id: "discos-rotores",
    parentId: "freios",
    label: "Discos, Rotores e Pastilhas",
    description: "Discos, pastilhas e adaptadores",
    icon: Target,
    image: "/images/categories/pecas/discos.jpg",
  },


  /* ---------------- SUSPENSÃO ---------------- */

  {
    id: "suspensao-single-crown",
    parentId: "suspensao",
    label: "Single Crown",
    description: "Suspensões dianteiras de uma coroa",
    icon: Wrench,
    image: "/images/categories/pecas/suspensao-single.jpg",
  },

  {
    id: "suspensao-double-crown",
    parentId: "suspensao",
    label: "Double Crown",
    description: "Suspensões de duas coroas para Downhill",
    icon: Wrench,
    image: "/images/categories/pecas/suspensao-double.jpg",
  },

  {
    id: "shock-traseiro",
    parentId: "suspensao",
    label: "Shock Traseiro",
    description: "Amortecedores para Full Suspension",
    icon: Activity,
    image: "/images/categories/pecas/shock.jpg",
  },


  /* ---------------- RODAS ---------------- */

  {
    id: "rodas-par",
    parentId: "rodas",
    label: "Pares de Rodas",
    description: "Jogos de rodas completos",
    icon: CircleDot,
    image: "/images/categories/pecas/par-rodas.jpg",
  },

  {
    id: "rodas-avulsas",
    parentId: "rodas",
    label: "Rodas Avulsas",
    description: "Roda dianteira ou traseira",
    icon: Circle,
    image: "/images/categories/pecas/roda-avulsa.jpg",
  },

  {
    id: "cubos-avulsos",
    parentId: "rodas",
    label: "Cubos",
    description: "Cubos dianteiros e traseiros",
    icon: Box,
    image: "/images/categories/pecas/cubos.jpg",
  },

  {
    id: "aros-raios",
    parentId: "rodas",
    label: "Aros e Raios",
    description: "Aros e kits de raios",
    icon: Sun,
    image: "/images/categories/pecas/aros.jpg",
  },


  /* ---------------- COCKPIT E DIREÇÃO ---------------- */

  {
    id: "cockpit",
    parentId: "cockpit-direcao",
    label: "Cockpit",
    description: "Guidões, mesas, caixas de direção e espaçadores",
    icon: Move,
    image: "/images/categories/pecas/cockpit.jpg",
  },


  /* ---------------- SELIM E CANOTE ---------------- */

  {
    id: "selim-canote",
    parentId: "selim-canote",
    label: "Selim e Canote",
    description: "Selins, canotes e abraçadeiras",
    icon: ArrowUpFromLine,
    image: "/images/categories/pecas/selim.jpg",
  },


  /* ---------------- PEDAIS ---------------- */

  {
    id: "pedais",
    parentId: "pedais",
    label: "Pedais",
    description: "Pedais de encaixe, plataforma e tacos",
    icon: Footprints,
    image: "/images/categories/pecas/pedais.jpg",
  },


  /* ---------------- CABOS E CONDUÍTES ---------------- */

  {
    id: "cabos-conduites",
    parentId: "cabos-conduites",
    label: "Cabos, Conduítes e Guias",
    description: "Cabos, conduítes, capas e terminais",
    icon: Cable,
    image: "/images/categories/pecas/cabos.jpg",
  },
] as const


/* ------------------------------------------------------------------ */
/* TIPO DOS IDS DAS SUBCATEGORIAS                                     */
/* ------------------------------------------------------------------ */

type PecaSubcategoryId =
  (typeof PECA_SUBCATEGORIES)[number]["id"]


/* ------------------------------------------------------------------ */
/* TIPOS ESPECÍFICOS                                                  */
/* ------------------------------------------------------------------ */

const TIPOS_BY_CATEGORY: Record<
  PecaSubcategoryId,
  readonly string[]
> = {

  /* ---------------- TRANSMISSÃO ---------------- */

  "transmissao-cambios": [
    "Câmbio Dianteiro",
    "Câmbio Traseiro",
    "Passador Dianteiro",
    "Passador Traseiro",
    "Kit Completo",
  ],

  "transmissao-desgaste": [
    "Cassete",
    "Corrente",
    "Coroa",
    "Kit Relação Completa",
  ],

  "transmissao-pedivela-central": [
    "Pedivela",
    "Movimento Central",
    "Kit Pedivela + Central",
  ],


  /* ---------------- FREIOS ---------------- */

  "freio-dianteiro": [
    "Kit Freio Dianteiro Completo",
    "Pinça Dianteira",
    "Manete Esquerda",
  ],

  "freio-traseiro": [
    "Kit Freio Traseiro Completo",
    "Pinça Traseira",
    "Manete Direita",
  ],

  "discos-rotores": [
    "Disco de Freio",
    "Pastilhas",
    "Adaptador de Pinça",
    "Kit Discos + Pastilhas",
  ],


  /* ---------------- SUSPENSÃO ---------------- */

  "suspensao-single-crown": [
    "Suspensão 100mm",
    "Suspensão 120mm",
    "Suspensão 140mm",
    "Suspensão 150mm+",
    "Suspensão 160mm+",
  ],

  "suspensao-double-crown": [
    "Suspensão Double Crown 200mm",
    "Suspensão Double Crown 180mm",
  ],

  "shock-traseiro": [
    "Shock a Ar",
    "Shock a Mola",
    "Shock Eletrônico",
  ],


  /* ---------------- RODAS ---------------- */

  "rodas-par": [
    "Par de Rodas MTB 29\"",
    "Par de Rodas MTB 27.5\"",
    "Par de Rodas Speed 700c",
    "Par de Rodas Gravel 650b",
  ],

  "rodas-avulsas": [
    "Roda Dianteira",
    "Roda Traseira",
  ],

  "cubos-avulsos": [
    "Cubo Dianteiro",
    "Cubo Traseiro",
  ],

  "aros-raios": [
    "Aro MTB 29\"",
    "Aro MTB 27.5\"",
    "Aro Speed 700c",
    "Aro Gravel 650b",
    "Kit Raios e Niples",
  ],


  /* ---------------- COCKPIT ---------------- */

  "cockpit": [
    "Guidão MTB",
    "Guidão Speed",
    "Guidão Gravel",
    "Mesa/Avanço",
    "Caixa de Direção",
    "Espaçadores",
  ],


  /* ---------------- SELIM E CANOTE ---------------- */

  "selim-canote": [
    "Selim",
    "Canote Rígido",
    "Canote Retrátil (Dropper)",
    "Abraçadeira de Quadro",
  ],


  /* ---------------- PEDAIS ---------------- */

  "pedais": [
    "Pedal de Encaixe (Clip)",
    "Pedal Plataforma",
    "Tacos de Sapatilha",
  ],


  /* ---------------- CABOS ---------------- */

  "cabos-conduites": [
    "Cabo de Freio",
    "Cabo de Marcha",
    "Conduíte",
    "Capa de Cabo",
    "Terminal Protetor",
  ],
}


/* ------------------------------------------------------------------ */
/* CONDIÇÃO                                                           */
/* ------------------------------------------------------------------ */

const CONDICAO_OPTIONS = [
  {
    id: "novo",
    label: "Novo",
    description: "Nunca usado",
  },
  {
    id: "usado",
    label: "Usado",
    description: "Já foi utilizado",
  },
] as const


/* ------------------------------------------------------------------ */
/* COMPATIBILIDADE                                                    */
/* ------------------------------------------------------------------ */

const COMPATIBILIDADE_OPTIONS = [
  "Shimano",
  "SRAM",
  "Campagnolo",
  "MicroSHIFT",
  "Universal",
  "Não se aplica",
] as const


/* ------------------------------------------------------------------ */
/* RESPOSTAS                                                          */
/* ------------------------------------------------------------------ */

type Answers = {
  subcategoryId: PecaSubcategoryId | ""
  tipo: string
  condicao: string
  compatibilidade: string
}

const EMPTY_ANSWERS: Answers = {
  subcategoryId: "",
  tipo: "",
  condicao: "",
  compatibilidade: "",
}


/* ------------------------------------------------------------------ */
/* MODELO DOS PASSOS                                                  */
/* ------------------------------------------------------------------ */

type StepOption = {
  id: string
  label: string
  description?: string
}

type Step = {
  key: keyof Answers
  title: string
  subtitle: string
  options: StepOption[]
}


/* ------------------------------------------------------------------ */
/* PÁGINA                                                             */
/* ------------------------------------------------------------------ */

export default function PublicarPecasPage() {
  const router = useRouter()

  const [answers, setAnswers] =
    useState<Answers>(EMPTY_ANSWERS)

  const [expandedKey, setExpandedKey] =
    useState<keyof Answers | null>("subcategoryId")


  /* ---------------------------------------------------------------- */
  /* SUBCATEGORIA SELECIONADA                                         */
  /* ---------------------------------------------------------------- */

  const selectedSubcategory = useMemo(
    () =>
      PECA_SUBCATEGORIES.find(
        (item) => item.id === answers.subcategoryId
      ),
    [answers.subcategoryId]
  )


  /* ---------------------------------------------------------------- */
  /* CATEGORIA PRINCIPAL DA SUBCATEGORIA                               */
  /* ---------------------------------------------------------------- */

  const selectedParentCategory = useMemo(
    () =>
      PECA_CATEGORIES.find(
        (category) =>
          category.categoryIds.includes(
            answers.subcategoryId as never
          )
      ),
    [answers.subcategoryId]
  )


  /* ---------------------------------------------------------------- */
  /* PASSOS                                                           */
  /* ---------------------------------------------------------------- */

  const steps: Step[] = useMemo(() => {

    const subId = answers.subcategoryId

    return [
      {
        key: "subcategoryId",
        title: "Categoria da peça",
        subtitle: "Escolha onde sua peça se encaixa",

        options: PECA_CATEGORIES.flatMap((parent) => {

          const subcategories =
            PECA_SUBCATEGORIES.filter(
              (sub) => sub.parentId === parent.id
            )

          return subcategories.map((sub) => ({
            id: sub.id,
            label: `${parent.label} • ${sub.label}`,
            description: sub.description,
          }))
        }),
      },

      {
        key: "tipo",

        title: "Tipo específico",

        subtitle: subId
          ? `Escolha o tipo de ${selectedSubcategory?.label.toLowerCase() ?? "peça"}`
          : "Escolha a categoria primeiro",

        options: subId
          ? TIPOS_BY_CATEGORY[subId].map((tipo) => ({
            id: tipo,
            label: tipo,
          }))
          : [],
      },

      {
        key: "condicao",

        title: "Estado",

        subtitle: "Condição da peça",

        options: CONDICAO_OPTIONS.map((item) => ({
          id: item.id,
          label: item.label,
          description: item.description,
        })),
      },

      {
        key: "compatibilidade",

        title: "Compatibilidade",

        subtitle: "Fabricante ou padrão compatível",

        options: COMPATIBILIDADE_OPTIONS.map((item) => ({
          id: item,
          label: item,
        })),
      },
    ]

  }, [
    answers.subcategoryId,
    selectedSubcategory,
  ])


  /* ---------------------------------------------------------------- */
  /* ÍNDICE DOS PASSOS                                                */
  /* ---------------------------------------------------------------- */

  const stepIndexByKey = useMemo(() => {

    const map: Partial<
      Record<keyof Answers, number>
    > = {}

    steps.forEach((step, index) => {
      map[step.key] = index
    })

    return map

  }, [steps])


  /* ---------------------------------------------------------------- */
  /* PROGRESSO                                                        */
  /* ---------------------------------------------------------------- */

  const firstUnansweredIndex =
    steps.findIndex(
      (step) => !answers[step.key]
    )

  const allAnswered =
    firstUnansweredIndex === -1


  const isStepUnlocked = (index: number) =>
    index <=
    (
      firstUnansweredIndex === -1
        ? steps.length - 1
        : firstUnansweredIndex
    )


  /* ---------------------------------------------------------------- */
  /* SELEÇÃO                                                          */
  /* ---------------------------------------------------------------- */

  const handleSelect = (
    step: Step,
    optionId: string
  ) => {

    setAnswers((prev) => {

      const next = {
        ...prev,
        [step.key]: optionId,
      } as Answers

      /* Se mudar a categoria, limpa o tipo */
      if (step.key === "subcategoryId") {
        next.tipo = ""
      }

      return next
    })


    const currentIndex =
      stepIndexByKey[step.key] ?? 0

    const nextStep =
      steps[currentIndex + 1]

    setExpandedKey(
      nextStep
        ? nextStep.key
        : null
    )
  }


  /* ---------------------------------------------------------------- */
  /* ABRIR / FECHAR PASSO                                             */
  /* ---------------------------------------------------------------- */

  const toggleStep = (
    step: Step,
    index: number
  ) => {

    if (!isStepUnlocked(index)) {
      return
    }

    setExpandedKey((prev) =>
      prev === step.key
        ? null
        : step.key
    )
  }


  /* ---------------------------------------------------------------- */
  /* CONTINUAR                                                        */
  /* ---------------------------------------------------------------- */

  const handleContinue = () => {

    if (!allAnswered) {
      return
    }


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

      categoryId: "pecas",

      ...answers,

    }


    sessionStorage.setItem(
      "imperium_bikes_publish",
      JSON.stringify(updatedData)
    )


    /*
     * IMPORTANTE:
     * Mantém a mesma página que já existia.
     * Nenhuma nova rota foi criada.
     */

    router.push(
      "/publicar/pecas/informacoes"
    )
  }


  /* ---------------------------------------------------------------- */
  /* RENDER                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <main className="min-h-screen bg-background text-foreground">

      <style>{`

        @keyframes pecaIconPop {

          0% {
            transform: scale(0.6);
            opacity: 0;
          }

          60% {
            transform: scale(1.08);
            opacity: 1;
          }

          100% {
            transform: scale(1);
            opacity: 1;
          }

        }

        .peca-icon-pop {
          animation:
            pecaIconPop
            0.35s
            ease-out;
        }

        @media (
          prefers-reduced-motion: reduce
        ) {

          .peca-icon-pop {
            animation: none;
          }

        }

      `}</style>


      {/* ============================================================ */}
      {/* HEADER                                                        */}
      {/* ============================================================ */}

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
            Peças
          </span>


          <div className="w-[52px]" />

        </div>

      </header>


      {/* ============================================================ */}
      {/* CONTEÚDO                                                      */}
      {/* ============================================================ */}

      <div className="mx-auto max-w-2xl px-4 pb-32 pt-6">

        <section className="mb-6">

          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Caracterize sua peça
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Escolha a categoria e depois o tipo específico da peça.
          </p>

        </section>


        {/* ======================================================== */}
        {/* PEÇA SELECIONADA                                          */}
        {/* ======================================================== */}

        {selectedSubcategory && (

          <div
            key={selectedSubcategory.id}
            className="peca-icon-pop mb-6 flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3"
          >

            <img
              src={selectedSubcategory.image}
              alt={selectedSubcategory.label}
              className="size-12 shrink-0 rounded-full border border-primary/20 object-cover"
            />


            <div className="min-w-0">

              {selectedParentCategory && (
                <p className="text-[11px] font-medium uppercase tracking-wide text-primary">
                  {selectedParentCategory.label}
                </p>
              )}

              <p className="text-sm font-semibold">
                {selectedSubcategory.label}
              </p>

              <p className="truncate text-xs text-muted-foreground">
                {selectedSubcategory.description}
              </p>

            </div>

          </div>

        )}


        {/* ======================================================== */}
        {/* PASSOS                                                    */}
        {/* ======================================================== */}

        <section className="space-y-2">

          {steps.map((step, index) => {

            const isExpanded =
              expandedKey === step.key

            const isUnlocked =
              isStepUnlocked(index)

            const isAnswered =
              Boolean(answers[step.key])

            const selectedOption =
              step.options.find(
                (option) =>
                  option.id ===
                  answers[step.key]
              )


            return (

              <div
                key={step.key}
                className={`overflow-hidden rounded-xl border transition-colors ${
                  isAnswered
                    ? "border-primary/40"
                    : "border-border"
                } ${
                  !isUnlocked
                    ? "opacity-40"
                    : ""
                }`}
              >

                {/* ------------------------------------------------ */}
                {/* CABEÇALHO DO CAMPO                               */}
                {/* ------------------------------------------------ */}

                <button
                  type="button"
                  onClick={() =>
                    toggleStep(
                      step,
                      index
                    )
                  }
                  disabled={!isUnlocked}
                  aria-expanded={isExpanded}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left disabled:cursor-not-allowed"
                >

                  <div className="min-w-0">

                    <p className="text-sm font-semibold">
                      {step.title}
                    </p>

                    <p
                      className={`mt-0.5 truncate text-xs ${
                        isAnswered
                          ? "font-medium text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {selectedOption
                        ? selectedOption.label
                        : step.subtitle}
                    </p>

                  </div>


                  <span className="flex shrink-0 items-center gap-2">

                    {isAnswered && (

                      <span className="flex size-5 items-center justify-center rounded-full bg-primary text-white">

                        <Check className="size-3" />

                      </span>

                    )}


                    <ChevronDown
                      className={`size-4 text-muted-foreground transition-transform ${
                        isExpanded
                          ? "rotate-180"
                          : ""
                      }`}
                    />

                  </span>

                </button>


                {/* ------------------------------------------------ */}
                {/* OPÇÕES                                           */}
                {/* ------------------------------------------------ */}

                {isExpanded &&
                  isUnlocked && (

                    <div className="border-t border-border px-2 pb-2 pt-1">

                      {step.options.length === 0 ? (

                        <p className="px-2 py-3 text-xs text-muted-foreground">
                          Nenhuma opção disponível ainda.
                        </p>

                      ) : (

                        step.options.map(
                          (option) => {

                            const isSelected =
                              answers[
                                step.key
                                ] === option.id


                            return (

                              <button
                                key={option.id}
                                type="button"
                                onClick={() =>
                                  handleSelect(
                                    step,
                                    option.id
                                  )
                                }
                                className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                                  isSelected
                                    ? "bg-primary/10 font-semibold text-primary"
                                    : "hover:bg-muted/60"
                                }`}
                              >

                                <span className="min-w-0">

                                  <span>
                                    {option.label}
                                  </span>


                                  {option.description && (

                                    <span className="ml-2 text-xs font-normal text-muted-foreground">

                                      {option.description}

                                    </span>

                                  )}

                                </span>


                                {isSelected && (

                                  <Check className="size-3.5 shrink-0" />

                                )}

                              </button>

                            )
                          }
                        )

                      )}

                    </div>

                  )}

              </div>

            )
          })}

        </section>


        {/* ======================================================== */}
        {/* CLASSIFICAÇÃO                                             */}
        {/* ======================================================== */}

        {answers.subcategoryId && (

          <section className="mt-6 rounded-2xl border border-border bg-muted/30 p-4">

            <p className="text-xs text-muted-foreground">
              Seu anúncio será classificado como
            </p>


            <div className="mt-2 flex flex-wrap items-center gap-2">

              <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-white">
                Peças
              </span>


              {selectedParentCategory && (

                <>
                  <span className="text-muted-foreground">
                    →
                  </span>

                  <span className="rounded-full bg-background px-3 py-1 text-xs font-medium ring-1 ring-border">
                    {selectedParentCategory.label}
                  </span>
                </>

              )}


              {steps
                .filter(
                  (step) =>
                    answers[step.key]
                )
                .map((step) => {

                  const label =
                    step.options.find(
                      (option) =>
                        option.id ===
                        answers[step.key]
                    )?.label


                  return (

                    <span
                      key={step.key}
                      className="flex items-center gap-2"
                    >

                      <span className="text-muted-foreground">
                        →
                      </span>

                      <span className="rounded-full bg-background px-3 py-1 text-xs font-medium ring-1 ring-border">
                        {label}
                      </span>

                    </span>

                  )
                })}

            </div>

          </section>

        )}

      </div>


      {/* ============================================================ */}
      {/* BOTÃO CONTINUAR                                               */}
      {/* ============================================================ */}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur-lg">

        <div className="mx-auto max-w-2xl px-4 py-3">

          <button
            type="button"
            onClick={handleContinue}
            disabled={!allAnswered}
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
