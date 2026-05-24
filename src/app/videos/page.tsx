'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { ArrowLeft, Search, Play, Eye, Clock, ThumbsUp, MessageCircle, Upload } from 'lucide-react'
import Link from 'next/link'

interface Video {
    id: number
    titulo: string
    autor: {
        id: number
        nome: string
        avatar: string | null
    }
    thumbnail: string | null
    duracao: string
    visualizacoes: number
    votos: number
    comentarios: number
    data: string
    categoria: string
}

const categorias = ['Todos', 'MTB', 'Speed', 'Downhill', 'BMX', 'Tutoriais', 'Reviews', 'Eventos', 'Vlogs']

export default function VideosPage() {
    const [videos, setVideos] = useState<Video[]>([])
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState('')
    const [busca, setBusca] = useState('')
    const [categoria, setCategoria] = useState('Todos')

    const carregarVideos = async () => {
        setLoading(true)
        setErro('')
        try {
            // const response = await api.get('/api/videos', { params: { page: 0, size: 50 } })
            // setVideos(response.data.content || response.data)
            setVideos([])
        } catch (error) {
            console.error('Erro ao carregar videos:', error)
            setErro('Erro ao carregar videos.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        carregarVideos()
    }, [])

    const videosFiltrados = videos.filter(v => {
        if (categoria !== 'Todos' && v.categoria !== categoria) return false
        if (busca && !v.titulo.toLowerCase().includes(busca.toLowerCase())) return false
        return true
    })

    const formatarVisualizacoes = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
        return num.toString()
    }

    const formatarData = (data: string) => {
        const d = new Date(data)
        const agora = new Date()
        const diff = agora.getTime() - d.getTime()
        const dias = Math.floor(diff / 86400000)
        if (dias === 0) return 'Hoje'
        if (dias === 1) return 'Ontem'
        if (dias < 7) return `${dias}d`
        if (dias < 30) return `${Math.floor(dias / 7)}sem`
        if (dias < 365) return `${Math.floor(dias / 30)}mes`
        return `${Math.floor(dias / 365)}a`
    }

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingBottom: '70px' }}>
                <Header />
                <div style={{ padding: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i}>
                                <div style={{ height: '110px', backgroundColor: '#eee', borderRadius: '10px', marginBottom: '8px' }} />
                                <div style={{ height: '14px', backgroundColor: '#eee', borderRadius: '4px', width: '80%', marginBottom: '4px' }} />
                                <div style={{ height: '12px', backgroundColor: '#eee', borderRadius: '4px', width: '50%' }} />
                            </div>
                        ))}
                    </div>
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
                    <button onClick={carregarVideos} style={{
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
                        <h1 style={{ fontSize: '17px', fontWeight: '700', color: '#1a1a1a' }}>Videos</h1>
                    </div>
                    <Link href="/videos/upload" style={{
                        padding: '8px 14px', backgroundColor: '#DC2626', color: '#fff',
                        borderRadius: '8px', fontSize: '13px', fontWeight: '600',
                        textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px'
                    }}>
                        <Upload size={15} />
                        Enviar
                    </Link>
                </div>

                {/* Busca */}
                <div style={{ position: 'relative', marginBottom: '8px' }}>
                    <Search size={14} color="#999" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                    <input
                        type="text" value={busca} onChange={(e) => setBusca(e.target.value)}
                        placeholder="Buscar videos..."
                        style={{ width: '100%', padding: '9px 12px 9px 32px', backgroundColor: '#f5f5f5', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '13px', color: '#1a1a1a', outline: 'none' }}
                    />
                </div>

                {/* Categorias scroll */}
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {categorias.map((cat) => (
                        <button key={cat} onClick={() => setCategoria(cat)} style={{
                            padding: '6px 12px', borderRadius: '20px', whiteSpace: 'nowrap', flexShrink: 0,
                            border: categoria === cat ? '1.5px solid #DC2626' : '1px solid #e5e5e5',
                            backgroundColor: categoria === cat ? '#DC2626' : '#fff',
                            color: categoria === cat ? '#fff' : '#666',
                            fontSize: '12px', fontWeight: categoria === cat ? '600' : '400',
                            cursor: 'pointer', transition: 'all 0.15s'
                        }}>{cat}</button>
                    ))}
                </div>
            </div>

            {/* Grid de videos */}
            <div style={{ padding: '12px' }}>
                {videosFiltrados.length === 0 && !loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <Play size={40} color="#ccc" />
                        <p style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a1a', marginTop: '12px' }}>
                            {videos.length === 0 ? 'Nenhum video' : 'Nenhum video encontrado'}
                        </p>
                        <p style={{ fontSize: '13px', color: '#888', marginTop: '4px', marginBottom: '16px' }}>
                            {videos.length === 0 ? 'Os videos aparecerao aqui' : 'Tente mudar os filtros'}
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                        {videosFiltrados.map((video) => (
                            <Link key={video.id} href={`/videos/${video.id}`} style={{ textDecoration: 'none' }}>
                                {/* Thumbnail */}
                                <div style={{
                                    aspectRatio: '16/10', borderRadius: '10px', overflow: 'hidden',
                                    backgroundColor: video.thumbnail ? undefined : '#2a2a2a',
                                    backgroundImage: video.thumbnail ? `url(${video.thumbnail})` : undefined,
                                    backgroundSize: 'cover', backgroundPosition: 'center',
                                    position: 'relative', marginBottom: '8px'
                                }}>
                                    {!video.thumbnail && (
                                        <div style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            height: '100%', color: '#666'
                                        }}>
                                            <Play size={32} />
                                        </div>
                                    )}
                                    {/* Duração */}
                                    <span style={{
                                        position: 'absolute', bottom: '6px', right: '6px',
                                        backgroundColor: 'rgba(0,0,0,0.8)', color: '#fff',
                                        padding: '2px 6px', borderRadius: '4px', fontSize: '10px',
                                        fontWeight: '600'
                                    }}>
                                        {video.duracao}
                                    </span>
                                </div>

                                {/* Info */}
                                <h3 style={{
                                    fontSize: '13px', fontWeight: '600', color: '#1a1a1a',
                                    marginBottom: '3px', lineHeight: '1.3',
                                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }}>
                                    {video.titulo}
                                </h3>
                                <p style={{ fontSize: '11px', color: '#888', marginBottom: '3px' }}>
                                    {video.autor.nome}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', color: '#aaa' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                        <Eye size={11} /> {formatarVisualizacoes(video.visualizacoes)}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                        <ThumbsUp size={11} /> {formatarVisualizacoes(video.votos)}
                                    </span>
                                    <span>{formatarData(video.data)}</span>
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