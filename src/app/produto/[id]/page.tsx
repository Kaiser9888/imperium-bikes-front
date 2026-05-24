'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import {
    ArrowLeft, Heart, Share2, MapPin, Star, MessageCircle,
    Shield, Truck, RotateCcw, ChevronRight, BadgeCheck
} from 'lucide-react'
import { productService } from '@/services/productService'
import { Product } from '@/types'

export default function DetalhesProdutoPage() {
    const params = useParams()
    const id = Number(params.id)

    const [produto, setProduto] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [imagemAtiva, setImagemAtiva] = useState(0)
    const [favorito, setFavorito] = useState(false)
    const [mostrarTelefone, setMostrarTelefone] = useState(false)

    useEffect(() => {
        async function carregar() {
            setLoading(true)
            try {
                const data = await productService.buscarPorId(id)
                setProduto(data)
            } catch (error) {
                console.error('Erro ao carregar produto:', error)
            } finally {
                setLoading(false)
            }
        }
        if (id) carregar()
    }, [id])

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingBottom: '70px' }}>
                <Header />
                <div style={{ padding: '16px' }}>
                    <div style={{ height: '300px', backgroundColor: '#eee', borderRadius: '12px', marginBottom: '16px' }} />
                    <div style={{ height: '24px', backgroundColor: '#eee', borderRadius: '6px', width: '60%', marginBottom: '8px' }} />
                    <div style={{ height: '24px', backgroundColor: '#eee', borderRadius: '6px', width: '40%' }} />
                </div>
                <BottomNav />
            </div>
        )
    }

    if (!produto) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingBottom: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#888' }}>Produto nao encontrado</p>
                <BottomNav />
            </div>
        )
    }

    const imagens = produto.images && produto.images.length > 0
        ? produto.images.map(img => img.url)
        : ['/header/mtb.jpg']

    const formatarPreco = (valor: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
    }

    const ativo = produto.status === 'ATIVO' || produto.status === 'ativo'

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingBottom: '70px' }}>
            {/* Header proprio */}
            <div style={{
                position: 'sticky', top: 0, zIndex: 40, backgroundColor: '#fff',
                borderBottom: '1px solid #e5e5e5', padding: '10px 12px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <button onClick={() => window.history.back()} style={{ background: 'none', border: 'none', padding: '6px', cursor: 'pointer', display: 'flex', borderRadius: '50%' }}>
                    <ArrowLeft size={20} color="#1a1a1a" />
                </button>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setFavorito(!favorito)} style={{ background: 'none', border: 'none', padding: '6px', cursor: 'pointer', display: 'flex' }}>
                        <Heart size={20} color={favorito ? '#DC2626' : '#1a1a1a'} fill={favorito ? '#DC2626' : 'none'} />
                    </button>
                    <button style={{ background: 'none', border: 'none', padding: '6px', cursor: 'pointer', display: 'flex' }}>
                        <Share2 size={20} color="#1a1a1a" />
                    </button>
                </div>
            </div>

            {/* Galeria de imagens */}
            <div style={{ backgroundColor: '#fff', marginBottom: '4px' }}>
                <div style={{ position: 'relative' }}>
                    <div style={{
                        height: '320px',
                        backgroundImage: `url(${imagens[imagemAtiva]})`,
                        backgroundSize: 'contain',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        backgroundColor: '#f5f5f5'
                    }} />

                    {!ativo && (
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center'
                        }}>
                            <span style={{ color: '#fff', fontSize: '18px', fontWeight: '700', letterSpacing: '2px' }}>VENDIDO</span>
                        </div>
                    )}

                    {/* Contador de imagens */}
                    <div style={{
                        position: 'absolute', bottom: '10px', right: '10px',
                        backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff',
                        padding: '4px 10px', borderRadius: '12px', fontSize: '12px'
                    }}>
                        {imagemAtiva + 1} / {imagens.length}
                    </div>
                </div>

                {/* Miniaturas */}
                {imagens.length > 1 && (
                    <div style={{ display: 'flex', gap: '6px', padding: '10px 12px', overflowX: 'auto' }}>
                        {imagens.map((img, index) => (
                            <button
                                key={index}
                                onClick={() => setImagemAtiva(index)}
                                style={{
                                    width: '56px', height: '56px', borderRadius: '8px',
                                    border: imagemAtiva === index ? '2px solid #DC2626' : '2px solid #e5e5e5',
                                    backgroundImage: `url(${img})`, backgroundSize: 'cover',
                                    backgroundPosition: 'center', cursor: 'pointer',
                                    flexShrink: 0, opacity: imagemAtiva === index ? 1 : 0.6
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Informacoes principais */}
            <div style={{ backgroundColor: '#fff', padding: '16px', marginBottom: '4px' }}>
                <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a1a', lineHeight: '1.3', marginBottom: '8px' }}>
                    {produto.title}
                </h1>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    {ativo && produto.averageRating ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Star size={16} color="#FFB800" fill="#FFB800" />
                            <span style={{ fontSize: '15px', fontWeight: '700', color: '#1a1a1a' }}>{produto.averageRating.toFixed(1)}</span>
                            <span style={{ fontSize: '13px', color: '#888' }}>({produto.reviewCount || 0} avaliacoes)</span>
                        </div>
                    ) : (
                        <span style={{ fontSize: '13px', color: '#888' }}>Sem avaliacoes</span>
                    )}
                    <span style={{ color: '#e5e5e5' }}>|</span>
                    <span style={{ fontSize: '13px', color: '#888' }}>{produto.views || 0} visualizacoes</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px' }}>
          <span style={{ fontSize: '28px', fontWeight: 'bold', color: ativo ? '#DC2626' : '#999' }}>
            {formatarPreco(produto.price)}
          </span>
                    {produto.price > 1000 && (
                        <span style={{ fontSize: '14px', color: '#16A34A', fontWeight: '600' }}>
              12x de {formatarPreco(produto.price / 12)} sem juros
            </span>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    <Tag label={produto.bikeType || produto.category?.name || 'Produto'} />
                    <Tag label={produto.condition} />
                    <Tag label={produto.brand} />
                    {produto.year && <Tag label={`${produto.year}`} />}
                    {produto.size && <Tag label={`Aro ${produto.size}`} />}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#888' }}>
                    <MapPin size={14} />
                    <span>{produto.location || (produto.seller ? `${produto.seller.city}, ${produto.seller.state}` : 'Localizacao nao informada')}</span>
                </div>
            </div>

            {/* Vendedor */}
            {produto.seller && (
                <div style={{ backgroundColor: '#fff', padding: '16px', marginBottom: '4px' }}>
                    <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#1a1a1a', marginBottom: '12px' }}>Vendedor</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '48px', height: '48px', borderRadius: '50%',
                            backgroundColor: '#DC2626', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: '20px', fontWeight: 'bold'
                        }}>
                            {produto.seller.name?.charAt(0).toUpperCase() || 'V'}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a1a' }}>{produto.seller.name}</span>
                                {produto.seller.reputation > 4.5 && <BadgeCheck size={16} color="#DC2626" />}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                <Star size={12} color="#FFB800" fill="#FFB800" />
                                <span style={{ fontSize: '12px', color: '#888' }}>{produto.seller.reputation?.toFixed(1) || '5.0'}</span>
                            </div>
                        </div>
                        <button style={{
                            padding: '8px 16px', backgroundColor: '#DC2626', color: '#fff',
                            border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                        }}>
                            <MessageCircle size={15} />
                            Chat
                        </button>
                    </div>
                </div>
            )}

            {/* Descricao */}
            <div style={{ backgroundColor: '#fff', padding: '16px', marginBottom: '4px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#1a1a1a', marginBottom: '10px' }}>Descricao</h2>
                <p style={{ fontSize: '14px', color: '#444', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                    {produto.description || 'Sem descricao informada pelo vendedor.'}
                </p>
            </div>

            {/* Informacoes adicionais */}
            <div style={{ backgroundColor: '#fff', padding: '16px', marginBottom: '4px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#1a1a1a', marginBottom: '10px' }}>Informacoes</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <InfoRow label="Marca" value={produto.brand} />
                    <InfoRow label="Modelo" value={produto.model} />
                    <InfoRow label="Ano" value={produto.year?.toString()} />
                    <InfoRow label="Condicao" value={produto.condition} />
                    <InfoRow label="Tamanho" value={produto.size} />
                    <InfoRow label="Modalidade" value={produto.bikeType} />
                    <InfoRow label="Peso" value={produto.weight ? `${produto.weight}kg` : undefined} />
                </div>
            </div>

            {/* Seguranca e garantias */}
            <div style={{ backgroundColor: '#fff', padding: '16px', marginBottom: '4px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#666' }}>
                        <Shield size={18} color="#16A34A" />
                        <span>Compra garantida com protecao Imperium</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#666' }}>
                        <Truck size={18} color="#16A34A" />
                        <span>Envio para todo Brasil</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#666' }}>
                        <RotateCcw size={18} color="#16A34A" />
                        <span>Devolucao em ate 7 dias</span>
                    </div>
                </div>
            </div>

            {/* Botao de compra (fixo no rodape) */}
            {ativo && (
                <div style={{
                    position: 'fixed', bottom: '60px', left: 0, right: 0,
                    backgroundColor: '#fff', borderTop: '1px solid #e5e5e5',
                    padding: '12px 16px', display: 'flex', gap: '10px',
                    zIndex: 30
                }}>
                    <button style={{
                        flex: 1, padding: '14px', backgroundColor: '#DC2626',
                        color: '#fff', border: 'none', borderRadius: '10px',
                        fontSize: '16px', fontWeight: 'bold', cursor: 'pointer'
                    }}>
                        Comprar agora
                    </button>
                </div>
            )}

            <BottomNav />
        </div>
    )
}

function Tag({ label }: { label: string }) {
    if (!label) return null
    return (
        <span style={{
            padding: '4px 10px', backgroundColor: '#f5f5f5',
            borderRadius: '6px', fontSize: '12px', color: '#666', fontWeight: '500'
        }}>
      {label}
    </span>
    )
}

function InfoRow({ label, value }: { label: string; value?: string }) {
    if (!value) return null
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: '#888' }}>{label}</span>
            <span style={{ color: '#1a1a1a', fontWeight: '500' }}>{value}</span>
        </div>
    )
}