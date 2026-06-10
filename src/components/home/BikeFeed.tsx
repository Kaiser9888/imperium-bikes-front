'use client'

import { Heart, MapPin, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useRef, useEffect, useCallback } from 'react'
import { productService } from '@/services/productService'
import { Product } from '@/types'

export function BikeFeed() {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [favoritos, setFavoritos] = useState<number[]>([])
    const [podeEsquerda, setPodeEsquerda] = useState(false)
    const [podeDireita, setPodeDireita] = useState(true)
    const [bikes, setBikes] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState('')

    // Buscar dados da API
    useEffect(() => {
        async function carregar() {
            try {
                setLoading(true)
                const data = await productService.destaques()
                setBikes(data)
            } catch (error) {
                console.error('Erro ao carregar bikes:', error)
                setErro('Erro ao carregar produtos')
            } finally {
                setLoading(false)
            }
        }
        carregar()
    }, [])

    const verificarScroll = useCallback(() => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
            setPodeEsquerda(scrollLeft > 10)
            setPodeDireita(scrollLeft + clientWidth < scrollWidth - 10)
        }
    }, [])

    useEffect(() => {
        const ref = scrollRef.current
        if (ref) {
            ref.addEventListener('scroll', verificarScroll)
            verificarScroll()
            return () => ref.removeEventListener('scroll', verificarScroll)
        }
    }, [verificarScroll, bikes])

    const formatarPreco = (valor: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(valor)
    }

    const scroll = (direcao: 'left' | 'right') => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({
                left: direcao === 'left' ? -300 : 300,
                behavior: 'smooth'
            })
        }
    }

    const toggleFavorito = (id: number) => {
        setFavoritos(prev =>
            prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
        )
    }

    // Pegar a primeira imagem do produto
    const getImagem = (product: Product) => {
        if (product.images && product.images.length > 0) {
            return product.images[0].url
        }
        return null
    }

    // Pegar a localização formatada
    const getLocalizacao = (product: Product) => {
        if (product.seller) {
            return `${product.seller.city || ''} - ${product.seller.state || ''}`
        }
        return product.location || ''
    }

    if (loading) {
        return (
            <div style={{ padding: '0 16px 16px 16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '12px' }}>
                    Bikes em Destaque
                </h2>
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    overflow: 'hidden'
                }}>
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            style={{
                                minWidth: '260px',
                                height: '280px',
                                backgroundColor: '#e5e5e5',
                                borderRadius: '12px',
                                animation: 'pulse 1.5s infinite'
                            }}
                        />
                    ))}
                </div>
                <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
            </div>
        )
    }

    if (erro) {
        return (
            <div style={{ padding: '0 16px 16px 16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '12px' }}>
                    Bikes em Destaque
                </h2>
                <div style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: '#999',
                    fontSize: '14px'
                }}>
                    <p>{erro}</p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '12px',
                            padding: '8px 20px',
                            backgroundColor: '#DC2626',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        Tentar novamente
                    </button>
                </div>
            </div>
        )
    }

    if (bikes.length === 0) {
        return null
    }

    return (
        <div style={{ padding: '0 0 16px 0' }}>
            <div style={{ padding: '0 16px', marginBottom: '12px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a1a1a' }}>
                    Bikes em Destaque
                </h2>
            </div>

            <div style={{ position: 'relative', display: 'flex', alignItems: 'stretch' }}>
                {podeEsquerda && (
                    <button onClick={() => scroll('left')} style={setaBtn}>
                        <ChevronLeft size={20} />
                    </button>
                )}

                <div
                    ref={scrollRef}
                    className="grid-produtos"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '10px',
                        padding: '0 16px'
                    }}
                >
                    {bikes.map((bike) => {
                        const isFav = favoritos.includes(bike.id)
                        const imagem = getImagem(bike)
                        const localizacao = getLocalizacao(bike)

                        return (
                            <div
                                key={bike.id}
                                onClick={() => window.location.href = `/produto/${bike.id}`}
                                style={{
                                    minWidth: '260px',
                                    maxWidth: '260px',
                                    backgroundColor: '#ffffff',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    border: '1px solid #e5e5e5',
                                    cursor: 'pointer',
                                    flexShrink: 0,
                                    scrollSnapAlign: 'start'
                                }}
                            >
                                <div style={{
                                    position: 'relative',
                                    height: '150px',
                                    backgroundColor: '#e5e5e5',
                                    backgroundImage: imagem ? `url(${imagem})` : undefined,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    display: imagem ? undefined : 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {!imagem && <span style={{ fontSize: '50px' }}>🚲</span>}

                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleFavorito(bike.id) }}
                                        style={{
                                            position: 'absolute', top: '8px', right: '8px',
                                            width: '30px', height: '30px', borderRadius: '50%',
                                            backgroundColor: 'rgba(255,255,255,0.9)', border: 'none',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Heart size={15} color={isFav ? '#DC2626' : '#999'} fill={isFav ? '#DC2626' : 'none'} />
                                    </button>

                                    <div style={{ position: 'absolute', bottom: '8px', left: '8px', display: 'flex', gap: '4px' }}>
                                        <span style={tagStyle}>{bike.bikeType || bike.category?.name || ''}</span>
                                        <span style={{ ...tagStyle, backgroundColor: 'rgba(0,0,0,0.7)' }}>{bike.condition}</span>
                                    </div>
                                </div>

                                <div style={{ padding: '12px' }}>
                                    <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a', marginBottom: '4px' }}>
                                        {bike.title}
                                    </h3>
                                    <p style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>
                                        {bike.brand} • {bike.year}
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                                        <Star size={12} color="#FFB800" fill="#FFB800" />
                                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#1a1a1a' }}>
                      {bike.averageRating ? bike.averageRating.toFixed(1) : '0.0'}
                    </span>
                                        <span style={{ fontSize: '11px', color: '#999' }}>
                      ({bike.reviewCount || 0})
                    </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <p style={{ fontSize: '17px', fontWeight: 'bold', color: '#DC2626' }}>
                                            {formatarPreco(bike.price)}
                                        </p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '11px', color: '#888' }}>
                                            <MapPin size={11} />
                                            <span>{localizacao.split(' - ')[0]}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {podeDireita && (
                    <button onClick={() => scroll('right')} style={{ ...setaBtn, left: 'auto', right: '4px' }}>
                        <ChevronRight size={20} />
                    </button>
                )}
            </div>

            <style>{`div::-webkit-scrollbar { display: none; }`}</style>
        </div>
    )
}

const setaBtn: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 10,
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: '1px solid #e5e5e5',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#666',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    left: '4px'
}

const tagStyle: React.CSSProperties = {
    backgroundColor: 'rgba(220,38,38,0.9)',
    color: '#fff',
    padding: '3px 8px',
    borderRadius: '5px',
    fontSize: '10px',
    fontWeight: '600'
}