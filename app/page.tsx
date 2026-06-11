'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { SearchBar } from '@/components/layout/SearchBar';
import { BannerCarousel } from '@/components/home/BannerCarousel';
import { ModalidadesSection } from '@/components/home/ModalidadesSection';
import BikeFeed from '@/components/home/BikeFeed';
import { Play, MessageSquare, Heart } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <main className="min-h-screen bg-[#0D0D0D] pb-20">
            <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

            {menuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40"
                    onClick={() => setMenuOpen(false)}
                />
            )}

            <div className="max-w-7xl mx-auto px-4">
                <div className="mt-6 mb-8">
                    <SearchBar />
                </div>

                <section className="mb-10">
                    <BannerCarousel />
                </section>

                {/* Vídeos, Fórum, Favoritos */}
                <section className="mb-10">
                    <div className="grid grid-cols-3 gap-3">
                        <Link href="/videos" className="bg-[#2F2F2F] border border-[#8B0000]/30 rounded p-4 flex flex-col items-center hover:border-[#8B0000] transition-colors">
                            <Play className="w-5 h-5 text-[#DC143C] mb-2" />
                            <span className="text-xs text-[#D4C5A9]">Vídeos</span>
                        </Link>
                        <Link href="/forum" className="bg-[#2F2F2F] border border-[#8B0000]/30 rounded p-4 flex flex-col items-center hover:border-[#8B0000] transition-colors">
                            <MessageSquare className="w-5 h-5 text-[#DC143C] mb-2" />
                            <span className="text-xs text-[#D4C5A9]">Fórum</span>
                        </Link>
                        <Link href="/favoritos" className="bg-[#2F2F2F] border border-[#8B0000]/30 rounded p-4 flex flex-col items-center hover:border-[#8B0000] transition-colors">
                            <Heart className="w-5 h-5 text-[#DC143C] mb-2" />
                            <span className="text-xs text-[#D4C5A9]">Favoritos</span>
                        </Link>
                    </div>
                </section>

                <section className="mb-10">
                    <h2 className="text-lg font-bold text-[#D4C5A9] mb-4 border-l-4 border-[#8B0000] pl-3">MODALIDADES</h2>
                    <ModalidadesSection />
                </section>

                <section>
                    <h2 className="text-lg font-bold text-[#D4C5A9] mb-4 border-l-4 border-[#8B0000] pl-3">DESTAQUES</h2>
                    <BikeFeed />
                </section>
            </div>

            <BottomNav />
        </main>
    );
}