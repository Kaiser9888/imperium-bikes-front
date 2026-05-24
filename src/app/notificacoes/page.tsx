'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import {
    ArrowLeft, Bell, ShoppingBag, Trophy, MessageCircle,
    Star, Heart, User, Check
} from 'lucide-react'
import Link from 'next/link'

interface Notificacao {
    id: number
    tipo: 'compra' | 'venda' | 'mensagem' | 'torneio' | 'avaliacao' | 'favorito' | 'seguidor' | 'sistema'
    titulo: string
    descricao: string
    lida: boolean
    data: string
    link?: string
}

export default function NotificacoesPage() {
    const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
    const [loading, setLoading] = useState(true)
    const [filtro, setFiltro] = useState<'todas' | 'nao-lidas'>('todas')

    useState(() => {
        async function carregar() {
            setLoading(true)
            try {
                // const response = await api.get('/api/notifications')
                // setNotificacoes(response.data)
                setNotificacoes([])
            } catch (error) {
                console.error('Erro ao carregar notificacoes:', error)
            } finally {
                setLoading(false)
            }
        }
        carregar()
    })

    const marcarTodasComoLidas = () => {
        setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })))
    }

    const marcarComoLida = (id: number) => {
        setNotificacoes(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n))
    }

    const getIcone = (tipo: Notificacao['tipo']) => {
        const iconProps = { size: 18 }
        switch (tipo) {
            case 'compra': return <ShoppingBag {...iconProps} color="#16A34A" />
            case 'venda': return <ShoppingBag {...iconProps} color="#DC2626" />
            case 'mensagem': return <MessageCircle {...iconProps} color="#3B82F6" />
            case 'torneio': return <Trophy {...iconProps} color="#FFB800" />
            case 'avaliacao': return <Star {...iconProps} color="#FFB800" />
            case 'favorito': return <Heart {...iconProps} color="#DC2626" />
            case 'seguidor': return <User {...iconProps} color="#8B5CF6" />
            case 'sistema': return <Bell {...iconProps} color="#6B7280" />
        }
    }

    const getCorFundo = (tipo: Notificacao['tipo']) => {
        switch (tipo) {
            case 'compra': return '#dcfce7'
            case 'venda': return '#fee2e2'
            case 'mensagem': return '#dbeafe'
            case 'torneio': return '#fef9c3'
            case 'avaliacao': return '#fef9c3'
            case 'favorito': return '#fee2e2'
            case 'seguidor': return '#f3e8ff'
            case 'sistema': return '#f3f4f6'
        }
    }

    const formatarData = (data: string) => {
        const d = new Date(data)
        const agora = new Date()
        const diff = agora.getTime() - d.getTime()
        const minutos = Math.floor(diff / 60000)
        const horas = Math.floor(diff / 3600000)
        const dias = Math.floor(diff / 86400000)

        if (minutos < 1) return 'Agora'
        if (minutos < 60) return `${minutos}min`
        if (horas < 24) return `${horas}h`
        if (dias < 7) return `${dias}d`
        return d.toLocaleDateString('pt-BR')
    }

    const notificacoesFiltradas = filtro === 'nao-lidas'
        ? notificacoes.filter(n => !n.lida)
        : notificacoes

    const naoLidas = notificacoes.filter(n => !n.lida).length

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingBottom: '70px' }}>
                <Header />
                <div style={{ padding: '16px' }}>
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} style={{ display: 'flex', gap: '12px', padding: '14px 0', borderBottom: '1px solid #f0f0f0' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#eee' }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ height: '14px', backgroundColor: '#eee', borderRadius: '4px', width: '60%', marginBottom: '6px' }} />
                                <div style={{ height: '12px', backgroundColor: '#eee', borderRadius: '4px', width: '80%' }} />
                            </div>
                        </div>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Link href="/" style={{ display: 'flex', padding: '4px' }}>
                            <ArrowLeft size={20} color="#1a1a1a" />
                        </Link>
                        <h1 style={{ fontSize: '17px', fontWeight: '700', color: '#1a1a1a' }}>Notificacoes</h1>
                        {naoLidas > 0 && (
                            <span style={{
                                backgroundColor: '#DC2626', color: '#fff', fontSize: '11px',
                                fontWeight: '700', padding: '2px 8px', borderRadius: '10px'
                            }}>
                                {naoLidas}
                            </span>
                        )}
                    </div>
                    {naoLidas > 0 && (
                        <button onClick={marcarTodasComoLidas} style={{
                            background: 'none', border: 'none', color: '#DC2626',
                            fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '4px'
                        }}>
                            <Check size={15} />
                            Marcar todas
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => setFiltro('todas')} style={{
                        padding: '7px 14px', borderRadius: '20px',
                        border: filtro === 'todas' ? '1.5px solid #DC2626' : '1px solid #e5e5e5',
                        backgroundColor: filtro === 'todas' ? '#DC2626' : '#fff',
                        color: filtro === 'todas' ? '#fff' : '#666',
                        fontSize: '12px', fontWeight: filtro === 'todas' ? '600' : '400',
                        cursor: 'pointer', transition: 'all 0.15s'
                    }}>
                        Todas ({notificacoes.length})
                    </button>
                    <button onClick={() => setFiltro('nao-lidas')} style={{
                        padding: '7px 14px', borderRadius: '20px',
                        border: filtro === 'nao-lidas' ? '1.5px solid #DC2626' : '1px solid #e5e5e5',
                        backgroundColor: filtro === 'nao-lidas' ? '#DC2626' : '#fff',
                        color: filtro === 'nao-lidas' ? '#fff' : '#666',
                        fontSize: '12px', fontWeight: filtro === 'nao-lidas' ? '600' : '400',
                        cursor: 'pointer', transition: 'all 0.15s'
                    }}>
                        Nao lidas ({naoLidas})
                    </button>
                </div>
            </div>

            {/* Lista */}
            <div style={{ padding: '0 16px' }}>
                {notificacoesFiltradas.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <Bell size={40} color="#ccc" />
                        <p style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a1a', marginTop: '12px' }}>
                            {filtro === 'nao-lidas' ? 'Nenhuma notificacao nova' : 'Nenhuma notificacao'}
                        </p>
                        <p style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>
                            {filtro === 'nao-lidas' ? 'Voce esta em dia!' : 'As notificacoes aparecerao aqui'}
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {notificacoesFiltradas.map((notif) => {
                            const conteudo = (
                                <div
                                    key={notif.id}
                                    onClick={() => marcarComoLida(notif.id)}
                                    style={{
                                        display: 'flex', gap: '12px', padding: '14px 0',
                                        borderBottom: '1px solid #f0f0f0',
                                        cursor: notif.link ? 'pointer' : 'default',
                                        opacity: notif.lida ? 0.6 : 1
                                    }}
                                >
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '50%',
                                        backgroundColor: getCorFundo(notif.tipo),
                                        display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', flexShrink: 0
                                    }}>
                                        {getIcone(notif.tipo)}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                            <span style={{ fontSize: '14px', fontWeight: notif.lida ? '400' : '600', color: '#1a1a1a' }}>
                                                {notif.titulo}
                                            </span>
                                            <span style={{ fontSize: '11px', color: '#aaa', flexShrink: 0, marginLeft: '8px' }}>
                                                {formatarData(notif.data)}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '13px', color: '#888', lineHeight: '1.4' }}>
                                            {notif.descricao}
                                        </p>
                                    </div>
                                    {!notif.lida && (
                                        <div style={{
                                            width: '8px', height: '8px', borderRadius: '50%',
                                            backgroundColor: '#DC2626', flexShrink: 0,
                                            alignSelf: 'center'
                                        }} />
                                    )}
                                </div>
                            )

                            return notif.link ? (
                                <Link key={notif.id} href={notif.link} style={{ textDecoration: 'none' }}>
                                    {conteudo}
                                </Link>
                            ) : (
                                conteudo
                            )
                        })}
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    )
}