
// components/publish/CategoryStep.tsx

"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"

interface MainCategory {
  id: string
  label: string
  description: string
  image: string
  route: string
}

const MAIN_CATEGORIES: readonly MainCategory[] = [
  {
    id: "bikes",
    label: "Bicicletas",
    description: "Bicicletas completas",
    image: "/images/categories/bikes.jpg",
    route: "/publicar/bikes",
  },
  {
    id: "pecas",
    label: "Peças",
    description: "Componentes e reposição",
    image: "/images/categories/pecas.jpg",
    route: "/publicar/pecas",
  },
  {
    id: "servicos",
    label: "Serviços",
    description: "Serviços especializados",
    image: "/images/categories/servicos.jpg",
    route: "/publicar/servicos",
  },
  {
    id: "produtos",
    label: "Produtos",
    description: "Acessórios e equipamentos",
    image: "/images/categories/produtos.jpg",
    route: "/publicar/produtos",
  },
  {
    id: "consumiveis",
    label: "Consumíveis",
    description: "Produtos de consumo",
    image: "/images/categories/consumiveis.jpg",
    route: "/publicar/consumiveis",
  },
] as const

export function CategoryStep() {
  const router = useRouter()

  const handleCategoryClick = (category: MainCategory) => {
    router.push(category.route)
  }

  return (
    <section className="space-y-6">

      {/* TÍTULO */}
      <div>
        <h1
          className="
            font-heading
            text-2xl
            font-bold
            tracking-tight
          "
        >
          O que você está vendendo?
        </h1>

        <p
          className="
            mt-1.5
            text-sm
            leading-6
            text-muted-foreground
          "
        >
          Escolha uma categoria para começar.
        </p>
      </div>

      {/* CATEGORIAS 2 × 2 */}
      <div
        className="
          grid
          grid-cols-2
          gap-3
          sm:gap-4
        "
        aria-label="Categorias para publicação"
      >

        {MAIN_CATEGORIES.map((category) => (

          <button
            key={category.id}
            type="button"
            onClick={() => handleCategoryClick(category)}
            aria-label={`Publicar ${category.label}`}
            className="
              group
              relative
              overflow-hidden
              rounded-2xl
              border
              border-border
              bg-background
              text-left
              shadow-sm
              outline-none
              transition-all
              duration-200
              active:scale-[0.98]
              hover:border-primary/40
              hover:shadow-md
              focus-visible:ring-2
              focus-visible:ring-primary
              focus-visible:ring-offset-2
            "
          >

            {/* IMAGEM */}
            <div
              className="
                relative
                aspect-[4/3]
                w-full
                overflow-hidden
                bg-muted
              "
            >

              <Image
                src={category.image}
                alt={category.label}
                fill
                sizes="
                  (max-width: 640px) 50vw,
                  300px
                "
                priority={category.id === "bikes"}
                className="
                  object-cover
                  transition-transform
                  duration-500
                  ease-out
                  group-hover:scale-105
                "
              />

              {/* GRADIENTE */}
              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-black/80
                  via-black/20
                  to-transparent
                "
              />

              {/* TEXTO */}
              <div
                className="
                  absolute
                  inset-x-0
                  bottom-0
                  p-3
                  sm:p-4
                "
              >

                <h2
                  className="
                    text-sm
                    font-bold
                    text-white
                    sm:text-base
                  "
                >
                  {category.label}
                </h2>

                <p
                  className="
                    mt-0.5
                    text-[11px]
                    leading-4
                    text-white/75
                    sm:text-xs
                  "
                >
                  {category.description}
                </p>

              </div>

            </div>

          </button>

        ))}

      </div>

    </section>
  )
}
