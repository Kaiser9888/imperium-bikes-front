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
  Zap,
  Shield,
  Activity,
  RotateCw,
  Cable,
  Bike,
  CircleDot,
  Gauge,
  Sun,
  Split,
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
/* DADOS                                                               */
/* ------------------------------------------------------------------ */

const PECA_CATEGORIES = [
  // ============================================================
  // TRANSMISSÃO
  // ============================================================
  {
    id: "transmissao",
    label: "Transmissão",
    description: "Câmbios, relação, pedivelas e movimentos centrais",
    icon: Cog,
    image: "/images/categories/pecas/transmissao.jpg",

    subcategories: [
      {
        id: "transmissao-cambios",
        label: "Câmbios e Passadores",
        description: "Câmbios dianteiros, traseiros e passadores",
        image: "/images/categories/pecas/cambios.jpg",
      },
      {
        id: "transmissao-desgaste",
        label: "Cassetes, Correntes e Coroas",
        description: "Componentes da relação da bicicleta",
        image: "/images/categories/pecas/relacao.jpg",
      },
      {
        id: "transmissao-pedivela-central",
        label: "Pedivelas e Movimentos Centrais",
        description: "Pedivelas e movimentos centrais",
        image: "/images/categories/pecas/pedivela.jpg",
      },
    ],
  },

  // ============================================================
  // FREIOS
  // ============================================================
  {
    id: "freios",
    label: "Freios",
    description: "Freios dianteiros, traseiros, discos e pastilhas",
    icon: Disc,
    image: "/images/categories/pecas/freios.jpg",

    subcategories: [
      {
        id: "freio-dianteiro",
        label: "Freio Dianteiro",
        description: "Componentes e kits do freio dianteiro",
        image: "/images/categories/pecas/freio-dianteiro.jpg",
      },
      {
        id: "freio-traseiro",
        label: "Freio Traseiro",
        description: "Componentes e kits do freio traseiro",
        image: "/images/categories/pecas/freio-traseiro.jpg",
      },
      {
        id: "discos-rotores",
        label: "Discos, Rotores e Pastilhas",
        description: "Discos, pastilhas e adaptadores",
        image: "/images/categories/pecas/discos.jpg",
      },
    ],
  },

  // ============================================================
  // SUSPENSÃO
  // ============================================================
  {
    id: "suspensao",
    label: "Suspensão",
    description: "Suspensões dianteiras e amortecedores traseiros",
    icon: Wrench,
    image: "/images/categories/pecas/suspensao.jpg",

    subcategories: [
      {
        id: "suspensao-single-crown",
        label: "Single Crown",
        description: "Suspensões dianteiras de uma coroa",
        image: "/images/categories/pecas/suspensao-single.jpg",
      },
      {
        id: "suspensao-double-crown",
        label: "Double Crown",
        description: "Suspensões de duas coroas para Downhill",
        image: "/images/categories/pecas/suspensao-double.jpg",
      },
      {
        id: "shock-traseiro",
        label: "Shock Traseiro",
        description: "Amortecedores para bicicletas Full Suspension",
        image: "/images/categories/pecas/shock.jpg",
      },
    ],
  },

  // ============================================================
  // RODAS
  // ============================================================
  {
    id: "rodas",
    label: "Rodas",
    description: "Rodas completas, cubos, aros e raios",
    icon: CircleDot,
    image: "/images/categories/pecas/rodas.jpg",

    subcategories: [
      {
        id: "rodas-par",
        label: "Pares de Rodas",
        description: "Jogos de rodas completas",
        image: "/images/categories/pecas/par-rodas.jpg",
      },
      {
        id: "rodas-avulsas",
        label: "Rodas Avulsas",
        description: "Roda dianteira ou traseira",
        image: "/images/categories/pecas/roda-avulsa.jpg",
      },
      {
        id: "cubos-avulsos",
        label: "Cubos",
        description: "Cubos dianteiros e traseiros",
        image: "/images/categories/pecas/cubos.jpg",
      },
      {
        id: "aros-raios",
        label: "Aros e Raios",
        description: "Aros e kits de raios",
        image: "/images/categories/pecas/aros.jpg",
      },
    ],
  },

  // ============================================================
  // QUADRO E ESTRUTURA
  // ============================================================
  {
    id: "quadro-estrutura",
    label: "Quadro e Estrutura",
    description: "Quadros, gancheiras e componentes estruturais",
    icon: Bike,
    image: "/images/categories/pecas/quadro.jpg",

    subcategories: [
      {
        id: "quadro",
        label: "Quadros",
        description: "Quadros MTB, Speed, Gravel e BMX",
        image: "/images/categories/pecas/quadro.jpg",
      },
      {
        id: "gancheiras",
        label: "Gancheiras",
        description: "Gancheiras e suportes de câmbio",
        image: "/images/categories/pecas/gancheira.jpg",
      },
      {
        id: "links-suspensao",
        label: "Links de Suspensão",
        description: "Links e articulações de suspensão",
        image: "/images/categories/pecas/link-suspensao.jpg",
      },
    ],
  },

  // ============================================================
  // COCKPIT E DIREÇÃO
  // ============================================================
  {
    id: "cockpit-direcao",
    label: "Cockpit e Direção",
    description: "Guidões, mesas, direção e espaçadores",
    icon: Move,
    image: "/images/categories/pecas/cockpit.jpg",

    subcategories: [
      {
        id: "guidoes",
        label: "Guidões",
        description: "Guidões MTB, Speed e Gravel",
        image: "/images/categories/pecas/guidao.jpg",
      },
      {
        id: "mesas-avancos",
        label: "Mesas / Avanços",
        description: "Mesas e avanços para bicicletas",
        image: "/images/categories/pecas/mesa.jpg",
      },
      {
        id: "caixas-direcao",
        label: "Caixas de Direção",
        description: "Caixas e componentes de direção",
        image: "/images/categories/pecas/caixa-direcao.jpg",
      },
      {
        id: "espacadores",
        label: "Espaçadores",
        description: "Espaçadores de direção",
        image: "/images/categories/pecas/espacadores.jpg",
      },
    ],
  },

  // ============================================================
  // SELIM E CANOTE
  // ============================================================
  {
    id: "selim-canote",
    label: "Selim e Canote",
    description: "Selins, canotes e abraçadeiras",
    icon: ArrowUpFromLine,
    image: "/images/categories/pecas/selim.jpg",

    subcategories: [
      {
        id: "selins",
        label: "Selins",
        description: "Selins para diferentes modalidades",
        image: "/images/categories/pecas/selim.jpg",
      },
      {
        id: "canotes-rigidos",
        label: "Canotes Rígidos",
        description: "Canotes convencionais",
        image: "/images/categories/pecas/canote.jpg",
      },
      {
        id: "canotes-retrateis",
        label: "Canotes Retráteis",
        description: "Canotes retráteis ou Dropper",
        image: "/images/categories/pecas/dropper.jpg",
      },
      {
        id: "abracadeiras",
        label: "Abraçadeiras",
        description: "Abraçadeiras de canote e quadro",
        image: "/images/categories/pecas/abracadeira.jpg",
      },
    ],
  },

  // ============================================================
  // PEDAIS
  // ============================================================
  {
    id: "pedais",
    label: "Pedais",
    description: "Pedais de encaixe, plataforma e tacos",
    icon: Footprints,
    image: "/images/categories/pecas/pedais.jpg",

    subcategories: [
      {
        id: "pedais-encaixe",
        label: "Pedais de Encaixe",
        description: "Pedais Clip / SPD e similares",
        image: "/images/categories/pecas/pedal-clip.jpg",
      },
      {
        id: "pedais-plataforma",
        label: "Pedais Plataforma",
        description: "Pedais de plataforma",
        image: "/images/categories/pecas/pedal-plataforma.jpg",
      },
      {
        id: "tacos",
        label: "Tacos",
        description: "Tacos de sapatilha para pedais",
        image: "/images/categories/pecas/tacos.jpg",
      },
    ],
  },

  // ============================================================
  // CABOS E CONDUÍTES
  // ============================================================
  {
    id: "cabos-conduites",
    label: "Cabos e Conduítes",
    description: "Cabos, conduítes, capas e terminais",
    icon: Cable,
    image: "/images/categories/pecas/cabos.jpg",

    subcategories: [
      {
        id: "cabos-freio",
        label: "Cabos de Freio",
        description: "Cabos para sistemas de freio",
        image: "/images/categories/pecas/cabo-freio.jpg",
      },
      {
        id: "cabos-marcha",
        label: "Cabos de Marcha",
        description: "Cabos para câmbios e passadores",
        image: "/images/categories/pecas/cabo-marcha.jpg",
      },
      {
        id: "conduites",
        label: "Conduítes",
        description: "Conduítes para freio e câmbio",
        image: "/images/categories/pecas/conduite.jpg",
      },
      {
        id: "capas",
        label: "Capas",
        description: "Capas e revestimentos de cabos",
        image: "/images/categories/pecas/capas.jpg",
      },
      {
        id: "terminais",
        label: "Terminais",
        description: "Terminais e protetores de cabos",
        image: "/images/categories/pecas/terminais.jpg",
      },
    ],
  },
] as const


