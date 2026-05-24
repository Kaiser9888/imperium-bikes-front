'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import {
    ArrowLeft, Edit3, Trash2, Eye, Plus,
    Package, Tag
} from 'lucide-react'
import { productService } from '@/services/productService'
import Link from 'next/link'

interface Anuncio {
    id: number
    title: string
    price: number
    status: string
    views: number
    condition: string
    brand: string
    year: number
    images: { id: number; url: string }[]
    createdAt: string
}

export default function MeusAnunciosPage() {
    const [anuncios, setAnuncios] = useState<Anuncio[]>([])
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState('')
    const [filtro, setFiltro] = useState<'todos' | 'ativos' | 'vendidos'>('todos')

    const carregarAnuncios = async () => {
        setLoading(true)
        setErro('')
        try {
            const data = await productService.listar({ page: 0, size: 50 })
            setAnuncios(data.content || [])
        } catch (error) {
            console.error('Erro ao carregar anuncios:', error)
            setErro('Erro ao carregar anuncios. Verifique sua conexao.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        carregarAnuncios()
    }, [])

    const handleExcluir = async (id: number, titulo: string) => {
        if (!confirm(`Excluir "${titulo}"? Esta acao nao pode ser desfeita.`)) return

        try {
            await productService.deletar(id)
            setAnuncios(prev => prev.filter(a => a.id !== id))
        } catch (error) {
            console.error('Erro ao excluir:', error)
            alert('Erro ao excluir anuncio. Tente novamente.')
        }
    }

    const anunciosFiltrados = anuncios.filter(a => {
        const status = a.status?.toLowerCase()
        if (filtro === 'ativos') return status === 'ativo'
        if (filtro === 'vendidos') return status === 'vendido'
        return true
    })

    const formatarPreco = (valor: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
    }

    const formatarData = (data: string) => {
        return new Date(data).toLocaleDateString('pt-BR')
    }

    const getImagem = (anuncio: Anuncio) => {
        if (anuncio.images && anuncio.images.length > 0) return anuncio.images[0].url
        return null
    }

    const ativos = anuncios.filter(a => a.status?.toLowerCase() === 'ativo').length
    const vendidos = anuncios.filter(a => a.status?.toLowerCase() === 'vendido').length

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

    if (erro) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingBottom: '70px' }}>
                <Header />
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <p style={{ fontSize: '15px', color: '#DC2626', marginBottom: '16px' }}>{erro}</p>
                    <button onClick={carregarAnuncios} style={{
                        padding: '10px 24px', backgroundColor: '#DC2626', color: '#fff',
                        border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
                    }}>
                        Tentar novamente
                    </button>
                </div>
                <BottomNav />
            </div>
        )
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingBottom: '70px' }}>
            <Header />

            <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e5e5', padding: '10px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Link href="/perfil" style={{ display: 'flex', padding: '4px' }}>
                            <ArrowLeft size={20} color="#1a1a1a" />
                        </Link>
                        <h1 style={{ fontSize: '17px', fontWeight: '700', color: '#1a1a1a' }}>Meus Anuncios</h1>
                    </div>
                    <Link href="/criar-anuncio" style={{
                        padding: '8px 14px', backgroundColor: '#DC2626', color: '#fff',
                        borderRadius: '8px', fontSize: '13px', fontWeight: '600',
                        textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px'
                    }}>
                        <Plus size={15} />
                        Novo
                    </Link>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                    <TabFiltro label={`Todos (${anuncios.length})`} ativo={filtro === 'todos'} onClick={() => setFiltro('todos')} />
                    <TabFiltro label={`Ativos (${ativos})`} ativo={filtro === 'ativos'} onClick={() => setFiltro('ativos')} />
                    <TabFiltro label={`Vendidos (${vendidos})`} ativo={filtro === 'vendidos'} onClick={() => setFiltro('vendidos')} />
                </div>
            </div>

            <div style={{ padding: '12px 16px' }}>
                {anunciosFiltrados.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <Package size={40} color="#ccc" />
                        <p style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a1a', marginTop: '12px' }}>
                            {filtro === 'todos' ? 'Nenhum anuncio publicado' : filtro === 'ativos' ? 'Nenhum anuncio ativo' : 'Nenhum anuncio vendido'}
                        </p>
                        <p style={{ fontSize: '13px', color: '#888', marginTop: '4px', marginBottom: '16px' }}>
                            {filtro === 'todos' ? 'Publique sua primeira bike ou produto' : 'Os anuncios aparecerao aqui'}
                        </p>
                        <Link href="/criar-anuncio" style={{
                            display: 'inline-block', padding: '10px 24px',
                            backgroundColor: '#DC2626', color: '#fff', borderRadius: '8px',
                            fontSize: '14px', fontWeight: '600', textDecoration: 'none'
                        }}>
                            Criar anuncio
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {anunciosFiltrados.map((anuncio) => {
                            const imagem = getImagem(anuncio)
                            const vendido = anuncio.status?.toLowerCase() === 'vendido'
                            return (
                                <div key={anuncio.id} style={{
                                    backgroundColor: '#fff', borderRadius: '10px', padding: '12px',
                                    border: '1px solid #e5e5e5', display: 'flex', gap: '12px',
                                    opacity: vendido ? 0.6 : 1
                                }}>
                                    <div style={{
                                        width: '80px', height: '80px', borderRadius: '8px',
                                        backgroundColor: imagem ? undefined : '#e5e5e5',
                                        backgroundImage: imagem ? `url(${imagem})` : undefined,
                                        backgroundSize: 'cover', backgroundPosition: 'center',
                                        flexShrink: 0, display: imagem ? undefined : 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                        position: 'relative', overflow: 'hidden'
                                    }}>
                                        {!imagem && <Package size={24} color="#ccc" />}
                                        {vendido && (
                                            <div style={{
                                                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                                backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <span style={{ color: '#fff', fontSize: '10px', fontWeight: '700' }}>VENDIDO</span>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a', marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {anuncio.title}
                                        </h3>
                                        <p style={{ fontSize: '16px', fontWeight: '700', color: vendido ? '#999' : '#DC2626', marginBottom: '4px' }}>
                                            {formatarPreco(anuncio.price)}
                                        </p>
                                        <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: '#888' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                                <Eye size={11} /> {anuncio.views || 0}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                                <Tag size={11} /> {anuncio.condition}
                                            </span>
                                            <span>{formatarData(anuncio.createdAt)}</span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', justifyContent: 'center' }}>
                                        <Link href={`/editar-anuncio/${anuncio.id}`} style={{
                                            padding: '6px', color: '#666', borderRadius: '6px',
                                            border: '1px solid #e5e5e5', display: 'flex'
                                        }}>
                                            <Edit3 size={14} />
                                        </Link>
                                        <button onClick={() => handleExcluir(anuncio.id, anuncio.title)} style={{
                                            padding: '6px', color: '#DC2626', borderRadius: '6px',
                                            border: '1px solid #FECACA', backgroundColor: '#fff',
                                            cursor: 'pointer', display: 'flex'
                                        }}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
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

function TabFiltro({ label, ativo, onClick }: { label: string; ativo: boolean; onClick: () => void }) {
    return (
        <button onClick={onClick} style={{
            padding: '7px 14px', borderRadius: '20px',
            border: ativo ? '1.5px solid #DC2626' : '1px solid #e5e5e5',
            backgroundColor: ativo ? '#DC2626' : '#fff',
            color: ativo ? '#fff' : '#666',
            fontSize: '12px', fontWeight: ativo ? '600' : '400',
            cursor: 'pointer', transition: 'all 0.15s'
        }}>
            {label}
        </button>
    )
}