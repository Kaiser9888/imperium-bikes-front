'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import {
    ArrowLeft, Search, Plus, MessageCircle,
    ThumbsUp, Eye, Clock, TrendingUp
} from 'lucide-react'
import Link from 'next/link'

interface Topico {
    id: number
    titulo: string
    autor: {
        id: number
        nome: string
        avatar: string | null
    }
    categoria: string
    respostas: number
    votos: number
    visualizacoes: number
    data: string
    ultimaResposta?: {
        autor: string
        data: string
    }
}

const categorias = ['Todas', 'Geral', 'MTB', 'Speed', 'Tecnica', 'Eventos', 'Compra/Venda', 'Off-Topic']

export default function ForumPage() {
    const [topicos, setTopicos] = useState<Topico[]>([])
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState('')
    const [busca, setBusca] = useState('')
    const [categoria, setCategoria] = useState('Todas')
    const [ordenacao, setOrdenacao] = useState<'recentes' | 'populares'>('recentes')

    const carregarTopicos = async () => {
        setLoading(true)
        setErro('')
        try {
            // const response = await api.get('/api/forum/posts', { params: { page: 0, size: 50 } })
            // setTopicos(response.data.content || response.data)
            setTopicos([])
        } catch (error) {
            console.error('Erro ao carregar topicos:', error)
            setErro('Erro ao carregar topicos.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        carregarTopicos()
    }, [])

    const topicosFiltrados = topicos
        .filter(t => {
            if (categoria !== 'Todas' && t.categoria !== categoria) return false
            if (busca && !t.titulo.toLowerCase().includes(busca.toLowerCase())) return false
            return true
        })
        .sort((a, b) => {
            if (ordenacao === 'populares') return b.votos - a.votos
            return new Date(b.data).getTime() - new Date(a.data).getTime()
        })

    const getInicial = (nome: string) => nome.charAt(0).toUpperCase()

    const formatarData = (data: string) => {
        const d = new Date(data)
        const agora = new Date()
        const diff = agora.getTime() - d.getTime()
        const dias = Math.floor(diff / 86400000)
        if (dias === 0) return 'Hoje'
        if (dias === 1) return 'Ontem'
        if (dias < 7) return `${dias}d`
        return d.toLocaleDateString('pt-BR')
    }

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingBottom: '70px' }}>
                <Header />
                <div style={{ padding: '16px' }}>
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} style={{ height: '80px', backgroundColor: '#eee', borderRadius: '10px', marginBottom: '8px' }} />
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
                    <button onClick={carregarTopicos} style={{
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
                        <h1 style={{ fontSize: '17px', fontWeight: '700', color: '#1a1a1a' }}>Forum</h1>
                    </div>
                    <Link href="/forum/criar" style={{
                        padding: '8px 14px', backgroundColor: '#DC2626', color: '#fff',
                        borderRadius: '8px', fontSize: '13px', fontWeight: '600',
                        textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px'
                    }}>
                        <Plus size={15} />
                        Criar
                    </Link>
                </div>

                {/* Busca */}
                <div style={{ position: 'relative', marginBottom: '8px' }}>
                    <Search size={14} color="#999" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                    <input
                        type="text" value={busca} onChange={(e) => setBusca(e.target.value)}
                        placeholder="Buscar topicos..."
                        style={{ width: '100%', padding: '9px 12px 9px 32px', backgroundColor: '#f5f5f5', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '13px', color: '#1a1a1a', outline: 'none' }}
                    />
                </div>

                {/* Categorias scroll */}
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {categorias.map((cat) => (
                        <button key={cat} onClick={() => setCategoria(cat)} style={{
                            padding: '6px 12px', borderRadius: '20px', whiteSpace: 'nowrap',
                            border: categoria === cat ? '1.5px solid #DC2626' : '1px solid #e5e5e5',
                            backgroundColor: categoria === cat ? '#DC2626' : '#fff',
                            color: categoria === cat ? '#fff' : '#666',
                            fontSize: '12px', fontWeight: categoria === cat ? '600' : '400',
                            cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0
                        }}>{cat}</button>
                    ))}
                </div>
            </div>

            {/* Ordenacao */}
            <div style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: '13px', color: '#888' }}>{topicosFiltrados.length} topicos</p>
                <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => setOrdenacao('recentes')} style={{
                        padding: '6px 12px', borderRadius: '6px', border: ordenacao === 'recentes' ? '1px solid #DC2626' : '1px solid #e5e5e5',
                        backgroundColor: ordenacao === 'recentes' ? '#DC2626' : '#fff',
                        color: ordenacao === 'recentes' ? '#fff' : '#666',
                        fontSize: '11px', fontWeight: '500', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                        <Clock size={12} /> Recentes
                    </button>
                    <button onClick={() => setOrdenacao('populares')} style={{
                        padding: '6px 12px', borderRadius: '6px', border: ordenacao === 'populares' ? '1px solid #DC2626' : '1px solid #e5e5e5',
                        backgroundColor: ordenacao === 'populares' ? '#DC2626' : '#fff',
                        color: ordenacao === 'populares' ? '#fff' : '#666',
                        fontSize: '11px', fontWeight: '500', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                        <TrendingUp size={12} /> Populares
                    </button>
                </div>
            </div>

            {/* Lista */}
            <div style={{ padding: '0 16px' }}>
                {topicosFiltrados.length === 0 && !loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <MessageCircle size={40} color="#ccc" />
                        <p style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a1a', marginTop: '12px' }}>
                            {topicos.length === 0 ? 'Nenhum topico' : 'Nenhum topico encontrado'}
                        </p>
                        <p style={{ fontSize: '13px', color: '#888', marginTop: '4px', marginBottom: '16px' }}>
                            {topicos.length === 0 ? 'Seja o primeiro a criar um topico!' : 'Tente mudar os filtros'}
                        </p>
                        {topicos.length === 0 && (
                            <Link href="/forum/criar" style={{
                                display: 'inline-block', padding: '10px 24px',
                                backgroundColor: '#DC2626', color: '#fff', borderRadius: '8px',
                                fontSize: '14px', fontWeight: '600', textDecoration: 'none'
                            }}>Criar topico</Link>
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {topicosFiltrados.map((topico) => (
                            <Link key={topico.id} href={`/forum/${topico.id}`} style={{
                                padding: '16px 0', borderBottom: '1px solid #f0f0f0',
                                textDecoration: 'none', display: 'flex', gap: '12px'
                            }}>
                                {/* Avatar do autor */}
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%',
                                    backgroundColor: '#DC2626', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center',
                                    color: '#fff', fontSize: '16px', fontWeight: 'bold', flexShrink: 0
                                }}>
                                    {getInicial(topico.autor.nome)}
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                                        <span style={{
                                            fontSize: '10px', fontWeight: '600', color: '#DC2626',
                                            backgroundColor: '#FEE2E2', padding: '2px 6px', borderRadius: '4px'
                                        }}>
                                            {topico.categoria}
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a1a', marginBottom: '4px', lineHeight: '1.3' }}>
                                        {topico.titulo}
                                    </h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: '#888' }}>
                                        <span>{topico.autor.nome}</span>
                                        <span>{formatarData(topico.data)}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#888' }}>
                                            <MessageCircle size={12} /> {topico.respostas}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#888' }}>
                                            <ThumbsUp size={12} /> {topico.votos}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#888' }}>
                                            <Eye size={12} /> {topico.visualizacoes}
                                        </span>
                                    </div>
                                    {topico.ultimaResposta && (
                                        <p style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>
                                            Ultima resposta por {topico.ultimaResposta.autor} • {formatarData(topico.ultimaResposta.data)}
                                        </p>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    )
}