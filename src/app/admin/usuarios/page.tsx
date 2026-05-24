'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import {
    ArrowLeft, Search, User, Star, Calendar,
    Ban, Check, Shield, MoreHorizontal, X, Mail
} from 'lucide-react'
import Link from 'next/link'

interface UsuarioAdmin {
    id: number
    nome: string
    email: string
    avatar: string | null
    reputacao: number
    dataCadastro: string
    status: 'ativo' | 'suspenso' | 'banido'
    role: 'USER' | 'ADMIN'
    totalAnuncios: number
    totalVendas: number
}

export default function GerenciarUsuariosPage() {
    const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([])
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState('')
    const [busca, setBusca] = useState('')
    const [filtro, setFiltro] = useState<'todos' | 'ativos' | 'suspensos' | 'banidos'>('todos')

    const carregarUsuarios = async () => {
        setLoading(true)
        setErro('')
        try {
            // const response = await api.get('/api/admin/users')
            // setUsuarios(response.data.content || response.data)
            setUsuarios([])
        } catch (error) {
            console.error('Erro ao carregar usuarios:', error)
            setErro('Erro ao carregar usuarios.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        carregarUsuarios()
    }, [])

    const handleAcao = async (id: number, acao: 'suspender' | 'banir' | 'reativar') => {
        if (!confirm(`Tem certeza que deseja ${acao} este usuario?`)) return
        try {
            // await api.post(`/api/admin/users/${id}/${acao}`)
            setUsuarios(prev => prev.map(u => {
                if (u.id !== id) return u
                const novoStatus = acao === 'reativar' ? 'ativo' : acao === 'suspender' ? 'suspenso' : 'banido'
                return { ...u, status: novoStatus }
            }))
        } catch (error) {
            console.error('Erro ao processar acao:', error)
        }
    }

    const getInicial = (nome: string) => nome.charAt(0).toUpperCase()

    const formatarData = (data: string) => {
        return new Date(data).toLocaleDateString('pt-BR')
    }

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'ativo': return { bg: '#DCFCE7', color: '#16A34A', text: 'Ativo' }
            case 'suspenso': return { bg: '#FEF3C7', color: '#D97706', text: 'Suspenso' }
            case 'banido': return { bg: '#FEE2E2', color: '#DC2626', text: 'Banido' }
            default: return { bg: '#f3f4f6', color: '#888', text: status }
        }
    }

    const usuariosFiltrados = usuarios.filter(u => {
        if (filtro === 'ativos' && u.status !== 'ativo') return false
        if (filtro === 'suspensos' && u.status !== 'suspenso') return false
        if (filtro === 'banidos' && u.status !== 'banido') return false
        if (busca && !u.nome.toLowerCase().includes(busca.toLowerCase()) && !u.email.toLowerCase().includes(busca.toLowerCase())) return false
        return true
    })

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingBottom: '70px' }}>
                <Header />
                <div style={{ padding: '16px' }}>
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} style={{ display: 'flex', gap: '10px', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#eee' }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ height: '14px', backgroundColor: '#eee', borderRadius: '4px', width: '50%', marginBottom: '6px' }} />
                                <div style={{ height: '12px', backgroundColor: '#eee', borderRadius: '4px', width: '30%' }} />
                            </div>
                        </div>
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
                    <button onClick={carregarUsuarios} style={{
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
                    <h1 style={{ fontSize: '17px', fontWeight: '700', color: '#1a1a1a' }}>Usuarios</h1>
                    <span style={{ fontSize: '13px', color: '#888' }}>({usuarios.length})</span>
                </div>
                <div style={{ position: 'relative' }}>
                    <Search size={14} color="#999" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                    <input
                        type="text" value={busca} onChange={(e) => setBusca(e.target.value)}
                        placeholder="Buscar por nome ou email..."
                        style={{ width: '100%', padding: '9px 12px 9px 32px', backgroundColor: '#f5f5f5', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '13px', color: '#1a1a1a', outline: 'none' }}
                    />
                </div>
            </div>

            {/* Tabs */}
            <div style={{ padding: '10px 16px', display: 'flex', gap: '6px', overflowX: 'auto' }}>
                {[
                    { key: 'todos' as const, label: `Todos (${usuarios.length})` },
                    { key: 'ativos' as const, label: `Ativos (${usuarios.filter(u => u.status === 'ativo').length})` },
                    { key: 'suspensos' as const, label: 'Suspensos' },
                    { key: 'banidos' as const, label: 'Banidos' },
                ].map(tab => (
                    <button key={tab.key} onClick={() => setFiltro(tab.key)} style={{
                        padding: '7px 14px', borderRadius: '20px', whiteSpace: 'nowrap', flexShrink: 0,
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
                {usuariosFiltrados.length === 0 && !loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <User size={40} color="#ccc" />
                        <p style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a1a', marginTop: '12px' }}>
                            Nenhum usuario encontrado
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {usuariosFiltrados.map((usuario) => {
                            const statusStyle = getStatusStyle(usuario.status)
                            return (
                                <div key={usuario.id} style={{
                                    display: 'flex', gap: '10px', padding: '14px 0',
                                    borderBottom: '1px solid #f0f0f0', alignItems: 'center'
                                }}>
                                    {/* Avatar */}
                                    <div style={{
                                        width: '44px', height: '44px', borderRadius: '50%',
                                        backgroundColor: '#DC2626', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                        color: '#fff', fontSize: '17px', fontWeight: 'bold',
                                        flexShrink: 0, position: 'relative'
                                    }}>
                                        {getInicial(usuario.nome)}
                                        <div style={{
                                            position: 'absolute', bottom: '-1px', right: '-1px',
                                            width: '12px', height: '12px', borderRadius: '50%',
                                            backgroundColor: usuario.status === 'ativo' ? '#22C55E' : usuario.status === 'suspenso' ? '#D97706' : '#DC2626',
                                            border: '2px solid #fff'
                                        }} />
                                    </div>

                                    {/* Info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>{usuario.nome}</span>
                                            {usuario.role === 'ADMIN' && (
                                                <Shield size={12} color="#DC2626" />
                                            )}
                                        </div>
                                        <p style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>{usuario.email}</p>
                                        <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: '#aaa' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                                <Star size={10} color="#FFB800" fill="#FFB800" /> {usuario.reputacao.toFixed(1)}
                                            </span>
                                            <span>{usuario.totalAnuncios} anuncios</span>
                                            <span>{usuario.totalVendas} vendas</span>
                                            <span>{formatarData(usuario.dataCadastro)}</span>
                                        </div>
                                    </div>

                                    {/* Status + Acoes */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                                        <span style={{
                                            fontSize: '10px', fontWeight: '600', padding: '3px 8px', borderRadius: '4px',
                                            backgroundColor: statusStyle.bg, color: statusStyle.color
                                        }}>
                                            {statusStyle.text}
                                        </span>

                                        {usuario.role !== 'ADMIN' && (
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                {usuario.status !== 'banido' && (
                                                    <>
                                                        {usuario.status === 'ativo' ? (
                                                            <button onClick={() => handleAcao(usuario.id, 'suspender')} style={actionBtn('#D97706')}>
                                                                <Ban size={12} />
                                                            </button>
                                                        ) : (
                                                            <button onClick={() => handleAcao(usuario.id, 'reativar')} style={actionBtn('#16A34A')}>
                                                                <Check size={12} />
                                                            </button>
                                                        )}
                                                        <button onClick={() => handleAcao(usuario.id, 'banir')} style={actionBtn('#DC2626')}>
                                                            <X size={12} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        )}
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

const actionBtn = (color: string): React.CSSProperties => ({
    width: '28px', height: '28px', borderRadius: '6px',
    border: `1px solid ${color}20`, backgroundColor: `${color}10`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: color
})