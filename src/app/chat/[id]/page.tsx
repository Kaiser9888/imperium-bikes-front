'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Send, Phone, MoreHorizontal, Check, CheckCheck } from 'lucide-react'
import Link from 'next/link'

interface Mensagem {
    id: number
    texto: string
    enviada: boolean
    horario: string
    lida: boolean
}

export default function ChatConversaPage() {
    const params = useParams()
    const [mensagens, setMensagens] = useState<Mensagem[]>([])
    const [loading, setLoading] = useState(true)
    const [novaMensagem, setNovaMensagem] = useState('')
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        async function carregar() {
            setLoading(true)
            try {
                // const response = await api.get(`/api/chat/${params.id}/messages`)
                // setMensagens(response.data)
                setMensagens([])
            } catch (error) {
                console.error('Erro ao carregar mensagens:', error)
            } finally {
                setLoading(false)
            }
        }
        carregar()
    }, [params.id])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [mensagens])

    const enviar = async () => {
        if (!novaMensagem.trim()) return

        const agora = new Date()
        const horario = `${agora.getHours().toString().padStart(2, '0')}:${agora.getMinutes().toString().padStart(2, '0')}`

        const msg: Mensagem = {
            id: Date.now(),
            texto: novaMensagem,
            enviada: true,
            horario,
            lida: false
        }

        setMensagens(prev => [...prev, msg])
        setNovaMensagem('')

        try {
            // await api.post(`/api/chat/${params.id}/messages`, { content: novaMensagem })
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            enviar()
        }
    }

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
                <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e5e5', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#eee' }} />
                    <div style={{ flex: 1 }}>
                        <div style={{ height: '16px', backgroundColor: '#eee', borderRadius: '4px', width: '40%' }} />
                    </div>
                </div>
                <div style={{ flex: 1, padding: '16px' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{ height: '40px', backgroundColor: '#eee', borderRadius: '12px', width: i % 2 === 0 ? '70%' : '50%', marginBottom: '8px', marginLeft: i % 2 === 0 ? 'auto' : '0' }} />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
            <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e5e5', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px', position: 'sticky', top: 0, zIndex: 40 }}>
                <Link href="/chat" style={{ display: 'flex', padding: '4px' }}>
                    <ArrowLeft size={20} color="#1a1a1a" />
                </Link>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '16px', fontWeight: 'bold', flexShrink: 0 }}>
                    ?
                </div>
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>Conversa</p>
                </div>
                <button style={headerBtn}><Phone size={18} color="#1a1a1a" /></button>
                <button style={headerBtn}><MoreHorizontal size={18} color="#1a1a1a" /></button>
            </div>

            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {mensagens.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888', fontSize: '14px' }}>
                        Nenhuma mensagem. Inicie a conversa!
                    </div>
                )}
                {mensagens.map((msg) => (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: msg.enviada ? 'flex-end' : 'flex-start' }}>
                        <div style={{
                            maxWidth: '75%', padding: '10px 14px',
                            borderRadius: msg.enviada ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                            backgroundColor: msg.enviada ? '#DC2626' : '#fff',
                            color: msg.enviada ? '#fff' : '#1a1a1a',
                            fontSize: '14px', lineHeight: '1.4',
                            border: msg.enviada ? 'none' : '1px solid #e5e5e5'
                        }}>
                            <p>{msg.texto}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', marginTop: '4px' }}>
                                <span style={{ fontSize: '10px', color: msg.enviada ? 'rgba(255,255,255,0.7)' : '#aaa' }}>{msg.horario}</span>
                                {msg.enviada && (msg.lida ? <CheckCheck size={12} color="rgba(255,255,255,0.7)" /> : <Check size={12} color="rgba(255,255,255,0.7)" />)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ backgroundColor: '#fff', borderTop: '1px solid #e5e5e5', padding: '10px 12px', display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                <textarea
                    value={novaMensagem}
                    onChange={(e) => setNovaMensagem(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Digite sua mensagem..."
                    rows={1}
                    style={{ flex: 1, padding: '10px 14px', backgroundColor: '#f5f5f5', border: '1px solid #e5e5e5', borderRadius: '20px', fontSize: '14px', color: '#1a1a1a', outline: 'none', resize: 'none', fontFamily: 'inherit', maxHeight: '100px' }}
                />
                <button onClick={enviar} disabled={!novaMensagem.trim()} style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    backgroundColor: novaMensagem.trim() ? '#DC2626' : '#e5e5e5',
                    border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: novaMensagem.trim() ? 'pointer' : 'default', flexShrink: 0
                }}>
                    <Send size={18} color={novaMensagem.trim() ? '#fff' : '#999'} />
                </button>
            </div>
        </div>
    )
}

const headerBtn: React.CSSProperties = {
    background: 'none', border: 'none', padding: '6px', cursor: 'pointer', display: 'flex'
}