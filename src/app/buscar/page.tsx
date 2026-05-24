'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { Search, SlidersHorizontal, X, MapPin, Star, Heart, ChevronLeft, ChevronRight } from 'lucide-react'
import { productService } from '@/services/productService'
import { Product } from '@/types'
import { Suspense } from 'react'

const categorias = [
    'Todas', 'Bikes', 'Quadros', 'Suspensoes', 'Transmissao', 'Freios',
    'Rodas e Pneus', 'Cockpit', 'Pedais', 'Acessorios', 'Vestuario',
    'Componentes Eletricos', 'Ferramentas',
]

const marcasPorCategoria: Record<string, string[]> = {
    'Todas': [],
    'Bikes': ['Trek', 'Specialized', 'Scott', 'Cannondale', 'Caloi', 'Giant', 'Santa Cruz', 'Canyon', 'GT', 'Merida', 'Oggi', 'Soul', 'Sense'],
    'Suspensoes': ['Fox', 'Rockshox', 'Manitou', 'Marzocchi', 'Ohlins', 'DVO', 'Cane Creek', 'SR Suntour'],
    'Transmissao': ['Shimano', 'SRAM', 'Campagnolo', 'Microshift', 'Box Components', 'Rotor'],
    'Freios': ['Shimano', 'SRAM', 'Magura', 'Hope', 'TRP', 'Clarks'],
    'Rodas e Pneus': ['Mavic', 'DT Swiss', 'Stan\'s', 'Race Face', 'Maxxis', 'Schwalbe', 'Continental', 'Pirelli', 'Vittoria'],
    'Cockpit': ['Race Face', 'Renthal', 'Pro Taper', 'FSA', 'Truvativ', 'Easton', 'Enve'],
    'Pedais': ['Shimano', 'Crankbrothers', 'HT', 'Time', 'Look', 'Race Face'],
    'Acessorios': ['Garmin', 'Wahoo', 'Lezyne', 'Topeak', 'CamelBak', 'Oakley', 'Smith', 'POC'],
    'Vestuario': ['Fox Racing', 'Troy Lee', 'Alpinestars', 'Castelli', 'Rapha', 'Pearl Izumi', 'Endura'],
    'Componentes Eletricos': ['Shimano Steps', 'Bosch', 'Brose', 'Yamaha', 'Fazua', 'Specialized SL'],
    'Ferramentas': ['Park Tool', 'Pedro\'s', 'Feedback Sports', 'Birzman', 'Silca'],
}

const condicoes = ['Todas', 'Nova', 'Seminova', 'Usada', 'Para reparo']
const faixasPreco = [
    { label: 'Todos', min: 0, max: 999999 },
    { label: 'Ate R$ 100', min: 0, max: 100 },
    { label: 'R$ 100 - R$ 500', min: 100, max: 500 },
    { label: 'R$ 500 - R$ 2.000', min: 500, max: 2000 },
    { label: 'R$ 2.000 - R$ 5.000', min: 2000, max: 5000 },
    { label: 'R$ 5.000 - R$ 15.000', min: 5000, max: 15000 },
    { label: 'Acima de R$ 15.000', min: 15000, max: 999999 },
]
const anos = ['Todos', '2025', '2024', '2023', '2022', '2021', '2020', '2019 ou antes']

export default function BuscarPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingBottom: '70px' }}><Header /><div style={{ padding: '100px', textAlign: 'center', color: '#888' }}>Carregando...</div><BottomNav /></div>}>
            <BuscarContent />
        </Suspense>
    )
}

