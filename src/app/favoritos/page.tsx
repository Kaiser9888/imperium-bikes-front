'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { ArrowLeft, Heart, Star, MapPin, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface Favorito {
    id: number
    productId: number
    title: string
    price: number
    brand: string
    year: number
    condition: string
    location: string
    rating: number
    reviews: number
    image: string | null
    status: string
}

export default function FavoritosPage() {
    const [favoritos, setFavoritos] = useState<Favorito[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function carregar() {
            setLoading(true)
            try {
                // await api.get('/api/favorites')
                // Dados mockados para visualizacao
                setFavoritos([
                    { id: 1, productId: 1, title: 'Trek Marlin 7 2024', price: 4500, brand: 'Trek', year: 2024, condition: 'Nova', location: 'Sao Paulo - SP', rating: 4.8, reviews: 12, image: '/header/mtb.jpg', status: 'ATIVO' },
                    { id: 2, productId: 2, title: 'Specialized S-Works', price: 8900, brand: 'Specialized', year: 2024, condition: 'Seminova', location: 'Campinas - SP', rating: 5.0, reviews: 8, image: '/header/speed.jpg', status: 'ATIVO' },
                    { id: 3, productId: 3, title: 'Scott Spark RC', price: 12500, brand: 'Scott', year: 2024, condition: 'Nova', location: 'Rio de Janeiro - RJ', rating: 4.9, reviews: 15, image: '/header/bmx.jpg', status: 'ATIVO' },
                    { id: 4, productId: 4, title: 'Caloi 10 Vintage', price: 1200, brand: 'Caloi', year: 1980, condition: 'Usada', location: 'Curitiba - PR', rating: 4.5, reviews: 23, image: '/header/downhill1.jpg', status: 'VENDIDO' },
                ])
            } catch (error) {
                console.error('Erro ao carregar favoritos:', error)
            } finally {
                setLoading(false)
            }
        }
        carregar()
    }, [])

    const removerFavorito = (id: number) => {
        setFavoritos(prev => prev.filter(f => f.id !== id))
    }

    const formatarPreco = (valor: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
    }

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingBottom: '70px' }}>
                <Header />
                <div style={{ padding: '16px' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{ height: '100px', backgroundColor: '#eee', borderRadius: '10px', marginBottom: '8px' }} />
                    ))}
                </div>
                <BottomNav />
            </div>
        )
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingBottom: '70px' }}>
            <Header />

            {/* Header */}
            <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e5e5', padding: '10px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Link href="/" style={{ display: 'flex', padding: '4px' }}>
                        <ArrowLeft size={20} color="#1a1a1a" />
                    </Link>
                    <h1 style={{ fontSize: '17px', fontWeight: '700', color: '#1a1a1a' }}>Favoritos</h1>
                    <span style={{ fontSize: '13px', color: '#888' }}>({favoritos.length})</span>
                </div>
            </div>

            {/* Lista */}
            <div style={{ padding: '12px 16px' }}>
                {favoritos.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <Heart size={40} color="#ccc" />
                        <p style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a1a', marginTop: '12px' }}>
                            Nenhum favorito salvo
                        </p>
                        <p style={{ fontSize: '13px', color: '#888', marginTop: '4px', marginBottom: '16px' }}>
                            As bikes que voce favoritar aparecem aqui
                        </p>
                        <Link href="/buscar" style={{
                            display: 'inline-block', padding: '10px 24px',
                            backgroundColor: '#DC2626', color: '#fff', borderRadius: '8px',
                            fontSize: '14px', fontWeight: '600', textDecoration: 'none'
                        }}>
                            Explorar bikes
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {favoritos.map((fav) => {
                            const vendido = fav.status === 'VENDIDO' || fav.status === 'vendido'
                            return (
                                <div key={fav.id} style={{
                                    backgroundColor: '#fff', borderRadius: '10px', padding: '12px',
                                    border: '1px solid #e5e5e5', display: 'flex', gap: '12px',
                                    opacity: vendido ? 0.5 : 1, position: 'relative'
                                }}>
                                    {/* Imagem clicavel */}
                                    <Link href={`/produto/${fav.productId}`} style={{
                                        width: '90px', height: '90px', borderRadius: '8px',
                                        backgroundColor: fav.image ? undefined : '#e5e5e5',
                                        backgroundImage: fav.image ? `url(${fav.image})` : undefined,
                                        backgroundSize: 'cover', backgroundPosition: 'center',
                                        flexShrink: 0, display: 'block', position: 'relative', overflow: 'hidden'
                                    }}>
                                        {!fav.image && (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                                <Heart size={24} color="#DC2626" fill="#DC2626" />
                                            </div>
                                        )}
                                        {vendido && (
                                            <div style={{
                                                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                                backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <span style={{ color: '#fff', fontSize: '11px', fontWeight: '700' }}>VENDIDO</span>
                                            </div>
                                        )}
                                    </Link>

                                    {/* Info */}
                                    <Link href={`/produto/${fav.productId}`} style={{ flex: 1, minWidth: 0, textDecoration: 'none' }}>
                                        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a', marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {fav.title}
                                        </h3>
                                        <p style={{ fontSize: '16px', fontWeight: '700', color: vendido ? '#999' : '#DC2626', marginBottom: '4px' }}>
                                            {formatarPreco(fav.price)}
                                        </p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                                            <Star size={12} color="#FFB800" fill="#FFB800" />
                                            <span style={{ fontSize: '12px', fontWeight: '600', color: '#1a1a1a' }}>{fav.rating}</span>
                                            <span style={{ fontSize: '11px', color: '#888' }}>({fav.reviews})</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '11px', color: '#888' }}>
                                            <MapPin size={11} />
                                            <span>{fav.location.split(' - ')[0]}</span>
                                        </div>
                                    </Link>

                                    {/* Remover */}
                                    <button
                                        onClick={() => removerFavorito(fav.id)}
                                        style={{
                                            position: 'absolute', top: '8px', right: '8px',
                                            width: '28px', height: '28px', borderRadius: '50%',
                                            backgroundColor: '#fff', border: '1px solid #e5e5e5',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            cursor: 'pointer', color: '#999'
                                        }}
                                        title="Remover dos favoritos"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    )
}