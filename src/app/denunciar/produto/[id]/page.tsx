'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { ArrowLeft, Flag, Send, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

const motivos = [
    'Produto falso ou nao original',
    'Produto com defeito nao informado',
    'Preco abusivo ou enganoso',
    'Imagens nao correspondem ao produto',
    'Vendedor nao responde ou some',
    'Spam ou propaganda',
    'Conteudo ofensivo ou inapropriado',
    'Outro motivo'
]

export default function DenunciarProdutoPage() {
    const params = useParams()
    const id = params.id

    const [motivo, setMotivo] = useState('')
    const [descricao, setDescricao] = useState('')
    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState('')
    const [sucesso, setSucesso] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErro('')

        if (!motivo) {
            setErro('Selecione o motivo da denuncia')
            return
        }
        if (!descricao.trim()) {
            setErro('Descreva o ocorrido')
            return
        }

        setLoading(true)
        try {
            // await api.post('/api/reports', { productId: Number(id), reason: motivo, description: descricao })
            await new Promise(resolve => setTimeout(resolve, 1000))
            setSucesso(true)
        } catch (error) {
            console.error('Erro ao enviar denuncia:', error)
            setErro('Erro ao enviar denuncia. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    if (sucesso) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingBottom: '70px' }}>
                <Header />
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <Flag size={36} color="#fff" />
                    </div>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a1a', marginBottom: '8px' }}>
                        Denuncia enviada
                    </h2>
                    <p style={{ fontSize: '14px', color: '#888', marginBottom: '20px' }}>
                        Nossa equipe ira analisar e tomar as providencias necessarias
                    </p>
                    <Link href={`/produto/${id}`} style={{
                        display: 'inline-block', padding: '12px 24px', backgroundColor: '#DC2626', color: '#fff',
                        borderRadius: '10px', fontSize: '14px', fontWeight: '600', textDecoration: 'none'
                    }}>
                        Voltar ao produto
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
                    <Link href={`/produto/${id}`} style={{ display: 'flex', padding: '4px' }}>
                        <ArrowLeft size={20} color="#1a1a1a" />
                    </Link>
                    <h1 style={{ fontSize: '17px', fontWeight: '700', color: '#1a1a1a' }}>Denunciar produto</h1>
                </div>
            </div>

            <div style={{ padding: '16px' }}>
                {erro && (
                    <div style={{
                        backgroundColor: '#FEE2E2', border: '1px solid #FECACA',
                        borderRadius: '10px', padding: '12px 16px', marginBottom: '16px',
                        color: '#DC2626', fontSize: '14px', textAlign: 'center'
                    }}>{erro}</div>
                )}

                <div style={{
                    backgroundColor: '#FFF7ED', borderRadius: '12px', padding: '14px 16px',
                    border: '1px solid #FED7AA', display: 'flex', gap: '10px', marginBottom: '20px'
                }}>
                    <AlertTriangle size={18} color="#EA580C" style={{ flexShrink: 0, marginTop: '1px' }} />
                    <div>
                        <p style={{ fontSize: '13px', fontWeight: '600', color: '#9A3412', marginBottom: '2px' }}>Atencao</p>
                        <p style={{ fontSize: '12px', color: '#C2410C', lineHeight: '1.4' }}>
                            Denuncias falsas podem resultar em penalidades. Use este recurso com responsabilidade.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Motivo */}
                    <div>
                        <label style={labelStyle}><Flag size={14} />Motivo da denuncia *</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {motivos.map((m) => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => setMotivo(m)}
                                    style={{
                                        padding: '12px 14px', borderRadius: '10px', textAlign: 'left',
                                        border: motivo === m ? '2px solid #DC2626' : '1px solid #e5e5e5',
                                        backgroundColor: motivo === m ? '#FEE2E2' : '#fff',
                                        color: motivo === m ? '#DC2626' : '#444',
                                        fontSize: '14px', fontWeight: motivo === m ? '600' : '400',
                                        cursor: 'pointer', transition: 'all 0.15s'
                                    }}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Descricao */}
                    <div>
                        <label style={labelStyle}>
                            <Flag size={14} />Descricao *
                        </label>
                        <textarea
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                            placeholder="Descreva detalhadamente o ocorrido..."
                            rows={5}
                            maxLength={500}
                            style={{
                                width: '100%', padding: '12px 14px', backgroundColor: '#fff',
                                border: '1px solid #e5e5e5', borderRadius: '10px', fontSize: '14px',
                                color: '#1a1a1a', outline: 'none', resize: 'vertical', fontFamily: 'inherit'
                            }}
                        />
                        <p style={{ fontSize: '11px', color: '#aaa', marginTop: '4px', textAlign: 'right' }}>
                            {descricao.length}/500
                        </p>
                    </div>

                    <button type="submit" disabled={loading || !motivo || !descricao.trim()} style={{
                        width: '100%', padding: '14px',
                        backgroundColor: (loading || !motivo || !descricao.trim()) ? '#ccc' : '#DC2626',
                        color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px',
                        fontWeight: '600', cursor: (loading || !motivo || !descricao.trim()) ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        marginTop: '8px'
                    }}>
                        <Send size={16} />
                        {loading ? 'Enviando...' : 'Enviar denuncia'}
                    </button>
                </form>
            </div>

            <BottomNav />
        </div>
    )
}

const labelStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '6px',
    fontSize: '13px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px'
}