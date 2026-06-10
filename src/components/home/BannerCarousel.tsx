'use client'

import { useState, useEffect } from 'react'

const banners = [
    {
        id: 1,
        titulo: 'Nova Coleção 2026',
        subtitulo: 'As melhores bikes para você',
        cor: '#DC2626',
        imagem: '/header/speed.jpg'
    },
    {
        id: 2,
        titulo: 'Até 30% OFF',
        subtitulo: 'Em acessórios e peças',
        cor: '#1a1a1a',
        imagem: '/header/mtb.jpg'
    },
    {
        id: 3,
        titulo: 'Torneios Imperium',
        subtitulo: 'Inscreva-se e participe',
        cor: '#DC2626',
        imagem: '/header/downhill1.jpg'
    },
]

export function BannerCarousel() {
    const [atual, setAtual] = useState(0)

    useEffect(() => {
        const intervalo = setInterval(() => {
            setAtual((prev) => (prev + 1) % banners.length)
        }, 4000)
        return () => clearInterval(intervalo)
    }, [])

    return (
        <div style={{ padding: '0 16px 16px 16px' }}>
            <div className="banner-height" style={{
                position: 'relative',
                height: '160px',
                borderRadius: '16px',
                overflow: 'hidden'
            }}>
                {banners.map((banner, index) => (
                    <div
                        key={banner.id}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            opacity: index === atual ? 1 : 0,
                            transition: 'opacity 0.6s ease-in-out',
                            backgroundImage: `url(${banner.imagem})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            cursor: 'pointer'
                        }}
                        onClick={() => window.location.href = '/produtos'}
                    >
                        {/* Overlay gradiente */}
                        <div style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            background: `linear-gradient(135deg, ${banner.cor}dd, ${banner.cor}88)`
                        }} />

                        {/* Conteúdo */}
                        <div style={{
                            position: 'relative',
                            zIndex: 1,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            padding: '24px'
                        }}>
                            <h2 style={{
                                color: '#ffffff',
                                fontSize: '22px',
                                fontWeight: 'bold',
                                marginBottom: '6px',
                                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                            }}>
                                {banner.titulo}
                            </h2>
                            <p style={{
                                color: 'rgba(255,255,255,0.9)',
                                fontSize: '14px',
                                marginBottom: '16px'
                            }}>
                                {banner.subtitulo}
                            </p>
                            <button style={{
                                backgroundColor: '#ffffff',
                                color: banner.cor,
                                border: 'none',
                                padding: '8px 20px',
                                borderRadius: '20px',
                                fontSize: '13px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                width: 'fit-content',
                                transition: 'transform 0.2s'
                            }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'scale(1.05)'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'scale(1)'
                                    }}
                            >
                                Ver Ofertas
                            </button>
                        </div>
                    </div>
                ))}

                {/* Indicadores */}
                <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: '6px',
                    zIndex: 2
                }}>
                    {banners.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setAtual(index)}
                            style={{
                                width: index === atual ? '20px' : '6px',
                                height: '6px',
                                borderRadius: '3px',
                                border: 'none',
                                backgroundColor: index === atual ? '#ffffff' : 'rgba(255,255,255,0.5)',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}