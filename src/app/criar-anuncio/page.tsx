'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import {
    ArrowLeft, Camera, X, Plus, ChevronDown,
    DollarSign, MapPin, FileText, Bike
} from 'lucide-react'

const categorias = [
    'Bikes', 'Quadros', 'Suspensoes', 'Transmissao', 'Freios',
    'Rodas e Pneus', 'Cockpit', 'Pedais', 'Acessorios', 'Vestuario',
    'Componentes Eletricos', 'Ferramentas'
]

const modalidades = ['MTB', 'Speed', 'Urbana', 'Eletrica', 'Gravel', 'Downhill', 'BMX', 'Freeride', 'Cicloturismo']
const condicoes = ['Nova', 'Seminova', 'Usada']
const tamanhos = ['26', '27.5', '29', '700c', 'Outro']
const marcas = ['Trek', 'Specialized', 'Scott', 'Cannondale', 'Caloi', 'Giant', 'Santa Cruz', 'Outra']

export default function CriarAnuncioPage() {
    const [step, setStep] = useState(1)
    const [form, setForm] = useState({
        titulo: '',
        descricao: '',
        preco: '',
        categoria: '',
        marca: '',
        modelo: '',
        ano: '',
        modalidade: '',
        condicao: '',
        tamanho: '',
        localizacao: '',
    })
    const [imagens, setImagens] = useState<File[]>([])
    const [previews, setPreviews] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [sucesso, setSucesso] = useState(false)

    const handleChange = (field: string, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    const handleImagens = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (imagens.length + files.length > 10) {
            alert('Maximo 10 imagens')
            return
        }
        setImagens(prev => [...prev, ...files])
        files.forEach(file => {
            const reader = new FileReader()
            reader.onload = (e) => {
                setPreviews(prev => [...prev, e.target?.result as string])
            }
            reader.readAsDataURL(file)
        })
    }

    const removerImagem = (index: number) => {
        setImagens(prev => prev.filter((_, i) => i !== index))
        setPreviews(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async () => {
        if (!form.titulo || !form.preco || !form.categoria) {
            alert('Preencha os campos obrigatorios: titulo, preco e categoria')
            return
        }

        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('title', form.titulo)
            formData.append('description', form.descricao)
            formData.append('price', form.preco)
            formData.append('category', form.categoria)
            formData.append('brand', form.marca)
            formData.append('model', form.modelo)
            formData.append('year', form.ano)
            formData.append('bikeType', form.modalidade)
            formData.append('condition', form.condicao)
            formData.append('size', form.tamanho)
            formData.append('location', form.localizacao)
            imagens.forEach(img => formData.append('images', img))

            // await productService.criar(formData)

            // Simular envio
            await new Promise(resolve => setTimeout(resolve, 1500))
            setSucesso(true)
        } catch (error) {
            console.error('Erro ao criar anuncio:', error)
            alert('Erro ao criar anuncio')
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
                        Anuncio criado!
                    </h2>
                    <p style={{ fontSize: '14px', color: '#888', marginBottom: '20px' }}>
                        Seu produto esta no ar
                    </p>
                    <button onClick={() => window.location.href = '/perfil'} style={{
                        padding: '12px 30px', backgroundColor: '#DC2626', color: '#fff',
                        border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer'
                    }}>
                        Ver meus anuncios
                    </button>
                </div>
                <BottomNav />
            </div>
        )
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingBottom: '70px' }}>
            <Header />

            {/* Header com steps */}
            <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e5e5', padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                    <button onClick={() => step > 1 ? setStep(step - 1) : window.history.back()} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer' }}>
                        <ArrowLeft size={20} color="#1a1a1a" />
                    </button>
                    <h1 style={{ fontSize: '17px', fontWeight: '700', color: '#1a1a1a' }}>Criar anuncio</h1>
                </div>
                {/* Barra de progresso */}
                <div style={{ display: 'flex', gap: '4px' }}>
                    {[1, 2, 3].map((s) => (
                        <div key={s} style={{
                            flex: 1, height: '3px', borderRadius: '2px',
                            backgroundColor: s <= step ? '#DC2626' : '#e5e5e5',
                            transition: 'background 0.3s'
                        }} />
                    ))}
                </div>
            </div>

            {/* Step 1: Fotos */}
            {step === 1 && (
                <div style={{ padding: '16px' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a1a', marginBottom: '4px' }}>Fotos do produto</h2>
                    <p style={{ fontSize: '13px', color: '#888', marginBottom: '16px' }}>Adicione ate 10 fotos. A primeira sera a capa.</p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '20px' }}>
                        {previews.map((preview, index) => (
                            <div key={index} style={{
                                aspectRatio: '1', borderRadius: '10px', overflow: 'hidden',
                                position: 'relative', border: '1px solid #e5e5e5'
                            }}>
                                <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <button onClick={() => removerImagem(index)} style={{
                                    position: 'absolute', top: '4px', right: '4px',
                                    width: '22px', height: '22px', borderRadius: '50%',
                                    backgroundColor: 'rgba(0,0,0,0.6)', border: 'none',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                                }}>
                                    <X size={12} color="#fff" />
                                </button>
                                {index === 0 && (
                                    <span style={{
                                        position: 'absolute', bottom: '4px', left: '4px',
                                        backgroundColor: '#DC2626', color: '#fff',
                                        padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: '600'
                                    }}>CAPA</span>
                                )}
                            </div>
                        ))}
                        {previews.length < 10 && (
                            <label style={{
                                aspectRatio: '1', borderRadius: '10px',
                                border: '2px dashed #d1d5db', display: 'flex',
                                flexDirection: 'column', alignItems: 'center',
                                justifyContent: 'center', cursor: 'pointer',
                                backgroundColor: '#fafafa'
                            }}>
                                <Camera size={28} color="#999" />
                                <span style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>Adicionar</span>
                                <input type="file" accept="image/*" multiple onChange={handleImagens} style={{ display: 'none' }} />
                            </label>
                        )}
                    </div>

                    <button onClick={() => setStep(2)} disabled={previews.length === 0} style={{
                        width: '100%', padding: '14px', backgroundColor: previews.length === 0 ? '#ccc' : '#DC2626',
                        color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px',
                        fontWeight: '600', cursor: previews.length === 0 ? 'not-allowed' : 'pointer'
                    }}>
                        Continuar
                    </button>
                </div>
            )}

            {/* Step 2: Informacoes basicas */}
            {step === 2 && (
                <div style={{ padding: '16px' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a1a', marginBottom: '16px' }}>Informacoes do produto</h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <Input label="Titulo *" placeholder="Ex: Trek Marlin 7 2024" value={form.titulo} onChange={(v) => handleChange('titulo', v)} icon={<Bike size={16} color="#999" />} />

                        <div>
                            <label style={labelStyle}>Categoria *</label>
                            <Select value={form.categoria} onChange={(v) => handleChange('categoria', v)} options={categorias} />
                        </div>

                        <Input label="Marca" placeholder="Ex: Trek" value={form.marca} onChange={(v) => handleChange('marca', v)} />
                        <Input label="Modelo" placeholder="Ex: Marlin 7" value={form.modelo} onChange={(v) => handleChange('modelo', v)} />
                        <Input label="Ano" placeholder="Ex: 2024" value={form.ano} onChange={(v) => handleChange('ano', v)} type="number" />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div>
                                <label style={labelStyle}>Condicao</label>
                                <Select value={form.condicao} onChange={(v) => handleChange('condicao', v)} options={condicoes} />
                            </div>
                            <div>
                                <label style={labelStyle}>Tamanho</label>
                                <Select value={form.tamanho} onChange={(v) => handleChange('tamanho', v)} options={tamanhos} />
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>Modalidade</label>
                            <Select value={form.modalidade} onChange={(v) => handleChange('modalidade', v)} options={modalidades} />
                        </div>

                        <Input label="Preco (R$) *" placeholder="Ex: 4500" value={form.preco} onChange={(v) => handleChange('preco', v)} type="number" icon={<DollarSign size={16} color="#999" />} />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <button onClick={() => setStep(1)} style={btnVoltar}>Voltar</button>
                        <button onClick={() => setStep(3)} disabled={!form.titulo || !form.preco || !form.categoria} style={{
                            flex: 1, padding: '14px', backgroundColor: (!form.titulo || !form.preco || !form.categoria) ? '#ccc' : '#DC2626',
                            color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px',
                            fontWeight: '600', cursor: (!form.titulo || !form.preco || !form.categoria) ? 'not-allowed' : 'pointer'
                        }}>Continuar</button>
                    </div>
                </div>
            )}

            {/* Step 3: Descricao e localizacao */}
            {step === 3 && (
                <div style={{ padding: '16px' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a1a', marginBottom: '16px' }}>Detalhes finais</h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div>
                            <label style={labelStyle}>Descricao</label>
                            <textarea
                                value={form.descricao}
                                onChange={(e) => handleChange('descricao', e.target.value)}
                                placeholder="Descreva o produto, estado de conservacao, componentes..."
                                rows={5}
                                style={{
                                    width: '100%', padding: '12px 14px', backgroundColor: '#fff',
                                    border: '1px solid #e5e5e5', borderRadius: '10px', fontSize: '14px',
                                    color: '#1a1a1a', outline: 'none', resize: 'vertical',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>

                        <Input label="Localizacao" placeholder="Ex: Sao Paulo - SP" value={form.localizacao} onChange={(v) => handleChange('localizacao', v)} icon={<MapPin size={16} color="#999" />} />

                        {/* Resumo */}
                        <div style={{ backgroundColor: '#f9f9f9', borderRadius: '10px', padding: '14px', border: '1px solid #e5e5e5' }}>
                            <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#1a1a1a', marginBottom: '10px' }}>Resumo do anuncio</h3>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {previews[0] && (
                                    <img src={previews[0]} alt="" style={{ width: '70px', height: '70px', borderRadius: '8px', objectFit: 'cover' }} />
                                )}
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>{form.titulo || 'Sem titulo'}</p>
                                    <p style={{ fontSize: '13px', color: '#888' }}>{form.categoria}{form.marca ? ` • ${form.marca}` : ''}</p>
                                    <p style={{ fontSize: '16px', fontWeight: '700', color: '#DC2626', marginTop: '4px' }}>
                                        {form.preco ? `R$ ${Number(form.preco).toLocaleString('pt-BR')}` : 'R$ 0'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <button onClick={() => setStep(2)} style={btnVoltar}>Voltar</button>
                        <button onClick={handleSubmit} disabled={loading} style={{
                            flex: 1, padding: '14px', backgroundColor: loading ? '#ccc' : '#16A34A',
                            color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px',
                            fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer'
                        }}>
                            {loading ? 'Publicando...' : 'Publicar anuncio'}
                        </button>
                    </div>
                </div>
            )}

            <BottomNav />
        </div>
    )
}

function Input({ label, placeholder, value, onChange, type = 'text', icon }: {
    label: string; placeholder: string; value: string; onChange: (v: string) => void; type?: string; icon?: React.ReactNode
}) {
    return (
        <div>
            <label style={labelStyle}>{label}</label>
            <div style={{ position: 'relative' }}>
                {icon && <div style={{ position: 'absolute', left: '12px', top: '13px' }}>{icon}</div>}
                <input
                    type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
                    style={{
                        width: '100%', padding: icon ? '12px 12px 12px 36px' : '12px 14px',
                        backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '10px',
                        fontSize: '14px', color: '#1a1a1a', outline: 'none'
                    }}
                />
            </div>
        </div>
    )
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
    return (
        <div style={{ position: 'relative' }}>
            <select
                value={value} onChange={(e) => onChange(e.target.value)}
                style={{
                    width: '100%', padding: '12px 14px', backgroundColor: '#fff',
                    border: '1px solid #e5e5e5', borderRadius: '10px', fontSize: '14px',
                    color: value ? '#1a1a1a' : '#999', outline: 'none',
                    appearance: 'none', cursor: 'pointer'
                }}
            >
                <option value="" disabled>Selecionar...</option>
                {options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
            <ChevronDown size={16} color="#999" style={{ position: 'absolute', right: '12px', top: '13px', pointerEvents: 'none' }} />
        </div>
    )
}

const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '13px', fontWeight: '600', color: '#1a1a1a', marginBottom: '6px'
}

const btnVoltar: React.CSSProperties = {
    padding: '14px 20px', backgroundColor: '#fff', border: '1px solid #e5e5e5',
    borderRadius: '10px', fontSize: '14px', fontWeight: '600', color: '#666', cursor: 'pointer'
}