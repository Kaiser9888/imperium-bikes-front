'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import {
    ArrowLeft, ThumbsUp, ThumbsDown, MessageCircle,
    Clock, Send, ChevronDown, ChevronUp
} from 'lucide-react'
import Link from 'next/link'

interface Comentario {
    id: number
    autor: { id: number; nome: string; avatar: string | null }
    conteudo: string
    data: string
    votos: number
    respostas?: Comentario[]
}

interface TopicoDetalhe {
    id: number
    titulo: string
    autor: { id: number; nome: string; avatar: string | null }
    categoria: string
    conteudo: string
    data: string
    votos: number
    visualizacoes: number
    comentarios: Comentario[]
}

export default function TopicoDetalhePage() {
    const params = useParams()
    const id = params.id

    const [topico, setTopico] = useState<TopicoDetalhe | null>(null)
    const [loading, setLoading] = useState(true)
    const [novaResposta, setNovaResposta] = useState('')
    const [respondendo, setRespondendo] = useState<number | null>(null)
    const [respostaTexto, setRespostaTexto] = useState('')
    const [votoTopico, setVotoTopico] = useState<'up' | 'down' | null>(null)

    useEffect(() => {
        async function carregar() {
            setLoading(true)
            try {
                // const response = await api.get(`/api/forum/posts/${id}`)
                // setTopico(response.data)

                // Fallback vazio
                setTopico(null)
            } catch (error) {
                console.error('Erro ao carregar topico:', error)
            } finally {
                setLoading(false)
            }
        }
        if (id) carregar()
    }, [id])

    const getInicial = (nome: string) => nome.charAt(0).toUpperCase()
    const formatarData = (data: string) => new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingBottom: '70px' }}>
                <Header />
                <div style={{ padding: '16px' }}>
                    <div style={{ height: '200px', backgroundColor: '#eee', borderRadius: '10px', marginBottom: '16px' }} />
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{ height: '100px', backgroundColor: '#eee', borderRadius: '10px', marginBottom: '8px' }} />
                    ))}
                </div>
                <BottomNav />
            </div>
        )
    }

    if (!topico) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingBottom: '70px' }}>
                <Header />
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <MessageCircle size={40} color="#ccc" />
                    <p style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a1a', marginTop: '12px' }}>Topico nao encontrado</p>
                    <Link href="/forum" style={{ display: 'inline-block', marginTop: '16px', padding: '10px 24px', backgroundColor: '#DC2626', color: '#fff', borderRadius: '8px', fontSize: '14px', fontWeight: '600', textDecoration: 'none' }}>
                        Voltar ao forum
                    </Link>
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
                    <Link href="/forum" style={{ display: 'flex', padding: '4px' }}>
                        <ArrowLeft size={20} color="#1a1a1a" />
                    </Link>
                    <h1 style={{ fontSize: '17px', fontWeight: '700', color: '#1a1a1a' }}>Topico</h1>
                </div>
            </div>

            <div style={{ padding: '16px' }}>
                {/* Topico principal */}
                <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '16px', border: '1px solid #e5e5e5', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '15px', fontWeight: 'bold' }}>
                            {getInicial(topico.autor.nome)}
                        </div>
                        <div>
                            <p style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>{topico.autor.nome}</p>
                            <p style={{ fontSize: '11px', color: '#888' }}>{formatarData(topico.data)}</p>
                        </div>
                        <span style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: '600', color: '#DC2626', backgroundColor: '#FEE2E2', padding: '3px 8px', borderRadius: '4px' }}>
                            {topico.categoria}
                        </span>
                    </div>

                    <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a', marginBottom: '10px' }}>{topico.titulo}</h2>
                    <p style={{ fontSize: '14px', color: '#444', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{topico.conteudo}</p>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f0f0f0' }}>
                        <button onClick={() => setVotoTopico(votoTopico === 'up' ? null : 'up')} style={{ ...votoBtn, color: votoTopico === 'up' ? '#16A34A' : '#888' }}>
                            <ThumbsUp size={15} /> {topico.votos}
                        </button>
                        <button onClick={() => setVotoTopico(votoTopico === 'down' ? null : 'down')} style={{ ...votoBtn, color: votoTopico === 'down' ? '#DC2626' : '#888' }}>
                            <ThumbsDown size={15} />
                        </button>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '12px', color: '#888', marginLeft: 'auto' }}>
                            <MessageCircle size={13} /> {topico.comentarios.length} respostas
                        </span>
                    </div>
                </div>

                {/* Respostas */}
                <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a1a', marginBottom: '10px' }}>
                    Respostas ({topico.comentarios.length})
                </h3>

                {topico.comentarios.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px', backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #e5e5e5' }}>
                        <p style={{ fontSize: '13px', color: '#888' }}>Nenhuma resposta ainda. Seja o primeiro!</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {topico.comentarios.map((comentario) => (
                            <div key={comentario.id} style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '14px', border: '1px solid #e5e5e5' }}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '13px', fontWeight: 'bold', flexShrink: 0 }}>
                                        {getInicial(comentario.autor.nome)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>{comentario.autor.nome}</span>
                                            <span style={{ fontSize: '11px', color: '#aaa' }}>{formatarData(comentario.data)}</span>
                                        </div>
                                        <p style={{ fontSize: '13px', color: '#444', lineHeight: '1.5' }}>{comentario.conteudo}</p>
                                        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                            <button style={{ ...votoBtn, fontSize: '11px', color: '#888' }}>
                                                <ThumbsUp size={12} /> {comentario.votos}
                                            </button>
                                            <button onClick={() => setRespondendo(respondendo === comentario.id ? null : comentario.id)} style={{ background: 'none', border: 'none', fontSize: '11px', color: '#888', cursor: 'pointer' }}>
                                                Responder
                                            </button>
                                        </div>
                                        {respondendo === comentario.id && (
                                            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                                                <input value={respostaTexto} onChange={(e) => setRespostaTexto(e.target.value)} placeholder="Sua resposta..."
                                                       style={{ flex: 1, padding: '8px 12px', backgroundColor: '#f5f5f5', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '13px', outline: 'none' }} />
                                                <button style={{ padding: '8px 14px', backgroundColor: '#DC2626', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                                                    <Send size={13} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Input de resposta */}
                <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                    <textarea value={novaResposta} onChange={(e) => setNovaResposta(e.target.value)} placeholder="Escreva sua resposta..."
                              rows={2} style={{ flex: 1, padding: '10px 14px', backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '10px', fontSize: '13px', outline: 'none', resize: 'none', fontFamily: 'inherit' }} />
                    <button disabled={!novaResposta.trim()} style={{
                        padding: '10px 16px', backgroundColor: novaResposta.trim() ? '#DC2626' : '#e5e5e5',
                        color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '600',
                        cursor: novaResposta.trim() ? 'pointer' : 'default', fontSize: '13px'
                    }}>
                        Responder
                    </button>
                </div>
            </div>

            <BottomNav />
        </div>
    )
}

const votoBtn: React.CSSProperties = {
    background: 'none', border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '3px',
    fontSize: '12px', padding: '4px 6px', borderRadius: '6px'
}