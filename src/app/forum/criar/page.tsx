'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { ArrowLeft, Send, FileText, Folder } from 'lucide-react'
import Link from 'next/link'

const categorias = ['Geral', 'MTB', 'Speed', 'Tecnica', 'Eventos', 'Compra/Venda', 'Off-Topic']

export default function CriarTopicoPage() {
    const [titulo, setTitulo] = useState('')
    const [categoria, setCategoria] = useState('')
    const [conteudo, setConteudo] = useState('')
    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState('')
    const [sucesso, setSucesso] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErro('')

        if (!titulo.trim()) {
            setErro('Informe o titulo do topico')
            return
        }
        if (!categoria) {
            setErro('Selecione uma categoria')
            return
        }
        if (!conteudo.trim()) {
            setErro('Escreva o conteudo do topico')
            return
        }

        setLoading(true)
        try {
            // await forumService.criarPost({ title: titulo, content: conteudo, categoryId: categoria })
            await new Promise(resolve => setTimeout(resolve, 1000))
            setSucesso(true)
        } catch (error) {
            console.error('Erro ao criar topico:', error)
            setErro('Erro ao criar topico. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    if (sucesso) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingBottom: '70px' }}>
                <Header />
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%',
                        backgroundColor: '#16A34A', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 20px'
                    }}>
                        <span style={{ fontSize: '40px', color: '#fff' }}>OK</span>
                    </div>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a1a', marginBottom: '8px' }}>
                        Topico criado!
                    </h2>
                    <p style={{ fontSize: '14px', color: '#888', marginBottom: '20px' }}>
                        Seu topico foi publicado no forum
                    </p>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <Link href="/forum" style={{
                            padding: '12px 24px', backgroundColor: '#DC2626', color: '#fff',
                            borderRadius: '10px', fontSize: '14px', fontWeight: '600', textDecoration: 'none'
                        }}>
                            Ver forum
                        </Link>
                        <Link href="/forum/criar" style={{
                            padding: '12px 24px', backgroundColor: '#fff', color: '#DC2626',
                            border: '1px solid #DC2626', borderRadius: '10px', fontSize: '14px',
                            fontWeight: '600', textDecoration: 'none'
                        }}>
                            Criar outro
                        </Link>
                    </div>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Link href="/forum" style={{ display: 'flex', padding: '4px' }}>
                            <ArrowLeft size={20} color="#1a1a1a" />
                        </Link>
                        <h1 style={{ fontSize: '17px', fontWeight: '700', color: '#1a1a1a' }}>Criar topico</h1>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !titulo.trim() || !categoria || !conteudo.trim()}
                        style={{
                            padding: '8px 16px', backgroundColor: (loading || !titulo.trim() || !categoria || !conteudo.trim()) ? '#ccc' : '#DC2626',
                            color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px',
                            fontWeight: '600', cursor: (loading || !titulo.trim() || !categoria || !conteudo.trim()) ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', gap: '6px'
                        }}
                    >
                        <Send size={14} />
                        {loading ? 'Publicando...' : 'Publicar'}
                    </button>
                </div>
            </div>

            <div style={{ padding: '16px' }}>
                {/* Erro */}
                {erro && (
                    <div style={{
                        backgroundColor: '#FEE2E2', border: '1px solid #FECACA',
                        borderRadius: '10px', padding: '12px 16px', marginBottom: '16px',
                        color: '#DC2626', fontSize: '14px', textAlign: 'center'
                    }}>
                        {erro}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Categoria */}
                    <div>
                        <label style={labelStyle}>
                            <Folder size={14} />
                            Categoria
                        </label>
                        <select
                            value={categoria}
                            onChange={(e) => setCategoria(e.target.value)}
                            style={{
                                width: '100%', padding: '12px 14px', backgroundColor: '#fff',
                                border: '1px solid #e5e5e5', borderRadius: '10px', fontSize: '14px',
                                color: categoria ? '#1a1a1a' : '#999', outline: 'none',
                                appearance: 'none', cursor: 'pointer'
                            }}
                        >
                            <option value="" disabled>Selecionar categoria...</option>
                            {categorias.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Titulo */}
                    <div>
                        <label style={labelStyle}>
                            <FileText size={14} />
                            Titulo do topico
                        </label>
                        <input
                            type="text"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            placeholder="Ex: Qual a melhor suspensao para MTB?"
                            maxLength={150}
                            style={{
                                width: '100%', padding: '12px 14px', backgroundColor: '#fff',
                                border: '1px solid #e5e5e5', borderRadius: '10px', fontSize: '14px',
                                color: '#1a1a1a', outline: 'none'
                            }}
                        />
                        <p style={{ fontSize: '11px', color: '#aaa', marginTop: '4px', textAlign: 'right' }}>
                            {titulo.length}/150
                        </p>
                    </div>

                    {/* Conteudo */}
                    <div>
                        <label style={labelStyle}>
                            <FileText size={14} />
                            Conteudo
                        </label>
                        <textarea
                            value={conteudo}
                            onChange={(e) => setConteudo(e.target.value)}
                            placeholder="Descreva sua duvida ou discussao em detalhes..."
                            rows={8}
                            style={{
                                width: '100%', padding: '12px 14px', backgroundColor: '#fff',
                                border: '1px solid #e5e5e5', borderRadius: '10px', fontSize: '14px',
                                color: '#1a1a1a', outline: 'none', resize: 'vertical',
                                fontFamily: 'inherit', lineHeight: '1.6'
                            }}
                        />
                    </div>

                    {/* Dicas */}
                    <div style={{
                        backgroundColor: '#f9f9f9', borderRadius: '10px',
                        padding: '14px', border: '1px solid #e5e5e5'
                    }}>
                        <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#1a1a1a', marginBottom: '8px' }}>
                            Dicas para um bom topico:
                        </h3>
                        <ul style={{ fontSize: '12px', color: '#888', paddingLeft: '16px', lineHeight: '1.6' }}>
                            <li>Seja claro e objetivo no titulo</li>
                            <li>Escolha a categoria correta</li>
                            <li>Descreva o problema ou duvida com detalhes</li>
                            <li>Inclua informacoes relevantes (modelo, ano, etc)</li>
                            <li>Seja respeitoso com outros membros</li>
                        </ul>
                    </div>

                    {/* Botao mobile (aparece no final tambem) */}
                    <button
                        type="submit"
                        disabled={loading || !titulo.trim() || !categoria || !conteudo.trim()}
                        style={{
                            width: '100%', padding: '14px',
                            backgroundColor: (loading || !titulo.trim() || !categoria || !conteudo.trim()) ? '#ccc' : '#DC2626',
                            color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px',
                            fontWeight: '600', cursor: (loading || !titulo.trim() || !categoria || !conteudo.trim()) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Publicando...' : 'Publicar topico'}
                    </button>
                </form>
            </div>

            <BottomNav />
        </div>
    )
}

const labelStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '6px',
    fontSize: '13px', fontWeight: '600', color: '#1a1a1a', marginBottom: '6px'
}