type PecaCategoryId = (typeof PECA_CATEGORIES)[number]["id"]

type PecaSubcategoryId =
  (typeof PECA_CATEGORIES)[number]["subcategories"][number]["id"]


// ============================================================
// TIPOS ESPECÍFICOS
// ============================================================

const TIPOS_BY_CATEGORY: Record<string, readonly string[]> = {
  // ---------------- TRANSMISSÃO ----------------

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

  // ---------------- FREIOS ----------------

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

  // ---------------- SUSPENSÃO ----------------

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

  // ---------------- RODAS ----------------

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

  // ---------------- QUADRO E ESTRUTURA ----------------

  "quadro": [
    "Quadro MTB",
    "Quadro Speed",
    "Quadro Gravel",
    "Quadro BMX",
  ],

  "gancheiras": [
    "Gancheira de Câmbio",
  ],

  "links-suspensao": [
    "Link de Suspensão",
  ],

  // ---------------- COCKPIT E DIREÇÃO ----------------

  "guidoes": [
    "Guidão MTB",
    "Guidão Speed",
    "Guidão Gravel",
  ],

  "mesas-avancos": [
    "Mesa / Avanço",
  ],

  "caixas-direcao": [
    "Caixa de Direção",
  ],

  "espacadores": [
    "Espaçadores",
  ],

  // ---------------- SELIM E CANOTE ----------------

  "selins": [
    "Selim MTB",
    "Selim Speed",
    "Selim Gravel",
    "Selim BMX",
  ],

  "canotes-rigidos": [
    "Canote Rígido",
  ],

  "canotes-retrateis": [
    "Canote Retrátil (Dropper)",
  ],

  "abracadeiras": [
    "Abraçadeira de Quadro",
  ],

  // ---------------- PEDAIS ----------------

  "pedais-encaixe": [
    "Pedal de Encaixe (Clip)",
  ],

  "pedais-plataforma": [
    "Pedal Plataforma",
  ],

  "tacos": [
    "Tacos de Sapatilha",
  ],

  // ---------------- CABOS E CONDUÍTES ----------------

  "cabos-freio": [
    "Cabo de Freio",
  ],

  "cabos-marcha": [
    "Cabo de Marcha",
  ],

  "conduites": [
    "Conduíte",
  ],

  "capas": [
    "Capa de Cabo",
  ],

  "terminais": [
    "Terminal Protetor",
  ],
}


