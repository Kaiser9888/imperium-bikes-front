'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { ArrowLeft, Star, MessageSquare, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface Avaliacao {
    id: number
    usuario: {
        id: number
        nome: string
        avatar: string | null
    }
    nota: number
    comentario: string
    data: string
    tipo: 'vendedor' | 'comprador'
    produtoRef?: {
        id: number
        titulo: string
    }
}

export default function AvaliacoesPage() {
    const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState('')
    const [filtro, setFiltro] = useState<'todas' | 'vendedor' | 'comprador'>('todas')

    const carregarAvaliacoes = async () => {
        setLoading(true)
        setErro('')
        try {
            // const response = await api.get('/api/reviews')
            // setAvaliacoes(response.data.content || response.data)
            setAvaliacoes([])
        } catch (error) {
            console.error('Erro ao carregar avaliacoes:', error)
            setErro('Erro ao carregar avaliacoes.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        carregarAvaliacoes()
    }, [])

    const media = avaliacoes.length > 0
        ? (avaliacoes.reduce((acc, a) => acc + a.nota, 0) / avaliacoes.length).toFixed(1)
        : '0.0'

    const distribuicao = [5, 4, 3, 2, 1].map(nota => {
        const count = avaliacoes.filter(a => a.nota === nota).length
        const percent = avaliacoes.length > 0 ? (count / avaliacoes.length) * 100 : 0
        return { nota, count, percent }
    })

    const avaliacoesFiltradas = filtro === 'todas'
        ? avaliacoes
        : avaliacoes.filter(a => a.tipo === filtro)

    const getInicial = (nome: string) => nome.charAt(0).toUpperCase()

    const formatarData = (data: string) => {
        return new Date(data).toLocaleDateString('pt-BR', {
            day: '2-digit', month: 'short', year: 'numeric'
        })
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

    if (erro) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingBottom: '70px' }}>
                <Header />
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <p style={{ fontSize: '15px', color: '#DC2626', marginBottom: '16px' }}>{erro}</p>
                    <button onClick={carregarAvaliacoes} style={{
                        padding: '10px 24px', backgroundColor: '#DC2626', color: '#fff',
                        border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
                    }}>Tentar novamente</button>
                </div>
                <BottomNav />
            </div>
        )
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingBottom: '70px' }}>
            <Header />

            <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e5e5', padding: '10px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Link href="/" style={{ display: 'flex', padding: '4px' }}>
                        <ArrowLeft size={20} color="#1a1a1a" />
                    </Link>
                    <h1 style={{ fontSize: '17px', fontWeight: '700', color: '#1a1a1a' }}>Avaliacoes</h1>
                </div>
            </div>

            {/* Resumo - só mostra se tem avaliações */}
            {avaliacoes.length > 0 && (
                <div style={{ backgroundColor: '#fff', padding: '20px 16px', marginBottom: '4px', borderBottom: '1px solid #e5e5e5' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '42px', fontWeight: '800', color: '#1a1a1a', lineHeight: '1' }}>{media}</p>
                            <div style={{ display: 'flex', gap: '1px', justifyContent: 'center', marginTop: '4px' }}>
                                {[1, 2, 3, 4, 5].map(n => (
                                    <Star key={n} size={14} color="#FFB800" fill={n <= Math.round(Number(media)) ? '#FFB800' : 'none'} />
                                ))}
                            </div>
                            <p style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>{avaliacoes.length} avaliacoes</p>
                        </div>
                        <div style={{ flex: 1 }}>
                            {distribuicao.map(({ nota, count, percent }) => (
                                <div key={nota} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '12px', color: '#888', width: '16px' }}>{nota}</span>
                                    <Star size={10} color="#FFB800" fill="#FFB800" />
                                    <div style={{ flex: 1, height: '6px', backgroundColor: '#f0f0f0', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', backgroundColor: '#FFB800', borderRadius: '3px', width: `${percent}%` }} />
                                    </div>
                                    <span style={{ fontSize: '11px', color: '#aaa', width: '24px', textAlign: 'right' }}>{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div style={{ backgroundColor: '#fff', padding: '10px 16px', marginBottom: '4px', borderBottom: '1px solid #e5e5e5' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                    {[
                        { key: 'todas' as const, label: `Todas (${avaliacoes.length})` },
                        { key: 'vendedor' as const, label: `Vendedor (${avaliacoes.filter(a => a.tipo === 'vendedor').length})` },
                        { key: 'comprador' as const, label: `Comprador (${avaliacoes.filter(a => a.tipo === 'comprador').length})` },
                    ].map(tab => (
                        <button key={tab.key} onClick={() => setFiltro(tab.key)} style={{
                            padding: '7px 14px', borderRadius: '20px',
                            border: filtro === tab.key ? '1.5px solid #DC2626' : '1px solid #e5e5e5',
                            backgroundColor: filtro === tab.key ? '#DC2626' : '#fff',
                            color: filtro === tab.key ? '#fff' : '#666',
                            fontSize: '12px', fontWeight: filtro === tab.key ? '600' : '400', cursor: 'pointer', transition: 'all 0.15s'
                        }}>{tab.label}</button>
                    ))}
                </div>
            </div>

            {/* Lista */}
            <div style={{ padding: '0 16px' }}>
                {avaliacoesFiltradas.length === 0 && !loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <MessageSquare size={40} color="#ccc" />
                        <p style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a1a', marginTop: '12px' }}>
                            {avaliacoes.length === 0 ? 'Nenhuma avaliacao recebida' : 'Nenhuma avaliacao neste filtro'}
                        </p>
                        <p style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>
                            {avaliacoes.length === 0 ? 'Suas avaliacoes aparecerao aqui apos as vendas' : 'Tente outro filtro'}
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {avaliacoesFiltradas.map((avaliacao) => (
                            <div key={avaliacao.id} style={{ padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '50%',
                                        backgroundColor: '#DC2626', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                        color: '#fff', fontSize: '16px', fontWeight: 'bold', flexShrink: 0
                                    }}>
                                        {getInicial(avaliacao.usuario.nome)}
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>{avaliacao.usuario.nome}</span>
                                            <span style={{ fontSize: '11px', color: '#aaa' }}>{formatarData(avaliacao.data)}</span>
                                        </div>

                                        <div style={{ display: 'flex', gap: '1px', marginBottom: '6px' }}>
                                            {[1, 2, 3, 4, 5].map(n => (
                                                <Star key={n} size={12} color="#FFB800" fill={n <= avaliacao.nota ? '#FFB800' : 'none'} />
                                            ))}
                                        </div>

                                        <p style={{ fontSize: '13px', color: '#444', lineHeight: '1.5', marginBottom: '6px' }}>
                                            {avaliacao.comentario}
                                        </p>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{
                                                fontSize: '11px', fontWeight: '600', color: '#DC2626',
                                                backgroundColor: '#FEE2E2', padding: '2px 8px', borderRadius: '4px'
                                            }}>
                                                {avaliacao.tipo === 'vendedor' ? 'Vendedor' : 'Comprador'}
                                            </span>
                                            {avaliacao.produtoRef && (
                                                <Link href={`/produto/${avaliacao.produtoRef.id}`} style={{
                                                    fontSize: '11px', color: '#888', textDecoration: 'none',
                                                    display: 'flex', alignItems: 'center', gap: '2px'
                                                }}>
                                                    Re: {avaliacao.produtoRef.titulo}
                                                    <ChevronRight size={12} />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    )
}