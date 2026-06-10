'use client'

import { Heart, MapPin, Star } from 'lucide-react'
import { useState } from 'react'

interface BikeCardProps {
    id: number
    titulo: string
    preco: number
    imagem?: string
    marca: string
    modelo: string
    ano: number
    localizacao: string
    rating: number
    avaliacoes: number
    condicao: string
    modalidade: string
    favorito?: boolean
}

export function BikeCard({
                             id,
                             titulo,
                             preco,
                             imagem,
                             marca,
                             modelo,
                             ano,
                             localizacao,
                             rating,
                             avaliacoes,
                             condicao,
                             modalidade,
                             favorito = false,
                         }: BikeCardProps) {
    const [isFavorito, setIsFavorito] = useState(favorito)

    const formatarPreco = (valor: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(valor)
    }

    return (
        <div
            onClick={() => window.location.href = `/produto/${id}`}
            style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid #e5e5e5',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                marginBottom: '16px'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)'
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
            }}
        >
            {/* Imagem */}
            <div style={{
                position: 'relative',
                height: '200px',
                backgroundColor: '#e5e5e5',
                backgroundImage: imagem ? `url(${imagem})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: imagem ? undefined : 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {!imagem && (
                    <span style={{ fontSize: '60px' }}>🚲</span>
                )}

                {/* Botão Favorito */}
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        setIsFavorito(!isFavorito)
                    }}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)'
                    }}
                >
                    <Heart
                        size={18}
                        color={isFavorito ? '#DC2626' : '#999'}
                        fill={isFavorito ? '#DC2626' : 'none'}
                    />
                </button>

                {/* Tags */}
                <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '10px',
                    display: 'flex',
                    gap: '6px'
                }}>
          <span style={{
              backgroundColor: 'rgba(220,38,38,0.9)',
              color: '#fff',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '600'
          }}>
            {modalidade}
          </span>
                    <span style={{
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        color: '#fff',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '500'
                    }}>
            {condicao}
          </span>
                </div>
            </div>

            {/* Informações */}
            <div style={{ padding: '14px 16px' }}>
                {/* Título */}
                <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1a1a1a',
                    marginBottom: '4px',
                    lineHeight: '1.3'
                }}>
                    {titulo}
                </h3>

                {/* Marca e Ano */}
                <p style={{
                    fontSize: '13px',
                    color: '#888',
                    marginBottom: '8px'
                }}>
                    {marca} • {ano}
                </p>

                {/* Rating */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginBottom: '10px'
                }}>
                    <Star size={14} color="#FFB800" fill="#FFB800" />
                    <span style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#1a1a1a'
                    }}>
            {rating.toFixed(1)}
          </span>
                    <span style={{
                        fontSize: '12px',
                        color: '#999'
                    }}>
            ({avaliacoes})
          </span>
                </div>

                {/* Preço e Localização */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end'
                }}>
                    <div>
                        <p style={{
                            fontSize: '20px',
                            fontWeight: 'bold',
                            color: '#DC2626'
                        }}>
                            {formatarPreco(preco)}
                        </p>
                        <p style={{
                            fontSize: '12px',
                            color: '#999',
                            textDecoration: 'line-through'
                        }}>
                            {formatarPreco(preco * 1.15)}
                        </p>
                    </div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontSize: '12px',
                        color: '#888'
                    }}>
                        <MapPin size={13} />
                        <span>{localizacao}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}