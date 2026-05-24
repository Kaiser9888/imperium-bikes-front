'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import {
    ArrowLeft, Upload, Video, Link2, FileText,
    Folder, Image as ImageIcon, X, Smartphone, Globe
} from 'lucide-react'
import Link from 'next/link'

const categorias = ['MTB', 'Speed', 'Downhill', 'BMX', 'Tutoriais', 'Reviews', 'Eventos', 'Vlogs']

export default function UploadVideoPage() {
    const [modoUpload, setModoUpload] = useState<'url' | 'arquivo'>('url')
    const [form, setForm] = useState({
        titulo: '',
        descricao: '',
        categoria: '',
        url: '',
        tipoUrl: 'youtube' as 'youtube' | 'vimeo' | 'outro'
    })
    const [arquivoVideo, setArquivoVideo] = useState<File | null>(null)
    const [thumbnail, setThumbnail] = useState<File | null>(null)
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState('')
    const [sucesso, setSucesso] = useState(false)
    const [progresso, setProgresso] = useState(0)

    const handleChange = (field: string, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    const handleVideoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 500 * 1024 * 1024) {
                setErro('Video muito grande. Maximo: 500MB')
                return
            }
            const tiposPermitidos = ['video/mp4', 'video/webm', 'video/mov', 'video/avi']
            if (!tiposPermitidos.includes(file.type)) {
                setErro('Formato nao suportado. Use: MP4, WebM, MOV, AVI')
                return
            }
            setArquivoVideo(file)
            setErro('')
        }
    }

    const removerArquivoVideo = () => {
        setArquivoVideo(null)
    }

    const handleThumbnail = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setThumbnail(file)
            const reader = new FileReader()
            reader.onload = (e) => setThumbnailPreview(e.target?.result as string)
            reader.readAsDataURL(file)
        }
    }

    const removerThumbnail = () => {
        setThumbnail(null)
        setThumbnailPreview(null)
    }

    const validarUrl = (url: string): boolean => {
        if (form.tipoUrl === 'youtube') return url.includes('youtube.com') || url.includes('youtu.be')
        if (form.tipoUrl === 'vimeo') return url.includes('vimeo.com')
        return url.startsWith('http')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErro('')

        if (!form.titulo.trim()) { setErro('Informe o titulo'); return }
        if (!form.categoria) { setErro('Selecione a categoria'); return }

        if (modoUpload === 'url') {
            if (!form.url.trim()) { setErro('Informe a URL do video'); return }
            if (!validarUrl(form.url)) { setErro('URL invalida para o tipo selecionado'); return }
        } else {
            if (!arquivoVideo) { setErro('Selecione um arquivo de video'); return }
        }

        setLoading(true)
        setProgresso(0)

        try {
            const formData = new FormData()
            formData.append('title', form.titulo)
            formData.append('description', form.descricao)
            formData.append('category', form.categoria)

            if (modoUpload === 'url') {
                formData.append('url', form.url)
                formData.append('urlType', form.tipoUrl)
            } else if (arquivoVideo) {
                formData.append('videoFile', arquivoVideo)
            }

            if (thumbnail) formData.append('thumbnail', thumbnail)

            // Simular progresso
            const interval = setInterval(() => {
                setProgresso(prev => {
                    if (prev >= 90) {
                        clearInterval(interval)
                        return prev
                    }
                    return prev + 10
                })
            }, 300)

            // await api.post('/api/videos', formData, {
            //     onUploadProgress: (e) => {
            //         if (e.total) setProgresso(Math.round((e.loaded * 100) / e.total))
            //     }
            // })

            await new Promise(resolve => setTimeout(resolve, 1500))
            clearInterval(interval)
            setProgresso(100)
            setSucesso(true)
        } catch (error) {
            console.error('Erro ao enviar video:', error)
            setErro('Erro ao enviar video. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    const formatarTamanho = (bytes: number) => {
        if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
        if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
        if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`
        return `${bytes} B`
    }

    if (sucesso) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingBottom: '70px' }}>
                <Header />
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <span style={{ fontSize: '40px', color: '#fff' }}>OK</span>
                    </div>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a1a', marginBottom: '8px' }}>Video enviado!</h2>
                    <p style={{ fontSize: '14px', color: '#888', marginBottom: '20px' }}>
                        {modoUpload === 'arquivo' ? 'Seu video esta sendo processado. Isso pode levar alguns minutos.' : 'Seu video foi adicionado com sucesso.'}
                    </p>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <Link href="/videos" style={{ padding: '12px 24px', backgroundColor: '#DC2626', color: '#fff', borderRadius: '10px', fontSize: '14px', fontWeight: '600', textDecoration: 'none' }}>Ver videos</Link>
                        <Link href="/videos/upload" style={{ padding: '12px 24px', backgroundColor: '#fff', color: '#DC2626', border: '1px solid #DC2626', borderRadius: '10px', fontSize: '14px', fontWeight: '600', textDecoration: 'none' }}>Enviar outro</Link>
                    </div>
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
                    <Link href="/videos" style={{ display: 'flex', padding: '4px' }}>
                        <ArrowLeft size={20} color="#1a1a1a" />
                    </Link>
                    <h1 style={{ fontSize: '17px', fontWeight: '700', color: '#1a1a1a' }}>Enviar video</h1>
                </div>
            </div>

            <div style={{ padding: '16px' }}>
                {erro && (
                    <div style={{ backgroundColor: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', color: '#DC2626', fontSize: '14px', textAlign: 'center' }}>
                        {erro}
                    </div>
                )}

                {/* Modo de upload */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={labelStyle}>
                        <Upload size={14} />
                        Como deseja enviar?
                    </label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                            type="button"
                            onClick={() => { setModoUpload('url'); setErro('') }}
                            style={{
                                flex: 1, padding: '14px 12px', borderRadius: '10px',
                                border: modoUpload === 'url' ? '2px solid #DC2626' : '1px solid #e5e5e5',
                                backgroundColor: modoUpload === 'url' ? '#FEE2E2' : '#fff',
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                gap: '6px', cursor: 'pointer', transition: 'all 0.15s'
                            }}
                        >
                            <Globe size={22} color={modoUpload === 'url' ? '#DC2626' : '#888'} />
                            <span style={{ fontSize: '12px', fontWeight: '600', color: modoUpload === 'url' ? '#DC2626' : '#666' }}>Link (URL)</span>
                            <span style={{ fontSize: '10px', color: '#aaa' }}>YouTube, Vimeo, etc</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => { setModoUpload('arquivo'); setErro('') }}
                            style={{
                                flex: 1, padding: '14px 12px', borderRadius: '10px',
                                border: modoUpload === 'arquivo' ? '2px solid #DC2626' : '1px solid #e5e5e5',
                                backgroundColor: modoUpload === 'arquivo' ? '#FEE2E2' : '#fff',
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                gap: '6px', cursor: 'pointer', transition: 'all 0.15s'
                            }}
                        >
                            <Smartphone size={22} color={modoUpload === 'arquivo' ? '#DC2626' : '#888'} />
                            <span style={{ fontSize: '12px', fontWeight: '600', color: modoUpload === 'arquivo' ? '#DC2626' : '#666' }}>Dispositivo</span>
                            <span style={{ fontSize: '10px', color: '#aaa' }}>MP4, WebM, MOV</span>
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    {/* MODO URL */}
                    {modoUpload === 'url' && (
                        <>
                            <div>
                                <label style={labelStyle}><Link2 size={14} />Tipo de video</label>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    {[
                                        { key: 'youtube' as const, label: 'YouTube' },
                                        { key: 'vimeo' as const, label: 'Vimeo' },
                                        { key: 'outro' as const, label: 'Outro' },
                                    ].map(tipo => (
                                        <button key={tipo.key} type="button" onClick={() => handleChange('tipoUrl', tipo.key)} style={{
                                            flex: 1, padding: '10px', borderRadius: '8px',
                                            border: form.tipoUrl === tipo.key ? '2px solid #DC2626' : '1px solid #e5e5e5',
                                            backgroundColor: form.tipoUrl === tipo.key ? '#FEE2E2' : '#fff',
                                            color: form.tipoUrl === tipo.key ? '#DC2626' : '#666',
                                            fontSize: '13px', fontWeight: form.tipoUrl === tipo.key ? '600' : '400',
                                            cursor: 'pointer', transition: 'all 0.15s'
                                        }}>{tipo.label}</button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}><Link2 size={14} />URL do video</label>
                                <input type="url" value={form.url} onChange={(e) => handleChange('url', e.target.value)}
                                       placeholder={form.tipoUrl === 'youtube' ? 'https://youtube.com/watch?v=...' : form.tipoUrl === 'vimeo' ? 'https://vimeo.com/...' : 'https://...'}
                                       style={inputStyle} />
                            </div>
                        </>
                    )}

                    {/* MODO ARQUIVO */}
                    {modoUpload === 'arquivo' && (
                        <div>
                            <label style={labelStyle}><Video size={14} />Arquivo de video</label>
                            {arquivoVideo ? (
                                <div style={{ backgroundColor: '#f9f9f9', borderRadius: '10px', padding: '14px', border: '1px solid #e5e5e5' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <Video size={20} color="#DC2626" />
                                            <div>
                                                <p style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>{arquivoVideo.name}</p>
                                                <p style={{ fontSize: '11px', color: '#888' }}>{formatarTamanho(arquivoVideo.size)}</p>
                                            </div>
                                        </div>
                                        <button type="button" onClick={removerArquivoVideo} style={{ color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                                            <X size={18} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <label style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                                    justifyContent: 'center', padding: '30px',
                                    border: '2px dashed #d1d5db', borderRadius: '10px',
                                    cursor: 'pointer', backgroundColor: '#fafafa'
                                }}>
                                    <Upload size={32} color="#999" />
                                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#666', marginTop: '8px' }}>
                                        Clique para selecionar
                                    </span>
                                    <span style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>
                                        MP4, WebM, MOV, AVI (max 500MB)
                                    </span>
                                    <input type="file" accept="video/*" onChange={handleVideoFile} style={{ display: 'none' }} />
                                </label>
                            )}
                        </div>
                    )}

                    {/* Campos comuns */}
                    <div>
                        <label style={labelStyle}><Folder size={14} />Categoria</label>
                        <select value={form.categoria} onChange={(e) => handleChange('categoria', e.target.value)}
                                style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}>
                            <option value="" disabled>Selecionar categoria...</option>
                            {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>

                    <div>
                        <label style={labelStyle}><FileText size={14} />Titulo do video</label>
                        <input type="text" value={form.titulo} onChange={(e) => handleChange('titulo', e.target.value)}
                               placeholder="Ex: Review Trek Marlin 7 2024" maxLength={100} style={inputStyle} />
                        <p style={{ fontSize: '11px', color: '#aaa', marginTop: '4px', textAlign: 'right' }}>{form.titulo.length}/100</p>
                    </div>

                    <div>
                        <label style={labelStyle}><FileText size={14} />Descricao</label>
                        <textarea value={form.descricao} onChange={(e) => handleChange('descricao', e.target.value)}
                                  placeholder="Descreva o conteudo do video..." rows={4}
                                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.5' }} />
                    </div>

                    <div>
                        <label style={labelStyle}><ImageIcon size={14} />Thumbnail personalizada (opcional)</label>
                        {thumbnailPreview ? (
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                <img src={thumbnailPreview} alt="Thumbnail" style={{ width: '180px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e5e5e5' }} />
                                <button type="button" onClick={removerThumbnail}
                                        style={{ position: 'absolute', top: '-6px', right: '-6px', width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#DC2626', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                    <X size={12} color="#fff" />
                                </button>
                            </div>
                        ) : (
                            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '180px', height: '100px', border: '2px dashed #d1d5db', borderRadius: '8px', cursor: 'pointer', backgroundColor: '#fafafa' }}>
                                <ImageIcon size={24} color="#999" />
                                <span style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>Adicionar capa</span>
                                <input type="file" accept="image/*" onChange={handleThumbnail} style={{ display: 'none' }} />
                            </label>
                        )}
                    </div>

                    {/* Barra de progresso */}
                    {loading && (
                        <div>
                            <div style={{ height: '4px', backgroundColor: '#f0f0f0', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', backgroundColor: '#DC2626', borderRadius: '2px', width: `${progresso}%`, transition: 'width 0.3s' }} />
                            </div>
                            <p style={{ fontSize: '11px', color: '#888', textAlign: 'center', marginTop: '6px' }}>
                                {progresso}% - {modoUpload === 'arquivo' ? 'Enviando video...' : 'Salvando...'}
                            </p>
                        </div>
                    )}

                    <button type="submit" disabled={loading || !form.titulo.trim() || !form.categoria || (modoUpload === 'url' && !form.url.trim()) || (modoUpload === 'arquivo' && !arquivoVideo)} style={{
                        width: '100%', padding: '14px',
                        backgroundColor: (loading || !form.titulo.trim() || !form.categoria || (modoUpload === 'url' && !form.url.trim()) || (modoUpload === 'arquivo' && !arquivoVideo)) ? '#ccc' : '#DC2626',
                        color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600',
                        cursor: (loading || !form.titulo.trim() || !form.categoria || (modoUpload === 'url' && !form.url.trim()) || (modoUpload === 'arquivo' && !arquivoVideo)) ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px'
                    }}>
                        {loading ? 'Enviando...' : (<><Upload size={18} />Enviar video</>)}
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

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', backgroundColor: '#fff',
    border: '1px solid #e5e5e5', borderRadius: '10px', fontSize: '14px',
    color: '#1a1a1a', outline: 'none'
}