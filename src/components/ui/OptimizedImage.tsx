'use client'

import { useLazyLoad } from '@/hooks/useLazyLoad'
import { useState } from 'react'

interface OptimizedImageProps {
    src: string
    alt: string
    style?: React.CSSProperties
    className?: string
    fallback?: string
}

export function OptimizedImage({ src, alt, style, className, fallback }: OptimizedImageProps) {
    const { ref, isVisible } = useLazyLoad()
    const [erro, setErro] = useState(false)
    const [carregada, setCarregada] = useState(false)

    const imagemFinal = erro && fallback ? fallback : src

    return (
        <div ref={ref} style={{ ...style, backgroundColor: '#e5e5e5', overflow: 'hidden' }} className={className}>
            {isVisible && (
                <img
                    src={imagemFinal}
                    alt={alt}
                    onLoad={() => setCarregada(true)}
                    onError={() => setErro(true)}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: carregada ? 1 : 0,
                        transition: 'opacity 0.3s'
                    }}
                    loading="lazy"
                />
            )}
        </div>
    )
}