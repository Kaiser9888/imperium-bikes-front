'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const banners = [
    { id: 1, title: 'Mountain Pro', subtitle: 'Domine as montanhas', bg: 'from-[#8B0000] to-[#1A0000]' },
    { id: 2, title: 'Speed Elite', subtitle: 'Velocidade sem limites', bg: 'from-[#2F0000] to-[#0D0000]' },
    { id: 3, title: 'Urban Steel', subtitle: 'Forjado para a cidade', bg: 'from-[#5B0000] to-[#1A0000]' },
];

export function BannerCarousel() {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setCurrent((p) => (p + 1) % banners.length), 4000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative overflow-hidden rounded border border-[#8B0000]/30">
            <div className="flex transition-transform duration-700" style={{ transform: `translateX(-${current * 100}%)` }}>
                {banners.map((b) => (
                    <div key={b.id} className={`w-full flex-shrink-0 bg-gradient-to-r ${b.bg} p-8`}>
                        <h3 className="text-2xl font-bold text-[#D4C5A9]">{b.title}</h3>
                        <p className="text-[#8B0000] mt-1">{b.subtitle}</p>
                        <button className="mt-4 px-5 py-2 bg-[#8B0000] text-[#D4C5A9] text-sm rounded hover:bg-[#DC143C] transition-colors">
                            Ver Ofertas
                        </button>
                    </div>
                ))}
            </div>
            <button onClick={() => setCurrent((p) => (p - 1 + banners.length) % banners.length)} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-[#D4C5A9] rounded-full">
                <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setCurrent((p) => (p + 1) % banners.length)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-[#D4C5A9] rounded-full">
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );
}