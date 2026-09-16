import Link from 'next/link'

const categories = [
  ['Bicicletas', 'Bicicletas completas', '/publicar/bikes'],
  ['Peças', 'Componentes e reposição', '#'],
  ['Serviços', 'Serviços especializados', '#'],
  ['Produtos', 'Acessórios e equipamentos', '#'],
  ['Consumíveis', 'Produtos de consumo', '#'],
] as const

export default function PublicarPage() {
  return (
    <main className="imperium-page">
      <header className="imperium-header">
        <Link className="header-back" href="/">Voltar</Link>
        <div className="brand-mark" aria-label="Imperium Bikes">IB</div>
        <div><p className="eyebrow">Imperium Bikes</p><p className="header-context">Novo anúncio</p></div>
      </header>
      <div className="category-shell">
        <section className="category-intro" aria-labelledby="category-title">
          <p className="eyebrow">Publicar anúncio</p>
          <h1 id="category-title">O que você está vendendo?</h1>
          <p>Escolha uma categoria para começar. Vamos organizar as informações do seu anúncio por etapas.</p>
        </section>
        <nav className="category-list" aria-label="Categorias para publicação">
          {categories.map(([label, description, href]) => (
            <Link key={label} className="category-option" href={href} aria-disabled={href === '#'}>
              <strong>{label}</strong><span>{description}</span>
            </Link>
          ))}
        </nav>
      </div>
    </main>
  )
}