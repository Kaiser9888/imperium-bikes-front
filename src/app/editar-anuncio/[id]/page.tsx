'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import {
    ArrowLeft, Camera, X, ChevronDown,
    DollarSign, MapPin, Bike, Trash2
} from 'lucide-react'
import { productService } from '@/services/productService'


const categorias = [
    'Bikes', 'Quadros', 'Suspensoes', 'Transmissao', 'Freios',
    'Rodas e Pneus', 'Cockpit', 'Pedais', 'Acessorios', 'Vestuario',
    'Componentes Eletricos', 'Ferramentas'
]

const modalidades = ['MTB', 'Speed', 'Urbana', 'Eletrica', 'Gravel', 'Downhill', 'BMX', 'Freeride']
const condicoes = ['Nova', 'Seminova', 'Usada']
const tamanhos = ['26', '27.5', '29', '700c', 'Outro']

export default function EditarAnuncioPage() {
    const params = useParams()
    const id = Number(params.id)

    const [loading, setLoading] = useState(true)
    const [salvando, setSalvando] = useState(false)
    const [sucesso, setSucesso] = useState(false)
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
    const [imagensExistentes, setImagensExistentes] = useState<{ id: number; url: string }[]>([])
    const [novasImagens, setNovasImagens] = useState<File[]>([])
    const [previewsNovas, setPreviewsNovas] = useState<string[]>([])
    const [imagensRemovidas, setImagensRemovidas] = useState<number[]>([])

    useEffect(() => {
        async function carregar() {
            setLoading(true)
            try {
                const data = await productService.buscarPorId(id)
                setForm({
                    titulo: data.title || '',
                    descricao: data.description || '',
                    preco: data.price?.toString() || '',
                    categoria: data.category?.name || data.bikeType || '',
                    marca: data.brand || '',
                    modelo: data.model || '',
                    ano: data.year?.toString() || '',
                    modalidade: data.bikeType || '',
                    condicao: data.condition || '',
                    tamanho: data.size || '',
                    localizacao: data.location || '',
                })
                setImagensExistentes(data.images || [])
            } catch (error) {
                console.error('Erro ao carregar produto:', error)
                // Dados mockados
                setForm({
                    titulo: 'Trek Marlin 7 2024',
                    descricao: 'Bike em perfeito estado.',
                    preco: '4500',
                    categoria: 'Bikes',
                    marca: 'Trek',
                    modelo: 'Marlin 7',
                    ano: '2024',
                    modalidade: 'MTB',
                    condicao: 'Nova',
                    tamanho: '29',
                    localizacao: 'Sao Paulo - SP',
                })
                setImagensExistentes([
                    { id: 1, url: '/header/mtb.jpg' },
                    { id: 2, url: '/header/speed.jpg' },
                ])
            } finally {
                setLoading(false)
            }
        }
        if (id) carregar()
    }, [id])

    const handleChange = (field: string, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    const handleNovasImagens = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        const total = imagensExistentes.length - imagensRemovidas.length + novasImagens.length + files.length
        if (total > 10) {
            alert('Maximo 10 imagens')
            return
        }
        setNovasImagens(prev => [...prev, ...files])
        files.forEach(file => {
            const reader = new FileReader()
            reader.onload = (e) => setPreviewsNovas(prev => [...prev, e.target?.result as string])
            reader.readAsDataURL(file)
        })
    }

    const removerImagemExistente = (id: number) => {
        setImagensRemovidas(prev => [...prev, id])
    }

    const removerNovaImagem = (index: number) => {
        setNovasImagens(prev => prev.filter((_, i) => i !== index))
        setPreviewsNovas(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async () => {
        if (!form.titulo || !form.preco) {
            alert('Preencha titulo e preco')
            return
        }

        setSalvando(true)
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

            imagensRemovidas.forEach(imgId => formData.append('removerImagens', imgId.toString()))
            novasImagens.forEach(img => formData.append('novasImagens', img))

            // await productService.atualizar(id, formData)
            await new Promise(resolve => setTimeout(resolve, 1000))
            setSucesso(true)
        } catch (error) {
            console.error('Erro ao atualizar:', error)
            alert('Erro ao salvar')
        } finally {
            setSalvando(false)
        }
    }

    const handleExcluir = async () => {
        if (!confirm('Tem certeza que deseja excluir este anuncio?')) return
        try {
            // await productService.deletar(id)
            alert('Anuncio excluido')
            window.location.href = '/perfil'
        } catch (error) {
            alert('Erro ao excluir')
        }
    }

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingBottom: '70px' }}>
                <Header />
                <div style={{ padding: '16px' }}>
                    <div style={{ height: '200px', backgroundColor: '#eee', borderRadius: '10px', marginBottom: '16px' }} />
                    <div style={{ height: '20px', backgroundColor: '#eee', borderRadius: '6px', width: '60%', marginBottom: '8px' }} />
                    <div style={{ height: '20px', backgroundColor: '#eee', borderRadius: '6px', width: '40%' }} />
                </div>
                <BottomNav />
            </div>
        )
    }

    if (sucesso) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingBottom: '70px' }}>
                <Header />
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <span style={{ fontSize: '40px', color: '#fff' }}>OK</span>
                    </div>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a1a', marginBottom: '8px' }}>Anuncio atualizado!</h2>
                    <button onClick={() => window.location.href = '/perfil'} style={{ padding: '12px 30px', backgroundColor: '#DC2626', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '16px' }}>
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

            {/* Header */}
            <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e5e5', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={() => window.history.back()} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer' }}>
                        <ArrowLeft size={20} color="#1a1a1a" />
                    </button>
                    <h1 style={{ fontSize: '17px', fontWeight: '700', color: '#1a1a1a' }}>Editar anuncio</h1>
                </div>
                <button onClick={handleExcluir} style={{ background: 'none', border: 'none', padding: '6px', cursor: 'pointer', color: '#DC2626' }}>
                    <Trash2 size={18} />
                </button>
            </div>

            <div style={{ padding: '16px' }}>
                {/* Imagens */}
                <div style={{ marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#1a1a1a', marginBottom: '10px' }}>Fotos</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                        {/* Imagens existentes (nao removidas) */}
                        {imagensExistentes.filter(img => !imagensRemovidas.includes(img.id)).map((img, index) => (
                            <div key={img.id} style={{ aspectRatio: '1', borderRadius: '10px', overflow: 'hidden', position: 'relative', border: '1px solid #e5e5e5' }}>
                                <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <button onClick={() => removerImagemExistente(img.id)} style={{
                                    position: 'absolute', top: '4px', right: '4px',
                                    width: '22px', height: '22px', borderRadius: '50%',
                                    backgroundColor: 'rgba(220,38,38,0.8)', border: 'none',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                                }}>
                                    <X size={12} color="#fff" />
                                </button>
                            </div>
                        ))}
                        {/* Novas imagens */}
                        {previewsNovas.map((preview, index) => (
                            <div key={`new-${index}`} style={{ aspectRatio: '1', borderRadius: '10px', overflow: 'hidden', position: 'relative', border: '1px solid #16A34A' }}>
                                <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <button onClick={() => removerNovaImagem(index)} style={{
                                    position: 'absolute', top: '4px', right: '4px',
                                    width: '22px', height: '22px', borderRadius: '50%',
                                    backgroundColor: 'rgba(0,0,0,0.6)', border: 'none',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                                }}>
                                    <X size={12} color="#fff" />
                                </button>
                            </div>
                        ))}
                        {/* Botao adicionar */}
                        {(imagensExistentes.filter(img => !imagensRemovidas.includes(img.id)).length + novasImagens.length) < 10 && (
                            <label style={{ aspectRatio: '1', borderRadius: '10px', border: '2px dashed #d1d5db', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backgroundColor: '#fafafa' }}>
                                <Camera size={24} color="#999" />
                                <span style={{ fontSize: '10px', color: '#999', marginTop: '4px' }}>Adicionar</span>
                                <input type="file" accept="image/*" multiple onChange={handleNovasImagens} style={{ display: 'none' }} />
                            </label>
                        )}
                    </div>
                </div>

                {/* Formulario */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <Input label="Titulo *" value={form.titulo} onChange={(v) => handleChange('titulo', v)} icon={<Bike size={16} color="#999" />} />

                    <div>
                        <label style={labelStyle}>Categoria *</label>
                        <Select value={form.categoria} onChange={(v) => handleChange('categoria', v)} options={categorias} />
                    </div>

                    <Input label="Marca" value={form.marca} onChange={(v) => handleChange('marca', v)} />
                    <Input label="Modelo" value={form.modelo} onChange={(v) => handleChange('modelo', v)} />
                    <Input label="Ano" value={form.ano} onChange={(v) => handleChange('ano', v)} type="number" />

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

                    <Input label="Preco (R$) *" value={form.preco} onChange={(v) => handleChange('preco', v)} type="number" icon={<DollarSign size={16} color="#999" />} />
                    <Input label="Localizacao" value={form.localizacao} onChange={(v) => handleChange('localizacao', v)} icon={<MapPin size={16} color="#999" />} />

                    <div>
                        <label style={labelStyle}>Descricao</label>
                        <textarea value={form.descricao} onChange={(e) => handleChange('descricao', e.target.value)} rows={4}
                                  style={{ width: '100%', padding: '12px 14px', backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '10px', fontSize: '14px', color: '#1a1a1a', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
                    </div>
                </div>

                {/* Botoes */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                    <button onClick={() => window.history.back()} style={btnCancelar}>Cancelar</button>
                    <button onClick={handleSubmit} disabled={salvando} style={{
                        flex: 1, padding: '14px', backgroundColor: salvando ? '#ccc' : '#DC2626',
                        color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px',
                        fontWeight: '600', cursor: salvando ? 'not-allowed' : 'pointer'
                    }}>{salvando ? 'Salvando...' : 'Salvar alteracoes'}</button>
                </div>

                {/* Botao excluir */}
                <button onClick={handleExcluir} style={{
                    width: '100%', padding: '14px', marginTop: '12px',
                    backgroundColor: '#fff', border: '1px solid #FECACA',
                    borderRadius: '10px', color: '#DC2626', fontSize: '14px',
                    fontWeight: '600', cursor: 'pointer'
                }}>
                    Excluir anuncio
                </button>
            </div>

            <BottomNav />
        </div>
    )
}

function Input({ label, value, onChange, type = 'text', icon }: {
    label: string; value: string; onChange: (v: string) => void; type?: string; icon?: React.ReactNode
}) {
    return (
        <div>
            <label style={labelStyle}>{label}</label>
            <div style={{ position: 'relative' }}>
                {icon && <div style={{ position: 'absolute', left: '12px', top: '13px' }}>{icon}</div>}
                <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
                       style={{ width: '100%', padding: icon ? '12px 12px 12px 36px' : '12px 14px', backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '10px', fontSize: '14px', color: '#1a1a1a', outline: 'none' }} />
            </div>
        </div>
    )
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
    return (
        <div style={{ position: 'relative' }}>
            <select value={value} onChange={(e) => onChange(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px', backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '10px', fontSize: '14px', color: value ? '#1a1a1a' : '#999', outline: 'none', appearance: 'none', cursor: 'pointer' }}>
                <option value="" disabled>Selecionar...</option>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <ChevronDown size={16} color="#999" style={{ position: 'absolute', right: '12px', top: '13px', pointerEvents: 'none' }} />
        </div>
    )
}

const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '13px', fontWeight: '600', color: '#1a1a1a', marginBottom: '6px'
}

const btnCancelar: React.CSSProperties = {
    padding: '14px 20px', backgroundColor: '#fff', border: '1px solid #e5e5e5',
    borderRadius: '10px', fontSize: '14px', fontWeight: '600', color: '#666', cursor: 'pointer'
}
