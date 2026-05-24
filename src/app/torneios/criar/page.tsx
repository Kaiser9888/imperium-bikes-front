'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import {
    ArrowLeft, Trophy, MapPin, Calendar, Clock,
    Users, DollarSign, FileText, Image as ImageIcon, X
} from 'lucide-react'
import Link from 'next/link'

const modalidades = ['MTB', 'Speed', 'Downhill', 'BMX', 'Gravel', 'Enduro', 'Cicloturismo', 'Outra']

export default function CriarTorneioPage() {
    const [form, setForm] = useState({
        titulo: '',
        descricao: '',
        modalidade: '',
        data: '',
        horario: '',
        local: '',
        maxParticipantes: '50',
        premio: '',
        regras: '',
        valorInscricao: ''
    })
    const [banner, setBanner] = useState<File | null>(null)
    const [bannerPreview, setBannerPreview] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState('')
    const [sucesso, setSucesso] = useState(false)

    const handleChange = (field: string, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    const handleBanner = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setBanner(file)
            const reader = new FileReader()
            reader.onload = (e) => setBannerPreview(e.target?.result as string)
            reader.readAsDataURL(file)
        }
    }

    const removerBanner = () => {
        setBanner(null)
        setBannerPreview(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErro('')

        if (!form.titulo.trim()) { setErro('Informe o titulo do torneio'); return }
        if (!form.modalidade) { setErro('Selecione a modalidade'); return }
        if (!form.data) { setErro('Informe a data'); return }
        if (!form.horario) { setErro('Informe o horario'); return }
        if (!form.local.trim()) { setErro('Informe o local'); return }

        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('title', form.titulo)
            formData.append('description', form.descricao)
            formData.append('modality', form.modalidade)
            formData.append('date', form.data)
            formData.append('time', form.horario)
            formData.append('location', form.local)
            formData.append('maxParticipants', form.maxParticipantes)
            formData.append('prize', form.premio)
            formData.append('rules', form.regras)
            formData.append('entryFee', form.valorInscricao)
            if (banner) formData.append('banner', banner)

            // await api.post('/api/tournaments', formData)
            await new Promise(resolve => setTimeout(resolve, 1000))
            setSucesso(true)
        } catch (error) {
            console.error('Erro ao criar torneio:', error)
            setErro('Erro ao criar torneio. Tente novamente.')
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
                        <Trophy size={40} color="#fff" />
                    </div>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a1a', marginBottom: '8px' }}>
                        Torneio criado!
                    </h2>
                    <p style={{ fontSize: '14px', color: '#888', marginBottom: '20px' }}>
                        Seu torneio foi publicado com sucesso
                    </p>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <Link href="/torneios" style={{
                            padding: '12px 24px', backgroundColor: '#DC2626', color: '#fff',
                            borderRadius: '10px', fontSize: '14px', fontWeight: '600', textDecoration: 'none'
                        }}>Ver torneios</Link>
                        <Link href="/torneios/criar" style={{
                            padding: '12px 24px', backgroundColor: '#fff', color: '#DC2626',
                            border: '1px solid #DC2626', borderRadius: '10px', fontSize: '14px',
                            fontWeight: '600', textDecoration: 'none'
                        }}>Criar outro</Link>
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
                    <Link href="/torneios" style={{ display: 'flex', padding: '4px' }}>
                        <ArrowLeft size={20} color="#1a1a1a" />
                    </Link>
                    <h1 style={{ fontSize: '17px', fontWeight: '700', color: '#1a1a1a' }}>Criar torneio</h1>
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

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                    {/* Banner */}
                    <div>
                        <label style={labelStyle}><ImageIcon size={14} />Banner do torneio (opcional)</label>
                        {bannerPreview ? (
                            <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', height: '140px' }}>
                                <img src={bannerPreview} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <button type="button" onClick={removerBanner}
                                        style={{ position: 'absolute', top: '8px', right: '8px', width: '26px', height: '26px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.6)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                    <X size={14} color="#fff" />
                                </button>
                            </div>
                        ) : (
                            <label style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                justifyContent: 'center', height: '140px',
                                border: '2px dashed #d1d5db', borderRadius: '10px',
                                cursor: 'pointer', backgroundColor: '#fafafa'
                            }}>
                                <ImageIcon size={28} color="#999" />
                                <span style={{ fontSize: '13px', color: '#999', marginTop: '6px' }}>Adicionar banner</span>
                                <span style={{ fontSize: '11px', color: '#ccc', marginTop: '2px' }}>Recomendado: 1200x400px</span>
                                <input type="file" accept="image/*" onChange={handleBanner} style={{ display: 'none' }} />
                            </label>
                        )}
                    </div>

                    {/* Titulo */}
                    <div>
                        <label style={labelStyle}><Trophy size={14} />Titulo do torneio *</label>
                        <input type="text" value={form.titulo} onChange={(e) => handleChange('titulo', e.target.value)}
                               placeholder="Ex: Campeonato Paulista de MTB 2025" maxLength={100}
                               style={inputStyle} />
                        <p style={{ fontSize: '11px', color: '#aaa', marginTop: '4px', textAlign: 'right' }}>{form.titulo.length}/100</p>
                    </div>

                    {/* Modalidade */}
                    <div>
                        <label style={labelStyle}><Trophy size={14} />Modalidade *</label>
                        <select value={form.modalidade} onChange={(e) => handleChange('modalidade', e.target.value)}
                                style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}>
                            <option value="" disabled>Selecionar modalidade...</option>
                            {modalidades.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>

                    {/* Data e Horario */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                            <label style={labelStyle}><Calendar size={14} />Data *</label>
                            <input type="date" value={form.data} onChange={(e) => handleChange('data', e.target.value)}
                                   style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}><Clock size={14} />Horario *</label>
                            <input type="time" value={form.horario} onChange={(e) => handleChange('horario', e.target.value)}
                                   style={inputStyle} />
                        </div>
                    </div>

                    {/* Local */}
                    <div>
                        <label style={labelStyle}><MapPin size={14} />Local *</label>
                        <input type="text" value={form.local} onChange={(e) => handleChange('local', e.target.value)}
                               placeholder="Ex: Parque do Ibirapuera - Sao Paulo" style={inputStyle} />
                    </div>

                    {/* Max participantes e Valor */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                            <label style={labelStyle}><Users size={14} />Max participantes</label>
                            <input type="number" value={form.maxParticipantes} onChange={(e) => handleChange('maxParticipantes', e.target.value)}
                                   min="2" max="1000" style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}><DollarSign size={14} />Valor inscricao</label>
                            <input type="number" value={form.valorInscricao} onChange={(e) => handleChange('valorInscricao', e.target.value)}
                                   placeholder="R$ 0 = Gratuito" min="0" style={inputStyle} />
                        </div>
                    </div>

                    {/* Premio */}
                    <div>
                        <label style={labelStyle}><Trophy size={14} />Premiacao</label>
                        <input type="text" value={form.premio} onChange={(e) => handleChange('premio', e.target.value)}
                               placeholder="Ex: R$ 5.000 + Trofeu" style={inputStyle} />
                    </div>

                    {/* Descricao */}
                    <div>
                        <label style={labelStyle}><FileText size={14} />Descricao</label>
                        <textarea value={form.descricao} onChange={(e) => handleChange('descricao', e.target.value)}
                                  placeholder="Descreva o torneio, categorias, formato da competicao..."
                                  rows={4} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.5' }} />
                    </div>

                    {/* Regras */}
                    <div>
                        <label style={labelStyle}><FileText size={14} />Regras</label>
                        <textarea value={form.regras} onChange={(e) => handleChange('regras', e.target.value)}
                                  placeholder="Regras do torneio, requisitos, equipamentos obrigatorios..."
                                  rows={4} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.5' }} />
                    </div>

                    {/* Botao */}
                    <button type="submit" disabled={loading || !form.titulo.trim() || !form.modalidade || !form.data || !form.horario || !form.local.trim()} style={{
                        width: '100%', padding: '14px',
                        backgroundColor: (loading || !form.titulo.trim() || !form.modalidade || !form.data || !form.horario || !form.local.trim()) ? '#ccc' : '#DC2626',
                        color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600',
                        cursor: (loading || !form.titulo.trim() || !form.modalidade || !form.data || !form.horario || !form.local.trim()) ? 'not-allowed' : 'pointer',
                        marginTop: '8px'
                    }}>
                        {loading ? 'Criando...' : 'Criar torneio'}
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