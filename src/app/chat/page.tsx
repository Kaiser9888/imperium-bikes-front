'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { ArrowLeft, Search, MessageCircle } from 'lucide-react'
import Link from 'next/link'

interface Conversa {
    id: number
    usuario: {
        id: number
        nome: string
        avatar: string | null
        online: boolean
    }
    ultimaMensagem: string
    horario: string
    naoLidas: number
    produtoRef?: string
}

export default function ChatListaPage() {
    const [conversas, setConversas] = useState<Conversa[]>([])
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState('')
    const [busca, setBusca] = useState('')

    const carregarConversas = async () => {
        setLoading(true)
        setErro('')
        try {
            // const response = await api.get('/api/chat/conversations')
            // setConversas(response.data)

            // Fallback: array vazio ate API funcionar
            setConversas([])
        } catch (error) {
            console.error('Erro ao carregar conversas:', error)
            setErro('Erro ao carregar mensagens.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        carregarConversas()
    }, [])

    const conversasFiltradas = conversas.filter(c =>
        c.usuario.nome.toLowerCase().includes(busca.toLowerCase()) ||
        c.ultimaMensagem.toLowerCase().includes(busca.toLowerCase())
    )

    const getInicial = (nome: string) => nome.charAt(0).toUpperCase()

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingBottom: '70px' }}>
                <Header />
                <div style={{ padding: '16px' }}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            padding: '14px 0', borderBottom: '1px solid #f0f0f0'
                        }}>
                            <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#eee' }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ height: '16px', backgroundColor: '#eee', borderRadius: '4px', width: '40%', marginBottom: '6px' }} />
                                <div style={{ height: '14px', backgroundColor: '#eee', borderRadius: '4px', width: '70%' }} />
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
                    <button onClick={carregarConversas} style={{
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                    <Link href="/" style={{ display: 'flex', padding: '4px' }}>
                        <ArrowLeft size={20} color="#1a1a1a" />
                    </Link>
                    <h1 style={{ fontSize: '17px', fontWeight: '700', color: '#1a1a1a' }}>Mensagens</h1>
                    {conversas.length > 0 && (
                        <span style={{ fontSize: '13px', color: '#888' }}>({conversas.length})</span>
                    )}
                </div>
                <div style={{ position: 'relative' }}>
                    <Search size={14} color="#999" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                    <input
                        type="text" value={busca} onChange={(e) => setBusca(e.target.value)}
                        placeholder="Buscar conversas..."
                        style={{ width: '100%', padding: '9px 12px 9px 32px', backgroundColor: '#f5f5f5', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '13px', color: '#1a1a1a', outline: 'none' }}
                    />
                </div>
            </div>

            <div style={{ padding: '8px 16px' }}>
                {conversasFiltradas.length === 0 && !loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <MessageCircle size={40} color="#ccc" />
                        <p style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a1a', marginTop: '12px' }}>
                            {busca ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa'}
                        </p>
                        <p style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>
                            {busca ? 'Tente outro termo de busca' : 'Suas mensagens aparecerao aqui'}
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {conversasFiltradas.map((conversa) => (
                            <Link key={conversa.id} href={`/chat/${conversa.id}`} style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '14px 0', textDecoration: 'none', borderBottom: '1px solid #f0f0f0'
                            }}>
                                <div style={{ position: 'relative', flexShrink: 0 }}>
                                    <div style={{
                                        width: '50px', height: '50px', borderRadius: '50%',
                                        backgroundColor: '#DC2626', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                        color: '#fff', fontSize: '20px', fontWeight: 'bold'
                                    }}>
                                        {getInicial(conversa.usuario.nome)}
                                    </div>
                                    {conversa.usuario.online && (
                                        <div style={{ position: 'absolute', bottom: '0px', right: '0px', width: '13px', height: '13px', borderRadius: '50%', backgroundColor: '#22C55E', border: '2px solid #fff' }} />
                                    )}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                        <span style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a1a' }}>{conversa.usuario.nome}</span>
                                        <span style={{ fontSize: '11px', color: '#aaa' }}>{conversa.horario}</span>
                                    </div>
                                    <p style={{ fontSize: '13px', color: conversa.naoLidas > 0 ? '#1a1a1a' : '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: conversa.naoLidas > 0 ? '600' : '400' }}>
                                        {conversa.ultimaMensagem}
                                    </p>
                                    {conversa.produtoRef && (
                                        <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: '500' }}>Re: {conversa.produtoRef}</span>
                                    )}
                                </div>
                                {conversa.naoLidas > 0 && (
                                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <span style={{ color: '#fff', fontSize: '11px', fontWeight: '700' }}>{conversa.naoLidas}</span>
                                    </div>
                                )}
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    )
}