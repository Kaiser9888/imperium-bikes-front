'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { ArrowLeft, Heart, Star, MapPin, Trash2 } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'
import { authService } from '@/services/authService'
import { useRouter } from 'next/navigation'

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
    const router = useRouter()
    const [favoritos, setFavoritos] = useState<Favorito[]>([])
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState('')

    useEffect(() => {
        const token = authService.getToken()
        if (!token) {
            router.push('/login?redirect=/favoritos')
            return
        }
        carregarFavoritos()
    }, [])

    const carregarFavoritos = async () => {
        setLoading(true)
        setErro('')
        try {
            const response = await api.get('/favorites')
            const data = response.data

            // Mapeia os dados da API para o formato do componente
            const favoritosMapeados = (data.content || data || []).map((fav: any) => ({
                id: fav.id,
                productId: fav.product?.id || fav.productId,
                title: fav.product?.title || fav.title || 'Produto',
                price: fav.product?.price || fav.price || 0,
                brand: fav.product?.brand || fav.brand || '',
                year: fav.product?.year || fav.year || 2025,
                condition: fav.product?.condition || fav.condition || 'USADA',
                location: fav.product?.location || fav.product?.seller?.city || fav.location || '',
                rating: fav.product?.averageRating || fav.rating || 0,
                reviews: fav.product?.reviewCount || fav.reviews || 0,
                image: fav.product?.images?.[0]?.url || fav.image || null,
                status: fav.product?.status || fav.status || 'ATIVO'
            }))

            setFavoritos(favoritosMapeados)
        } catch (error: any) {
            console.error('Erro ao carregar favoritos:', error)
            if (error?.response?.status === 401) {
                router.push('/login?redirect=/favoritos')
            } else {
                setErro('Erro ao carregar favoritos')
            }
        } finally {
            setLoading(false)
        }
    }

    const removerFavorito = async (id: number) => {
        try {
            await api.delete(`/favorites/${id}`)
            setFavoritos(prev => prev.filter(f => f.id !== id))
        } catch (error) {
            console.error('Erro ao remover favorito:', error)
        }
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
                    <button onClick={() => router.back()} style={{ display: 'flex', padding: '4px', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <ArrowLeft size={20} color="#1a1a1a" />
                    </button>
                    <h1 style={{ fontSize: '17px', fontWeight: '700', color: '#1a1a1a' }}>Favoritos</h1>
                    <span style={{ fontSize: '13px', color: '#888' }}>({favoritos.length})</span>
                </div>
            </div>

            {/* Lista */}
            <div style={{ padding: '12px 16px' }}>
                {erro && (
                    <div style={{ backgroundColor: '#FEE2E2', padding: '12px', borderRadius: '8px', marginBottom: '12px', color: '#DC2626', fontSize: '13px', textAlign: 'center' }}>
                        {erro}
                    </div>
                )}

                {favoritos.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <Heart size={40} color="#ccc" />
                        <p style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a1a', marginTop: '12px' }}>
                            Nenhum favorito salvo
                        </p>
                        <p style={{ fontSize: '13px', color: '#888', marginTop: '4px', marginBottom: '16px' }}>
                            As bikes que você favoritar aparecem aqui
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
                                    {/* Imagem clicável */}
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
                                        {fav.rating > 0 && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                                                <Star size={12} color="#FFB800" fill="#FFB800" />
                                                <span style={{ fontSize: '12px', fontWeight: '600', color: '#1a1a1a' }}>{fav.rating.toFixed(1)}</span>
                                                <span style={{ fontSize: '11px', color: '#888' }}>({fav.reviews})</span>
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '11px', color: '#888' }}>
                                            <MapPin size={11} />
                                            <span>{fav.location?.split(' - ')[0] || fav.location}</span>
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