// ============================================================
// CONDIÇÃO
// ============================================================

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


// ============================================================
// COMPATIBILIDADE
// ============================================================

const COMPATIBILIDADE_OPTIONS = [
  "Shimano",
  "SRAM",
  "Campagnolo",
  "MicroSHIFT",
  "Universal",
  "Não se aplica",
] as const

/* ------------------------------------------------------------------ */
/* MODELO DE RESPOSTAS                                                 */
/* ------------------------------------------------------------------ */

type Answers = {
  subcategoryId: PecaCategoryId | ""
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
/* PÁGINA                                                              */
/* ------------------------------------------------------------------ */

export default function PublicarPecasPage() {
  const router = useRouter()

  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS)
  const [expandedKey, setExpandedKey] = useState<keyof Answers | null>("subcategoryId")

  const selectedCategory = useMemo(
    () => PECA_CATEGORIES.find((item) => item.id === answers.subcategoryId),
    [answers.subcategoryId]
  )

  const steps: Step[] = useMemo(() => {
    const subId = answers.subcategoryId

    return [
      {
        key: "subcategoryId",
        title: "Categoria da peça",
        subtitle: "Qual o tipo de peça?",
        options: PECA_CATEGORIES.map((s) => ({
          id: s.id,
          label: s.label,
          description: s.description,
        })),
      },
      {
        key: "tipo",
        title: "Tipo específico",
        subtitle: subId ? `Peça da categoria ${selectedCategory?.label.toLowerCase()}` : "Escolha a categoria primeiro",
        options: subId
          ? TIPOS_BY_CATEGORY[subId].map((t) => ({ id: t, label: t }))
          : [],
      },
      {
        key: "condicao",
        title: "Estado",
        subtitle: "Condição da peça",
        options: CONDICAO_OPTIONS.map((c) => ({ id: c.id, label: c.label, description: c.description })),
      },
    ]
  }, [answers.subcategoryId, selectedCategory])

  const stepIndexByKey = useMemo(() => {
    const map: Partial<Record<keyof Answers, number>> = {}
    steps.forEach((step, index) => {
      map[step.key] = index
    })
    return map
  }, [steps])

  const firstUnansweredIndex = steps.findIndex((step) => !answers[step.key])
  const allAnswered = firstUnansweredIndex === -1

  const isStepUnlocked = (index: number) => index <= (firstUnansweredIndex === -1 ? steps.length - 1 : firstUnansweredIndex)

  const handleSelect = (step: Step, optionId: string) => {
    setAnswers((prev) => {
      const next = { ...prev, [step.key]: optionId }

      if (step.key === "subcategoryId") {
        next.tipo = ""
      }

      return next
    })

    const currentIndex = stepIndexByKey[step.key] ?? 0
    const nextStep = steps[currentIndex + 1]

    setExpandedKey(nextStep ? nextStep.key : null)
  }

  const toggleStep = (step: Step, index: number) => {
    if (!isStepUnlocked(index)) return
    setExpandedKey((prev) => (prev === step.key ? null : step.key))
  }

  const handleContinue = () => {
    if (!allAnswered) return

    const currentData = sessionStorage.getItem("imperium_bikes_publish")
    let publishData: Record<string, unknown> = {}

    if (currentData) {
      try {
        const parsed = JSON.parse(currentData)
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
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

    sessionStorage.setItem("imperium_bikes_publish", JSON.stringify(updatedData))
    router.push("/publicar/pecas/informacoes")
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <style>{`
        @keyframes pecaIconPop {
          0% { transform: scale(0.6); opacity: 0; }
          60% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .peca-icon-pop { animation: pecaIconPop 0.35s ease-out; }
        @media (prefers-reduced-motion: reduce) {
          .peca-icon-pop { animation: none; }
        }
      `}</style>

      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link href="/publicar" className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="size-4" />
            Voltar
          </Link>
          <span className="text-sm font-semibold">Peças</span>
          <div className="w-[52px]" />
        </div>
      </header>

      {/* CONTEÚDO */}
      <div className="mx-auto max-w-2xl px-4 pb-32 pt-6">
        <section className="mb-6">
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Caracterize sua peça
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Toque em cada campo para preencher, na ordem.
          </p>
        </section>

        {selectedCategory && (
          <div key={selectedCategory.id} className="peca-icon-pop mb-6 flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
            <img src={selectedCategory.image} alt={selectedCategory.label} className="size-12 shrink-0 rounded-full object-cover border border-primary/20" />
            <div>
              <p className="text-sm font-semibold">{selectedCategory.label}</p>
              <p className="text-xs text-muted-foreground">{selectedCategory.description}</p>
            </div>
          </div>
        )}

        <section className="space-y-2">
          {steps.map((step, index) => {
            const isExpanded = expandedKey === step.key
            const isUnlocked = isStepUnlocked(index)
            const isAnswered = Boolean(answers[step.key])
            const selectedOption = step.options.find((o) => o.id === answers[step.key])

            return (
              <div key={step.key} className={`overflow-hidden rounded-xl border transition-colors ${
                isAnswered ? "border-primary/40" : "border-border"
              } ${!isUnlocked ? "opacity-40" : ""}`}>
                <button type="button" onClick={() => toggleStep(step, index)} disabled={!isUnlocked} aria-expanded={isExpanded}
                        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left disabled:cursor-not-allowed">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{step.title}</p>
                    <p className={`mt-0.5 truncate text-xs ${isAnswered ? "font-medium text-primary" : "text-muted-foreground"}`}>
                      {selectedOption ? selectedOption.label : step.subtitle}
                    </p>
                  </div>
                  <span className="flex shrink-0 items-center gap-2">
                    {isAnswered && (
                      <span className="flex size-5 items-center justify-center rounded-full bg-primary text-white">
                        <Check className="size-3" />
                      </span>
                    )}
                    <ChevronDown className={`size-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </span>
                </button>

                {isExpanded && isUnlocked && (
                  <div className="border-t border-border px-2 pb-2 pt-1">
                    {step.options.length === 0 ? (
                      <p className="px-2 py-3 text-xs text-muted-foreground">Nenhuma opção disponível ainda.</p>
                    ) : (
                      step.options.map((option) => {
                        const isSelected = answers[step.key] === option.id
                        return (
                          <button key={option.id} type="button" onClick={() => handleSelect(step, option.id)}
                                  className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                                    isSelected ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted/60"
                                  }`}>
                            <span>
                              {option.label}
                              {option.description && (
                                <span className="ml-2 text-xs font-normal text-muted-foreground">{option.description}</span>
                              )}
                            </span>
                            {isSelected && <Check className="size-3.5 shrink-0" />}
                          </button>
                        )
                      })
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </section>

        {answers.subcategoryId && (
          <section className="mt-6 rounded-2xl border border-border bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground">Seu anúncio será classificado como</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-white">Peças</span>
              {steps.filter((step) => answers[step.key]).map((step) => (
                <span key={step.key} className="flex items-center gap-2">
                  <span className="text-muted-foreground">→</span>
                  <span className="rounded-full bg-background px-3 py-1 text-xs font-medium ring-1 ring-border">
                    {step.options.find((o) => o.id === answers[step.key])?.label}
                  </span>
                </span>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* BOTÃO CONTINUAR */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur-lg">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <button type="button" onClick={handleContinue} disabled={!allAnswered}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-white transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40">
            Continuar
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </main>
  )
}