'use client'

import { useState } from 'react'
import {
    Grid3X3, Heart, Video, MessageCircle, Trophy,
    Mountain, Zap, Building2, Bike, Wrench, Shield, Shirt
} from 'lucide-react'

const modalidades = [
    { icon: Mountain, nome: 'MTB', slug: 'mtb' },
    { icon: Zap, nome: 'Speed', slug: 'speed' },
    { icon: Building2, nome: 'Urbana', slug: 'urbana' },
    { icon: Bike, nome: 'Gravel', slug: 'gravel' },
    { icon: Mountain, nome: 'Downhill', slug: 'downhill' },
    { icon: Zap, nome: 'Freeride', slug: 'freeride' },
    { icon: Bike, nome: 'BMX', slug: 'bmx' },
    { icon: Wrench, nome: 'Peças', slug: 'pecas' },
    { icon: Shield, nome: 'Acessórios', slug: 'acessorios' },
    { icon: Shirt, nome: 'Vestuário', slug: 'vestuario' },
]

export function CategoryChips() {
    const [categoriasOpen, setCategoriasOpen] = useState(false)

    return (
        <>
            <div style={{ padding: '12px 16px' }}>
                <div style={{
                    display: 'flex',
                    gap: '6px',
                    overflowX: 'auto',
                    paddingBottom: '4px'
                }}>
                    <Chip
                        icon={<Grid3X3 size={14} />}
                        label="Categorias"
                        isAtivo={categoriasOpen}
                        onClick={() => setCategoriasOpen(!categoriasOpen)}
                    />
                    <Chip icon={<Heart size={14} />} label="Favoritos" onClick={() => window.location.href = '/favoritos'} />
                    <Chip icon={<Video size={14} />} label="Videos" onClick={() => window.location.href = '/videos'} />
                    <Chip icon={<MessageCircle size={14} />} label="Forum" onClick={() => window.location.href = '/forum'} />
                    <Chip icon={<Trophy size={14} />} label="Torneios" onClick={() => window.location.href = '/torneios'} />
                </div>
            </div>

            {/* Modal Categorias */}
            {categoriasOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    zIndex: 55,
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    paddingTop: '120px'
                }}>
                    <div
                        onClick={() => setCategoriasOpen(false)}
                        style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.5)'
                        }}
                    />
                    <div style={{
                        position: 'relative',
                        backgroundColor: '#1a1a1a',
                        borderRadius: '16px',
                        padding: '20px',
                        width: '90%',
                        maxWidth: '400px',
                        maxHeight: '70vh',
                        overflowY: 'auto',
                        border: '1px solid #333',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '10px'
                    }}>
                        <h3 style={{
                            gridColumn: '1 / -1',
                            color: '#fff',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            marginBottom: '4px'
                        }}>
                            Categorias
                        </h3>
                        {modalidades.map((mod, index) => {
                            const Icon = mod.icon
                            return (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setCategoriasOpen(false)
                                        window.location.href = `/produtos?categoria=${mod.slug}`
                                    }}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '14px 8px',
                                        backgroundColor: '#222',
                                        border: '1px solid #333',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        color: '#ccc',
                                        fontSize: '12px',
                                        fontWeight: '500',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = '#DC2626'
                                        e.currentTarget.style.color = '#fff'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = '#333'
                                        e.currentTarget.style.color = '#ccc'
                                    }}
                                >
                                    <Icon size={28} color="#DC2626" />
                                    <span>{mod.nome}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            <style>{`
                div::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </>
    )
}

function Chip({ icon, label, isAtivo = false, onClick }: {
    icon: React.ReactNode
    label: string
    isAtivo?: boolean
    onClick?: () => void
}) {
    return (
        <button
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '8px 14px',
                borderRadius: '20px',
                border: isAtivo ? '1.5px solid #DC2626' : '1.5px solid #e5e5e5',
                backgroundColor: isAtivo ? '#DC2626' : '#ffffff',
                color: isAtivo ? '#ffffff' : '#666666',
                fontSize: '13px',
                fontWeight: isAtivo ? '600' : '400',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 0.2s'
            }}
        >
            {icon}
            <span>{label}</span>
        </button>
    )
}