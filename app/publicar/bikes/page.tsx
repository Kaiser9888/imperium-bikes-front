
// app/publicar/bikes/page.tsx
"use client"

import { useMemo, useState } from "react"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const BIKE_SUBCATEGORIES = [
  {
    id: "mtb",
    label: "MTB",
    description: "Mountain Bike",
  },
  {
    id: "speed",
    label: "Speed / Road",
    description: "Bicicletas para estrada",
  },
  {
    id: "gravel",
    label: "Gravel",
    description: "Estrada e terrenos mistos",
  },
  {
    id: "urbana",
    label: "Urbana",
    description: "Mobilidade e passeio",
  },
  {
    id: "bmx",
    label: "BMX / Dirt",
    description: "BMX, street e dirt jump",
  },
  {
    id: "downhill",
    label: "Downhill",
    description: "Descidas e terrenos extremos",
  },
  {
    id: "enduro",
    label: "Enduro",
    description: "Trilhas e terrenos técnicos",
  },
  {
    id: "eletrica",
    label: "Elétrica",
    description: "E-Bikes",
  },
  {
    id: "dobravel",
    label: "Dobrável",
    description: "Bicicletas dobráveis",
  },
  {
    id: "infantil",
    label: "Infantil",
    description: "Bicicletas infantis e juvenis",
  },
] as const

type BikeSubcategoryId =
  (typeof BIKE_SUBCATEGORIES)[number]["id"]

const BIKE_TYPES_BY_CATEGORY: Record<
  BikeSubcategoryId,
  readonly string[]
> = {
  mtb: [
    "Rígida",
    "Full Suspension",
  ],

  speed: [
    "Speed",
    "TT / Triathlon",
    "Ciclocross",
  ],

  gravel: [
    "Gravel",
    "Adventure",
    "Bikepacking",
  ],

  urbana: [
    "Urbana",
    "Passeio",
    "Híbrida",
  ],

  bmx: [
    "BMX",
    "Dirt Jump",
    "Street",
  ],

  downhill: [
    "Downhill",
  ],

  enduro: [
    "Enduro",
    "Trail",
  ],

  eletrica: [
    "MTB Elétrica",
    "Urbana Elétrica",
    "Speed Elétrica",
    "Cargo Elétrica",
  ],

  dobravel: [
    "Dobrável Urbana",
    "Dobrável Esportiva",
  ],

  infantil: [
    "Infantil",
    "Juvenil",
  ],
}

