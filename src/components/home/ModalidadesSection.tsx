'use client'

import { Mountain, Zap, Battery, Bike } from 'lucide-react'

const modalidades = [
    {
        nome: 'MTB',
        desc: 'Mountain Bike',
        imagem: '/header/mtb.jpg',
        slug: 'mtb',
        icon: Mountain,
        cor: '#4CAF50'
    },
    {
        nome: 'Speed',
        desc: 'Ciclismo de Estrada',
        imagem: '/header/speed.jpg',
        slug: 'speed',
        icon: Zap,
        cor: '#2196F3'
    },
    {
        nome: 'Downhill',
        desc: 'Descida Radical',
        imagem: '/header/downhill1.jpg',
        slug: 'downhill',
        icon: Mountain,
        cor: '#FF5722'
    },
    {
        nome: 'BMX',
        desc: 'Manobras e Corridas',
        imagem: '/header/bmx.jpg',
        slug: 'bmx',
        icon: Bike,
        cor: '#FFC107'
    },
    {
        nome: 'Gravel',
        desc: 'Estrada e Terra',
        imagem: '/header/midia2.jpg',  // ou qualquer foto
        slug: 'gravel',
        icon: Bike,
        cor: '#795548'
    },
]

export function ModalidadesSection() {
    return (
        <section style={{ padding: '0 16px 16px 16px' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
            }}>
                <h2 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#1a1a1a'
                }}>
                    Modalidades
                </h2>
                <span style={{
                    fontSize: '13px',
                    color: '#DC2626',
                    cursor: 'pointer',
                    fontWeight: '500'
                }}>
          Ver todas
        </span>
            </div>

            <div style={{
                display: 'flex',
                gap: '10px',
                overflowX: 'auto',
                paddingBottom: '4px'
            }}>
                {modalidades.map((mod, index) => {
                    const Icon = mod.icon
                    return (
                        <div
                            key={index}
                            onClick={() => window.location.href = `/produtos?modalidade=${mod.slug}`}
                            style={{
                                minWidth: '140px',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                flexShrink: 0,
                                border: '1px solid #e5e5e5',
                                backgroundColor: '#fff',
                                transition: 'transform 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.02)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)'
                            }}
                        >
                            {/* Imagem */}
                            <div style={{
                                height: '90px',
                                backgroundImage: `url(${mod.imagem})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                position: 'relative'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    top: 8,
                                    left: 8,
                                    backgroundColor: mod.cor,
                                    borderRadius: '50%',
                                    width: '30px',
                                    height: '30px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Icon size={16} color="#fff" />
                                </div>
                            </div>

                            {/* Info */}
                            <div style={{ padding: '10px 12px' }}>
                                <h3 style={{
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    color: '#1a1a1a',
                                    marginBottom: '2px'
                                }}>
                                    {mod.nome}
                                </h3>
                                <p style={{
                                    fontSize: '12px',
                                    color: '#888'
                                }}>
                                    {mod.desc}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>

            <style>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
        </section>
    )
}