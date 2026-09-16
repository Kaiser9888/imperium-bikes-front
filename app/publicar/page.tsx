import Link from 'next/link'

type Category = {
  id: string
  label: string
  description: string
  route?: string
}

const categories: readonly Category[] = [
  { id: 'bikes', label: 'Bicicletas', description: 'Bicicletas completas', route: '/publicar/bikes' },
  { id: 'pecas', label: 'Peças', description: 'Componentes e reposição' },
  { id: 'servicos', label: 'Serviços', description: 'Serviços especializados' },
  { id: 'produtos', label: 'Acessórios', description: 'Equipamentos e acessórios' },
  { id: 'consumiveis', label: 'Consumíveis', description: 'Produtos de uso e manutenção' },
]

function CategoryOption({ category }: { category: Category }) {
  const content = (
    <>
      <strong>{category.label}</strong>
      <span>{category.description}</span>
      {!category.route && <small>Em breve</small>}
    </>
  )

  if (!category.route) {
    return (
      <div className="category-option category-option-disabled" aria-disabled="true">
        {content}
      </div>
    )
  }

  return (
    <Link className="category-option" href={category.route}>
      {content}
    </Link>
  )
}

export default function PublicarPage() {
  return (
    <main className="imperium-page category-page">
      <header className="imperium-header">
        <Link className="header-back" href="/">Voltar</Link>
        <div className="brand-mark" aria-label="Imperium Bikes">IB</div>
        <div>
          <p className="eyebrow">Imperium Bikes</p>
          <p className="header-context">Novo anúncio</p>
        </div>
      </header>

      <div className="category-shell">
        <section className="category-intro" aria-labelledby="category-title">
          <p className="eyebrow">Publicar anúncio</p>
          <h1 id="category-title">O que você está vendendo?</h1>
          <p>Escolha uma categoria para começar. Você preencherá os detalhes em etapas simples.</p>
        </section>

        <div className="category-list" aria-label="Categorias para publicação">
          {categories.map((category) => (
            <CategoryOption key={category.id} category={category} />
          ))}
        </div>
      </div>
    </main>
  )
  }