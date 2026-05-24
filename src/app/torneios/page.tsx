'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import {
    ArrowLeft, Search, Trophy, MapPin, Calendar,
    Users, Medal, ChevronRight, Plus
} from 'lucide-react'
import Link from 'next/link'

interface Torneio {
    id: number
    titulo: string
    descricao: string
    modalidade: string
    data: string
    local: string
    participantes: number
    maxParticipantes: number
    status: 'inscricoes' | 'andamento' | 'finalizado'
    premio?: string
    banner?: string
}

const modalidades = ['Todos', 'MTB', 'Speed', 'Downhill', 'BMX', 'Gravel', 'Enduro']

export default function TorneiosPage() {
    const [torneios, setTorneios] = useState<Torneio[]>([])
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState('')
    const [busca, setBusca] = useState('')
    const [modalidade, setModalidade] = useState('Todos')
    const [status, setStatus] = useState<'todos' | 'inscricoes' | 'andamento' | 'finalizado'>('todos')

    const carregarTorneios = async () => {
        setLoading(true)
        setErro('')
        try {
            // const response = await tournamentService.listar({ page: 0, size: 50 })
            // setTorneios(response.data.content || response.data)
            setTorneios([])
        } catch (error) {
            console.error('Erro ao carregar torneios:', error)
            setErro('Erro ao carregar torneios.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        carregarTorneios()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const torneiosFiltrados = torneios.filter(t => {
        if (modalidade !== 'Todos' && t.modalidade !== modalidade) return false
        if (status !== 'todos' && t.status !== status) return false
        if (busca && !t.titulo.toLowerCase().includes(busca.toLowerCase()) && !t.local.toLowerCase().includes(busca.toLowerCase())) return false
        return true
    })

    const formatarData = (data: string) => {
        return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    }

    const getStatusColor = (s: Torneio['status']) => {
        switch (s) {
            case 'inscricoes': return { bg: '#dcfce7', color: '#16A34A', text: 'Inscricoes abertas' }
            case 'andamento': return { bg: '#dbeafe', color: '#3B82F6', text: 'Em andamento' }
            case 'finalizado': return { bg: '#f3f4f6', color: '#6B7280', text: 'Finalizado' }
        }
    }

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingBottom: '70px' }}>
                <Header />
                <div style={{ padding: '16px' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{ height: '160px', backgroundColor: '#eee', borderRadius: '12px', marginBottom: '12px' }} />
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
                    <button onClick={carregarTorneios} style={{
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Link href="/" style={{ display: 'flex', padding: '4px' }}>
                            <ArrowLeft size={20} color="#1a1a1a" />
                        </Link>
                        <h1 style={{ fontSize: '17px', fontWeight: '700', color: '#1a1a1a' }}>Torneios</h1>
                    </div>
                    <Link href="/torneios/criar" style={{
                        padding: '8px 14px', backgroundColor: '#DC2626', color: '#fff',
                        borderRadius: '8px', fontSize: '13px', fontWeight: '600',
                        textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px'
                    }}>
                        <Plus size={15} />
                        Criar
                    </Link>
                </div>
                <div style={{ position: 'relative', marginBottom: '8px' }}>
                    <Search size={14} color="#999" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                    <input
                        type="text" value={busca} onChange={(e) => setBusca(e.target.value)}
                        placeholder="Buscar torneios..."
                        style={{ width: '100%', padding: '9px 12px 9px 32px', backgroundColor: '#f5f5f5', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '13px', color: '#1a1a1a', outline: 'none' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {modalidades.map((mod) => (
                        <button key={mod} onClick={() => setModalidade(mod)} style={{
                            padding: '6px 12px', borderRadius: '20px', whiteSpace: 'nowrap', flexShrink: 0,
                            border: modalidade === mod ? '1.5px solid #DC2626' : '1px solid #e5e5e5',
                            backgroundColor: modalidade === mod ? '#DC2626' : '#fff',
                            color: modalidade === mod ? '#fff' : '#666',
                            fontSize: '12px', fontWeight: modalidade === mod ? '600' : '400',
                            cursor: 'pointer', transition: 'all 0.15s'
                        }}>{mod}</button>
                    ))}
                </div>
            </div>

            {/* Filtro de status */}
            <div style={{ padding: '10px 16px', display: 'flex', gap: '6px' }}>
                {[
                    { key: 'todos' as const, label: 'Todos' },
                    { key: 'inscricoes' as const, label: 'Inscricoes abertas' },
                    { key: 'andamento' as const, label: 'Em andamento' },
                    { key: 'finalizado' as const, label: 'Finalizados' },
                ].map((f) => (
                    <button key={f.key} onClick={() => setStatus(f.key)} style={{
                        padding: '7px 14px', borderRadius: '20px', whiteSpace: 'nowrap',
                        border: status === f.key ? '1.5px solid #DC2626' : '1px solid #e5e5e5',
                        backgroundColor: status === f.key ? '#DC2626' : '#fff',
                        color: status === f.key ? '#fff' : '#666',
                        fontSize: '12px', fontWeight: status === f.key ? '600' : '400',
                        cursor: 'pointer', transition: 'all 0.15s'
                    }}>{f.label}</button>
                ))}
            </div>

            {/* Lista */}
            <div style={{ padding: '0 16px' }}>
                {torneiosFiltrados.length === 0 && !loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <Trophy size={40} color="#ccc" />
                        <p style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a1a', marginTop: '12px' }}>
                            Nenhum torneio encontrado
                        </p>
                        <p style={{ fontSize: '13px', color: '#888', marginTop: '4px', marginBottom: '16px' }}>
                            Crie o primeiro torneio ou mude os filtros
                        </p>
                        <Link href="/torneios/criar" style={{
                            display: 'inline-block', padding: '10px 24px',
                            backgroundColor: '#DC2626', color: '#fff', borderRadius: '8px',
                            fontSize: '14px', fontWeight: '600', textDecoration: 'none'
                        }}>Criar torneio</Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {torneiosFiltrados.map((torneio) => {
                            const statusInfo = getStatusColor(torneio.status)
                            return (
                                <Link key={torneio.id} href={`/torneios/${torneio.id}`} style={{ textDecoration: 'none' }}>
                                    <div style={{
                                        backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden',
                                        border: '1px solid #e5e5e5'
                                    }}>
                                        {torneio.banner && (
                                            <div style={{
                                                height: '120px', backgroundImage: `url(${torneio.banner})`,
                                                backgroundSize: 'cover', backgroundPosition: 'center'
                                            }} />
                                        )}
                                        <div style={{ padding: '14px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                                <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a1a', flex: 1, marginRight: '8px' }}>
                                                    {torneio.titulo}
                                                </h3>
                                                <span style={{
                                                    fontSize: '10px', fontWeight: '600', padding: '4px 8px', borderRadius: '6px',
                                                    backgroundColor: statusInfo.bg, color: statusInfo.color, whiteSpace: 'nowrap'
                                                }}>
                                                    {statusInfo.text}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#888' }}>
                                                    <Calendar size={12} /> {formatarData(torneio.data)}
                                                </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#888' }}>
                                                    <MapPin size={12} /> {torneio.local}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', gap: '12px' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#888' }}>
                                                        <Users size={12} /> {torneio.participantes}/{torneio.maxParticipantes}
                                                    </span>
                                                    {torneio.premio && (
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#FFB800', fontWeight: '600' }}>
                                                            <Medal size={12} /> {torneio.premio}
                                                        </span>
                                                    )}
                                                </div>
                                                <ChevronRight size={16} color="#ccc" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    )
}