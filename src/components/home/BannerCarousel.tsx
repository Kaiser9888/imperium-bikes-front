// src/components/home/BannerCarousel.tsx
'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const banners = [
    {
        id: 1,
        title: 'Mountain Bike Pro',
        subtitle: 'Performance e resistência para qualquer trilha',
        tag: '30% OFF',
        bg: 'bg-gradient-to-r from-slate-800 to-slate-700',
        textColor: 'text-white',
    },
    {
        id: 2,
        title: 'Speed Elite 2026',
        subtitle: 'Tecnologia de ponta para velocidade máxima',
        tag: 'LANÇAMENTO',
        bg: 'bg-gradient-to-r from-gray-900 to-gray-800',
        textColor: 'text-white',
    },
    {
        id: 3,
        title: 'Urban Collection',
        subtitle: 'Estilo e conforto para o dia a dia',
        tag: 'FRETE GRÁTIS',
        bg: 'bg-gradient-to-r from-stone-700 to-stone-600',
        textColor: 'text-white',
    },
];

export function BannerCarousel() {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const prev = () => setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
    const next = () => setCurrent((prev) => (prev + 1) % banners.length);

    return (
        <div className="relative overflow-hidden rounded-3xl">
            <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${current * 100}%)` }}
            >
                {banners.map((banner) => (
                    <div
                        key={banner.id}
                        className={`w-full flex-shrink-0 ${banner.bg} p-8 md:p-12 rounded-3xl`}
                    >
                        <div className={`${banner.textColor}`}>
              <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold mb-4 backdrop-blur-sm">
                {banner.tag}
              </span>
                            <h3 className="text-2xl md:text-3xl font-bold mb-2">
                                {banner.title}
                            </h3>
                            <p className="text-sm md:text-base opacity-80 mb-6 max-w-md">
                                {banner.subtitle}
                            </p>
                            <button className="px-6 py-2.5 bg-white text-gray-900 rounded-full font-medium text-sm hover:bg-gray-100 transition-colors">
                                Conferir
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Controles */}
            <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors backdrop-blur-sm"
            >
                <ChevronLeft className="w-4 h-4" />
            </button>
            <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors backdrop-blur-sm"
            >
                <ChevronRight className="w-4 h-4" />
            </button>

            {/* Indicadores */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {banners.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrent(index)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                            index === current ? 'bg-white w-8' : 'bg-white/40 w-1.5'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}