function BuscarContent() {
    const searchParams = useSearchParams()
    const query = searchParams.get('q') || ''
    const categoriaParam = searchParams.get('categoria') || ''


    const [produtos, setProdutos] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [busca, setBusca] = useState(query)
    const [categoria, setCategoria] = useState(categoriaParam || 'Todas')
    const [marca, setMarca] = useState('Todas')
    const [condicao, setCondicao] = useState('Todas')
    const [preco, setPreco] = useState(faixasPreco[0])
    const [ano, setAno] = useState('Todos')
    const [ordenacao, setOrdenacao] = useState('relevancia')
    const [filtrosAberto, setFiltrosAberto] = useState(false)
    const [favoritos, setFavoritos] = useState<number[]>([])

    // Paginacao
    const [pagina, setPagina] = useState(0)
    const [totalPaginas, setTotalPaginas] = useState(1)
    const [totalElementos, setTotalElementos] = useState(0)
    const ITENS_POR_PAGINA = 20

    const marcasDisponiveis = categoria !== 'Todas' && marcasPorCategoria[categoria]
        ? ['Todas', ...marcasPorCategoria[categoria]]
        : ['Todas']

    useEffect(() => {
        if (categoria !== 'Todas') setMarca('Todas')
        setPagina(0)
    }, [categoria])

    useEffect(() => {
        async function carregar() {
            setLoading(true)
            try {
                const params: any = {
                    page: pagina,
                    size: ITENS_POR_PAGINA,
                }
                if (categoria !== 'Todas') params.categoria = categoria
                if (marca !== 'Todas') params.marca = marca
                if (condicao !== 'Todas') params.condicao = condicao
                if (ano !== 'Todos') params.ano = parseInt(ano)
                if (busca) params.busca = busca
                params.minPreco = preco.min
                params.maxPreco = preco.max

                const data = await productService.listar(params)
                setProdutos(data.content || [])
                setTotalPaginas(data.totalPages || 1)
                setTotalElementos(data.totalElements || 0)
            } catch (error) {
                console.error('Erro ao carregar produtos:', error)
            } finally {
                setLoading(false)
            }
        }
        carregar()
    }, [categoria, marca, condicao, preco, ano, busca, pagina])

    const filtrarProdutos = () => {
        let resultado = [...produtos]
        if (ordenacao === 'menor-preco') resultado.sort((a, b) => a.price - b.price)
        if (ordenacao === 'maior-preco') resultado.sort((a, b) => b.price - a.price)
        if (ordenacao === 'melhor-avaliado') resultado.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
        if (ordenacao === 'mais-novo') resultado.sort((a, b) => (b.year || 0) - (a.year || 0))
        return resultado
    }

    const produtosFiltrados = filtrarProdutos()

    const formatarPreco = (valor: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
    }

    const getImagem = (product: Product) => {
        if (product.images && product.images.length > 0) return product.images[0].url
        return null
    }

    const irParaPagina = (p: number) => {
        if (p >= 0 && p < totalPaginas) {
            setPagina(p)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingBottom: '70px' }}>
            <Header />

            {/* Barra de busca */}
            <div style={{ padding: '12px 16px', backgroundColor: '#fff', borderBottom: '1px solid #e5e5e5' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={16} color="#999" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                        <input
                            type="text" value={busca} onChange={(e) => setBusca(e.target.value)}
                            placeholder="Buscar bikes, pecas, acessorios..."
                            style={{ width: '100%', padding: '10px 12px 10px 36px', backgroundColor: '#f5f5f5', border: '1px solid #e5e5e5', borderRadius: '10px', fontSize: '14px', color: '#1a1a1a', outline: 'none' }}
                        />
                        {busca && (
                            <button onClick={() => setBusca('')} style={{ position: 'absolute', right: '10px', top: '11px', background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={14} color="#999" />
                            </button>
                        )}
                    </div>
                    <button onClick={() => setFiltrosAberto(!filtrosAberto)} style={{ padding: '10px', backgroundColor: filtrosAberto ? '#DC2626' : '#f5f5f5', border: '1px solid #e5e5e5', borderRadius: '10px', cursor: 'pointer', color: filtrosAberto ? '#fff' : '#666', display: 'flex' }}>
                        <SlidersHorizontal size={16} />
                    </button>
                </div>
            </div>

            {/* Filtros */}
            {filtrosAberto && (
                <div style={{ padding: '16px', backgroundColor: '#fff', borderBottom: '1px solid #e5e5e5', maxHeight: '60vh', overflowY: 'auto' }}>
                    <FilterSection titulo="Categoria">
                        {categorias.map((c) => <FilterChip key={c} label={c} ativo={categoria === c} onClick={() => setCategoria(c)} />)}
                    </FilterSection>
                    {categoria !== 'Todas' && marcasDisponiveis.length > 1 && (
                        <FilterSection titulo="Marca">
                            {marcasDisponiveis.map((m) => <FilterChip key={m} label={m} ativo={marca === m} onClick={() => setMarca(m)} />)}
                        </FilterSection>
                    )}
                    <FilterSection titulo="Condicao">
                        {condicoes.map((c) => <FilterChip key={c} label={c} ativo={condicao === c} onClick={() => setCondicao(c)} />)}
                    </FilterSection>
                    <FilterSection titulo="Preco">
                        {faixasPreco.map((f) => <FilterChip key={f.label} label={f.label} ativo={preco.label === f.label} onClick={() => setPreco(f)} />)}
                    </FilterSection>
                    <FilterSection titulo="Ano">
                        {anos.map((a) => <FilterChip key={a} label={a} ativo={ano === a} onClick={() => setAno(a)} />)}
                    </FilterSection>
                </div>
            )}

            {/* Ordenacao e contagem */}
            <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: '13px', color: '#888' }}>
                    {loading ? 'Carregando...' : `${totalElementos} produtos encontrados`}
                </p>
                <select value={ordenacao} onChange={(e) => setOrdenacao(e.target.value)}
                        style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid #e5e5e5', fontSize: '12px', color: '#666', backgroundColor: '#fff', outline: 'none', cursor: 'pointer' }}>
                    <option value="relevancia">Mais relevantes</option>
                    <option value="menor-preco">Menor preco</option>
                    <option value="maior-preco">Maior preco</option>
                    <option value="melhor-avaliado">Melhor avaliado</option>
                    <option value="mais-novo">Mais novo</option>
                </select>
            </div>

            {/* Grid */}
            <div style={{ padding: '0 16px' }}>
                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} style={{ backgroundColor: '#eee', borderRadius: '10px', height: '200px' }} />
                        ))}
                    </div>
                ) : produtosFiltrados.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <p style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a', marginBottom: '4px' }}>Nenhum produto encontrado</p>
                        <p style={{ fontSize: '13px', color: '#888' }}>Tente mudar os filtros</p>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                            {produtosFiltrados.map((produto) => {
                                const isFav = favoritos.includes(produto.id)
                                const imagem = getImagem(produto)
                                const ativo = produto.status === 'ATIVO' || produto.status === 'ativo'
                                return (
                                    <div key={produto.id} onClick={() => window.location.href = `/produto/${produto.id}`}
                                         style={{ backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e5e5e5', cursor: 'pointer', opacity: ativo ? 1 : 0.6 }}>
                                        <div style={{ height: '130px', backgroundColor: imagem ? undefined : '#e5e5e5', backgroundImage: imagem ? `url(${imagem})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                                            {!imagem && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '40px', color: '#ccc' }}>?</div>}
                                            {ativo && (
                                                <button onClick={(e) => { e.stopPropagation(); setFavoritos(prev => prev.includes(produto.id) ? prev.filter(f => f !== produto.id) : [...prev, produto.id]) }}
                                                        style={{ position: 'absolute', top: '6px', right: '6px', width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                                    <Heart size={13} color={isFav ? '#DC2626' : '#999'} fill={isFav ? '#DC2626' : 'none'} />
                                                </button>
                                            )}
                                            <div style={{ position: 'absolute', bottom: '6px', left: '6px', display: 'flex', gap: '3px' }}>
                                                <span style={{ backgroundColor: 'rgba(220,38,38,0.9)', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: '600' }}>{produto.bikeType || produto.category?.name || 'Produto'}</span>
                                                <span style={{ backgroundColor: 'rgba(0,0,0,0.7)', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '9px' }}>{produto.condition}</span>
                                            </div>
                                            {!ativo && (
                                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <span style={{ color: '#fff', fontSize: '12px', fontWeight: '700' }}>VENDIDO</span>
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ padding: '10px' }}>
                                            <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a', marginBottom: '3px' }}>
                                                {produto.title && produto.title.length > 30 ? produto.title.slice(0, 30) + '...' : produto.title}
                                            </h3>
                                            <p style={{ fontSize: '11px', color: '#888', marginBottom: '6px' }}>{produto.brand} • {produto.year || '-'}</p>
                                            {ativo && produto.averageRating ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '6px' }}>
                                                    <Star size={11} color="#FFB800" fill="#FFB800" />
                                                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#1a1a1a' }}>{produto.averageRating.toFixed(1)}</span>
                                                    <span style={{ fontSize: '10px', color: '#999' }}>({produto.reviewCount || 0})</span>
                                                </div>
                                            ) : <div style={{ height: '16px', marginBottom: '6px' }} />}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <p style={{ fontSize: '15px', fontWeight: 'bold', color: ativo ? '#DC2626' : '#999' }}>{formatarPreco(produto.price)}</p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '10px', color: '#888' }}>
                                                    <MapPin size={10} />
                                                    <span>{produto.location || produto.seller?.city || '-'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Paginacao */}
                        {totalPaginas > 1 && (
                            <div style={{
                                display: 'flex', justifyContent: 'center', alignItems: 'center',
                                gap: '8px', padding: '20px 0'
                            }}>
                                <button
                                    onClick={() => irParaPagina(pagina - 1)}
                                    disabled={pagina === 0}
                                    style={{
                                        width: '36px', height: '36px', borderRadius: '50%',
                                        border: '1px solid #e5e5e5', backgroundColor: '#fff',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: pagina === 0 ? 'not-allowed' : 'pointer',
                                        opacity: pagina === 0 ? 0.4 : 1
                                    }}
                                >
                                    <ChevronLeft size={18} color="#666" />
                                </button>

                                {Array.from({ length: totalPaginas }, (_, i) => {
                                    // Mostrar primeira, ultima, atual e vizinhas
                                    if (i === 0 || i === totalPaginas - 1 || Math.abs(i - pagina) <= 1) {
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => irParaPagina(i)}
                                                style={{
                                                    minWidth: '36px', height: '36px', borderRadius: '50%',
                                                    border: pagina === i ? '2px solid #DC2626' : '1px solid #e5e5e5',
                                                    backgroundColor: pagina === i ? '#DC2626' : '#fff',
                                                    color: pagina === i ? '#fff' : '#666',
                                                    fontSize: '13px', fontWeight: pagina === i ? '700' : '400',
                                                    cursor: 'pointer', display: 'flex',
                                                    alignItems: 'center', justifyContent: 'center'
                                                }}
                                            >
                                                {i + 1}
                                            </button>
                                        )
                                    }
                                    // Mostrar "..." entre gaps
                                    if (i === 1 && pagina > 3) {
                                        return <span key={i} style={{ color: '#999' }}>...</span>
                                    }
                                    if (i === totalPaginas - 2 && pagina < totalPaginas - 4) {
                                        return <span key={i} style={{ color: '#999' }}>...</span>
                                    }
                                    return null
                                })}

                                <button
                                    onClick={() => irParaPagina(pagina + 1)}
                                    disabled={pagina >= totalPaginas - 1}
                                    style={{
                                        width: '36px', height: '36px', borderRadius: '50%',
                                        border: '1px solid #e5e5e5', backgroundColor: '#fff',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: pagina >= totalPaginas - 1 ? 'not-allowed' : 'pointer',
                                        opacity: pagina >= totalPaginas - 1 ? 0.4 : 1
                                    }}
                                >
                                    <ChevronRight size={18} color="#666" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <BottomNav />
        </div>
    )
}

function FilterSection({ titulo, children }: { titulo: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: '14px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: '700', color: '#1a1a1a', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{titulo}</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>{children}</div>
        </div>
    )
}

function FilterChip({ label, ativo, onClick }: { label: string; ativo: boolean; onClick: () => void }) {
    return (
        <button onClick={onClick} style={{
            padding: '7px 13px', borderRadius: '20px',
            border: ativo ? '1.5px solid #DC2626' : '1px solid #e5e5e5',
            backgroundColor: ativo ? '#DC2626' : '#fff', color: ativo ? '#fff' : '#666',
            fontSize: '12px', fontWeight: ativo ? '600' : '400', cursor: 'pointer',
            transition: 'all 0.15s', whiteSpace: 'nowrap'
        }}>{label}</button>
    )
}