export default function PublicarBikesPage() {
  const router = useRouter()

  const [subcategoryId, setSubcategoryId] =
    useState< BikeSubcategoryId | "">("")

  const [bikeType, setBikeType] = useState("")

  const selectedSubcategory = useMemo(() => {
    return BIKE_SUBCATEGORIES.find(
      (item) => item.id === subcategoryId
    )
  }, [subcategoryId])

  const availableBikeTypes = useMemo(() => {
    if (!subcategoryId) {
      return []
    }

    return BIKE_TYPES_BY_CATEGORY[subcategoryId]
  }, [subcategoryId])

  const handleSubcategoryChange = (
    value: BikeSubcategoryId
  ) => {
    setSubcategoryId(value)

    /*
     * O tipo depende da subcategoria.
     * Portanto, quando a subcategoria muda,
     * apagamos a seleção anterior.
     */
    setBikeType("")
  }

  const handleContinue = () => {
    if (!subcategoryId) {
      return
    }

    /*
     * Algumas categorias possuem tipos específicos.
     * Para essas categorias exigimos a seleção.
     */
    if (
      availableBikeTypes.length > 0 &&
      !bikeType
    ) {
      return
    }

    const currentData = sessionStorage.getItem(
      "imperium_bikes_publish"
    )

    let publishData: Record<string, unknown> = {}

    if (currentData) {
      try {
        const parsed = JSON.parse(currentData)

        if (
          parsed &&
          typeof parsed === "object" &&
          !Array.isArray(parsed)
        ) {
          publishData = parsed
        }
      } catch {
        /*
         * Se houver dados inválidos no sessionStorage,
         * simplesmente começamos novamente.
         */
        publishData = {}
      }
    }

    const updatedData = {
      ...publishData,
      categoryId: "bikes",
      subcategoryId,
      bikeType,
    }

    sessionStorage.setItem(
      "imperium_bikes_publish",
      JSON.stringify(updatedData)
    )

    /*
     * A próxima página será a etapa de informações.
     */
    router.push("/publicar/bikes/informacoes")
  }

  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* HEADER */}
      <header
        className="
          sticky
          top-0
          z-40
          border-b
          border-border
          bg-background/95
          backdrop-blur-lg
        "
      >
        <div
          className="
            mx-auto
            flex
            h-14
            max-w-2xl
            items-center
            justify-between
            px-4
          "
        >

          <Link
            href="/publicar"
            className="
              flex
              items-center
              gap-1.5
              text-sm
              text-muted-foreground
              transition-colors
              hover:text-foreground
            "
          >
            <ArrowLeft className="size-4" />
            Voltar
          </Link>

          <span className="text-sm font-semibold">
            Bicicleta
          </span>

          <div className="w-[52px]" />

        </div>
      </header>

      {/* CONTEÚDO */}
      <div
        className="
          mx-auto
          max-w-2xl
          px-4
          pb-32
          pt-6
        "
      >

        {/* PROGRESSO */}
        <div className="mb-8">

          <div className="mb-2 flex items-center justify-between">

            <span className="text-xs font-medium">
              Etapa 1
            </span>

            <span className="text-xs text-muted-foreground">
              1 de 5
            </span>

          </div>

          <div
            className="
              h-1.5
              overflow-hidden
              rounded-full
              bg-muted
            "
            aria-label="Progresso: etapa 1 de 5"
          >
            <div
              className="
                h-full
                w-1/5
                rounded-full
                bg-primary
              "
            />
          </div>

        </div>

        {/* INTRODUÇÃO */}
        <section className="mb-8">

          <h1
            className="
              font-heading
              text-2xl
              font-bold
              tracking-tight
            "
          >
            Caracterize sua bicicleta
          </h1>

          <p
            className="
              mt-2
              max-w-xl
              text-sm
              leading-6
              text-muted-foreground
            "
          >
            Primeiro escolha o tipo de bicicleta.
            Depois vamos definir as características
            específicas dela.
          </p>

        </section>

        {/* SUBCATEGORIA */}
        <section className="mb-8">

          <div className="mb-3">

            <h2 className="text-sm font-semibold">
              Tipo de bicicleta
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Deslize para encontrar uma categoria
            </p>

          </div>

          {/* BARRA HORIZONTAL */}
          <div
            className="
              -mx-4
              flex
              gap-2
              overflow-x-auto
              px-4
              pb-2
              [scrollbar-width:none]
              [&::-webkit-scrollbar]:hidden
            "
            role="radiogroup"
            aria-label="Tipo de bicicleta"
          >

            {BIKE_SUBCATEGORIES.map((subcategory) => {

              const isSelected =
                subcategoryId === subcategory.id

              return (
                <button
                  key={subcategory.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() =>
                    handleSubcategoryChange(
                      subcategory.id
                    )
                  }
                  className={`
shrink-0
rounded-xl
border
px-4
py-3
text-left
transition-all
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-primary
focus-visible:ring-offset-2

${
  isSelected
    ? "border-primary bg-primary text-white"
    : "border-border bg-background hover:border-primary/40"
}
`}
                >

                  <span
                    className="
                      block
                      text-sm
                      font-semibold
                      whitespace-nowrap
                    "
                  >
                    {subcategory.label}
                  </span>

                  <span
                    className={`
mt-0.5
block
text-[11px]
whitespace-nowrap

${
  isSelected
    ? "text-white/75"
    : "text-muted-foreground"
}
`}
                  >
                    {subcategory.description}
                  </span>

                </button>
              )
            })}

          </div>

        </section>

        {/* TIPO ESPECÍFICO */}
        {selectedSubcategory && (
          <section className="mb-8">

            <div className="mb-3">

              <h2 className="text-sm font-semibold">
                Característica principal
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                Escolha a configuração da sua{" "}
                {selectedSubcategory.label.toLowerCase()}.
              </p>

            </div>

            <div
              className="space-y-2"
              role="radiogroup"
              aria-label="Característica principal"
            >

              {availableBikeTypes.map((type) => {

                const isSelected =
                  bikeType === type

                return (
                  <button
                    key={type}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setBikeType(type)}
                    className={`
flex
w-full
items-center
justify-between
rounded-xl
border
px-4
py-3.5
text-left
transition-all
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-primary
focus-visible:ring-offset-2

${
  isSelected
    ? "border-primary bg-primary/5"
    : "border-border bg-background hover:border-primary/40"
}
`}
                  >

                    <span
                      className={`
text-sm
${
  isSelected
    ? "font-semibold text-primary"
    : "font-medium"
}
`}
                    >
                      {type}
                    </span>

                    <span
                      className={`
flex
size-5
shrink-0
items-center
justify-center
rounded-full
border

${
  isSelected
    ? "border-primary bg-primary text-white"
    : "border-border"
}
`}
                    >

                      {isSelected && (
                        <Check className="size-3" />
                      )}

                    </span>

                  </button>
                )
              })}

            </div>

          </section>
        )}

        {/* RESUMO */}
        {subcategoryId && (
          <section
            className="
              rounded-2xl
              border
              border-border
              bg-muted/30
              p-4
            "
          >

            <p className="text-xs text-muted-foreground">
              Seu anúncio será classificado como
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-2">

              <span
                className="
                  rounded-full
                  bg-primary
                  px-3
                  py-1
                  text-xs
                  font-medium
                  text-white
                "
              >
                Bicicletas
              </span>

              <span className="text-muted-foreground">
                →
              </span>

              <span
                className="
                  rounded-full
                  bg-background
                  px-3
                  py-1
                  text-xs
                  font-medium
                  ring-1
                  ring-border
                "
              >
                {selectedSubcategory?.label}
              </span>

              {bikeType && (
                <>
                  <span className="text-muted-foreground">
                    →
                  </span>

                  <span
                    className="
                      rounded-full
                      bg-background
                      px-3
                      py-1
                      text-xs
                      font-medium
                      ring-1
                      ring-border
                    "
                  >
                    {bikeType}
                  </span>
                </>
              )}

            </div>

          </section>
        )}

      </div>

      {/* BOTÃO CONTINUAR */}
      <div
        className="
          fixed
          inset-x-0
          bottom-0
          z-30
          border-t
          border-border
          bg-background/95
          backdrop-blur-lg
        "
      >

        <div className="mx-auto max-w-2xl px-4 py-3">

          <button
            type="button"
            onClick={handleContinue}
            disabled={
              !subcategoryId ||
              (availableBikeTypes.length > 0 && !bikeType)
            }
            className="
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-primary
              px-5
              py-3.5
              text-sm
              font-semibold
              text-white
              transition-all
              hover:opacity-90
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-primary
              focus-visible:ring-offset-2
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            Continuar

            <ArrowRight className="size-4" />
          </button>

        </div>

      </div>

    </main>
  )
}
