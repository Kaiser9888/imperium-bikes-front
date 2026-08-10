// components/publish/CategoryStep.tsx
"use client"

interface CategoryStepProps {
    categoryId: string
    subcategoryId: string
    onCategoryChange: (categoryId: string, subcategoryId: string) => void
}

const MAIN_CATEGORIES = [
    {
        id: "bikes",
        label: "Bikes",
        description: "Bicicletas completas montadas",
        image: "/images/categories/bikes.jpg",  // ← Coloque sua imagem aqui
        icon: "🚲",
    },
    {
        id: "pecas",
        label: "Peças",
        description: "Componentes e reposição",
        image: "/images/categories/pecas.jpg",
        icon: "⚙️",
    },
    {
        id: "servicos",
        label: "Serviços",
        description: "Mão de obra especializada",
        image: "/images/categories/servicos.jpg",
        icon: "🛠️",
    },
    {
        id: "produtos",
        label: "Produtos",
        description: "Acessórios e lifestyle",
        image: "/images/categories/produtos.jpg",
        icon: "📦",
    },
]

export function CategoryStep({ categoryId, subcategoryId, onCategoryChange }: CategoryStepProps) {
    return (
      <div className="space-y-4">
          <h2 className="font-heading text-lg font-bold">Escolha a Categoria</h2>
          <p className="text-sm text-muted-foreground">Selecione o tipo de item que deseja publicar</p>

          {/* ===== 4 QUADRADOS COM IMAGENS ===== */}
          <div className="grid grid-cols-2 gap-3">
              {MAIN_CATEGORIES.map((cat) => {
                  const isSelected = categoryId === cat.id
                  return (
                    <button
                      key={cat.id}
                      onClick={() => onCategoryChange(cat.id, "")}
                      className={`
                                group relative overflow-hidden rounded-xl border-2 transition-all
                                ${isSelected
                        ? "border-primary shadow-lg"
                        : "border-border hover:border-primary/40 hover:shadow-md"
                      }
                            `}
                    >
                        {/* Imagem de fundo */}
                        <div className="aspect-square w-full bg-muted">
                            <img
                              src={cat.image}
                              alt={cat.label}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                        </div>

                        {/* Overlay com texto */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
                            <p className="text-white font-bold text-sm">{cat.label}</p>
                            <p className="text-white/70 text-xs">{cat.description}</p>
                        </div>

                        {/* Check quando selecionado */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                              ✓
                          </div>
                        )}
                    </button>
                  )
              })}
          </div>

          {/* Subcategorias (aparece depois) */}
          {categoryId && (
            <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-semibold mb-2">
                    Selecione a subcategoria
                </p>
                {/* Aqui você coloca as subcategorias */}
            </div>
          )}
      </div>
    )
}