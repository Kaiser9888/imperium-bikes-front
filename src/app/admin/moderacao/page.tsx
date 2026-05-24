'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import {
    ArrowLeft, Search, Package, Flag, Check, X,
    Eye, AlertTriangle, User, Calendar, MapPin
} from 'lucide-react'
import Link from 'next/link'

interface Denuncia {
    id: number
    motivo: string
    descricao: string
    data: string
    status: 'pendente' | 'aprovada' | 'rejeitada'
    denunciante: {
        id: number
        nome: string
    }
    produto: {
        id: number
        titulo: string
        preco: number
        imagem: string | null
        vendedor: string
        status: string
    }
}

export default function ModeracaoPage() {
    const [denuncias, setDenuncias] = useState<Denuncia[]>([])
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState('')
    const [busca, setBusca] = useState('')
    const [filtro, setFiltro] = useState<'todas' | 'pendentes' | 'aprovadas' | 'rejeitadas'>('pendentes')

    const carregarDenuncias = async () => {
        setLoading(true)
        setErro('')
        try {
            // const response = await api.get('/api/admin/reports', { params: { status: filtro } })
            // setDenuncias(response.data.content || response.data)
            setDenuncias([])
        } catch (error) {
            console.error('Erro ao carregar denuncias:', error)
            setErro('Erro ao carregar denuncias.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        carregarDenuncias()
    }, [filtro])

    const handleAcao = async (id: number, acao: 'aprovar' | 'rejeitar') => {
        try {
            // await api.post(`/api/admin/reports/${id}/review`, { action: acao })
            setDenuncias(prev => prev.map(d =>
                d.id === id ? { ...d, status: acao === 'aprovar' ? 'aprovada' : 'rejeitada' } : d
            ))
        } catch (error) {
            console.error('Erro ao processar denuncia:', error)
        }
    }

    const formatarData = (data: string) => {
        return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    }

    const formatarPreco = (valor: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
    }

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'pendente': return { bg: '#FEF3C7', color: '#D97706', text: 'Pendente' }
            case 'aprovada': return { bg: '#DCFCE7', color: '#16A34A', text: 'Aprovada' }
            case 'rejeitada': return { bg: '#F3F4F6', color: '#6B7280', text: 'Rejeitada' }
            default: return { bg: '#f3f4f6', color: '#888', text: status }
        }
    }

    const denunciasFiltradas = denuncias.filter(d => {
        if (busca && !d.produto.titulo.toLowerCase().includes(busca.toLowerCase())) return false
        return true
    })

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingBottom: '70px' }}>
                <Header />
                <div style={{ padding: '16px' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{ height: '140px', backgroundColor: '#eee', borderRadius: '12px', marginBottom: '10px' }} />
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
                    <button onClick={carregarDenuncias} style={{
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

            {/* Header */}
            <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e5e5', padding: '10px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                    <Link href="/admin" style={{ display: 'flex', padding: '4px' }}>
                        <ArrowLeft size={20} color="#1a1a1a" />
                    </Link>
                    <h1 style={{ fontSize: '17px', fontWeight: '700', color: '#1a1a1a' }}>Moderacao</h1>
                </div>
                <div style={{ position: 'relative' }}>
                    <Search size={14} color="#999" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                    <input
                        type="text" value={busca} onChange={(e) => setBusca(e.target.value)}
                        placeholder="Buscar denuncias..."
                        style={{ width: '100%', padding: '9px 12px 9px 32px', backgroundColor: '#f5f5f5', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '13px', color: '#1a1a1a', outline: 'none' }}
                    />
                </div>
            </div>

            {/* Tabs */}
            <div style={{ padding: '10px 16px', display: 'flex', gap: '6px' }}>
                {[
                    { key: 'pendentes' as const, label: 'Pendentes' },
                    { key: 'aprovadas' as const, label: 'Aprovadas' },
                    { key: 'rejeitadas' as const, label: 'Rejeitadas' },
                    { key: 'todas' as const, label: 'Todas' },
                ].map(tab => (
                    <button key={tab.key} onClick={() => setFiltro(tab.key)} style={{
                        padding: '7px 14px', borderRadius: '20px', whiteSpace: 'nowrap',
                        border: filtro === tab.key ? '1.5px solid #DC2626' : '1px solid #e5e5e5',
                        backgroundColor: filtro === tab.key ? '#DC2626' : '#fff',
                        color: filtro === tab.key ? '#fff' : '#666',
                        fontSize: '12px', fontWeight: filtro === tab.key ? '600' : '400',
                        cursor: 'pointer', transition: 'all 0.15s'
                    }}>{tab.label}</button>
                ))}
            </div>

            {/* Lista */}
            <div style={{ padding: '0 16px' }}>
                {denunciasFiltradas.length === 0 && !loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <Flag size={40} color="#ccc" />
                        <p style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a1a', marginTop: '12px' }}>
                            Nenhuma denuncia {filtro !== 'todas' ? filtro : 'encontrada'}
                        </p>
                        <p style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>
                            {filtro === 'pendentes' ? 'Nao ha denuncias pendentes!' : 'Mude o filtro para ver outras'}
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {denunciasFiltradas.map((denuncia) => {
                            const statusStyle = getStatusStyle(denuncia.status)
                            return (
                                <div key={denuncia.id} style={{
                                    backgroundColor: '#fff', borderRadius: '12px', padding: '14px',
                                    border: '1px solid #e5e5e5',
                                    borderLeft: denuncia.status === 'pendente' ? '3px solid #D97706' : '3px solid #e5e5e5'
                                }}>
                                    {/* Cabecalho */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <span style={{
                                            fontSize: '10px', fontWeight: '600', padding: '3px 8px', borderRadius: '4px',
                                            backgroundColor: statusStyle.bg, color: statusStyle.color
                                        }}>
                                            {statusStyle.text}
                                        </span>
                                        <span style={{ fontSize: '11px', color: '#aaa' }}>
                                            {formatarData(denuncia.data)}
                                        </span>
                                    </div>

                                    {/* Produto */}
                                    <Link href={`/produto/${denuncia.produto.id}`} style={{ textDecoration: 'none', display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                        <div style={{
                                            width: '60px', height: '60px', borderRadius: '8px',
                                            backgroundColor: denuncia.produto.imagem ? undefined : '#e5e5e5',
                                            backgroundImage: denuncia.produto.imagem ? `url(${denuncia.produto.imagem})` : undefined,
                                            backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0
                                        }} />
                                        <div>
                                            <p style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>
                                                {denuncia.produto.titulo}
                                            </p>
                                            <p style={{ fontSize: '14px', fontWeight: '700', color: '#DC2626' }}>
                                                {formatarPreco(denuncia.produto.preco)}
                                            </p>
                                            <p style={{ fontSize: '11px', color: '#888' }}>
                                                Vendedor: {denuncia.produto.vendedor}
                                            </p>
                                        </div>
                                    </Link>

                                    {/* Denuncia */}
                                    <div style={{ backgroundColor: '#f9f9f9', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                            <Flag size={13} color="#DC2626" />
                                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#DC2626' }}>
                                                {denuncia.motivo}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '12px', color: '#666', lineHeight: '1.4' }}>
                                            {denuncia.descricao}
                                        </p>
                                        <p style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>
                                            Denunciado por: {denuncia.denunciante.nome}
                                        </p>
                                    </div>

                                    {/* Acoes (apenas pendentes) */}
                                    {denuncia.status === 'pendente' && (
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => handleAcao(denuncia.id, 'rejeitar')} style={{
                                                flex: 1, padding: '10px', display: 'flex', alignItems: 'center',
                                                justifyContent: 'center', gap: '6px', backgroundColor: '#fff',
                                                border: '1px solid #e5e5e5', borderRadius: '8px', color: '#666',
                                                fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                                            }}>
                                                <X size={15} /> Rejeitar
                                            </button>
                                            <button onClick={() => handleAcao(denuncia.id, 'aprovar')} style={{
                                                flex: 1, padding: '10px', display: 'flex', alignItems: 'center',
                                                justifyContent: 'center', gap: '6px', backgroundColor: '#DC2626',
                                                border: 'none', borderRadius: '8px', color: '#fff',
                                                fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                                            }}>
                                                <Check size={15} /> Aprovar
                                            </button>
                                        </div>
                                    )}
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