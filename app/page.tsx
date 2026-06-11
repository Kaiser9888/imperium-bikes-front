// app/page.tsx
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
        <main className="min-h-screen bg-[#FAF8F5] pb-20">
            <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

            {menuOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 lg:hidden"
                    onClick={() => setMenuOpen(false)}
                />
            )}

            <div className="max-w-7xl mx-auto px-4">
                {/* Barra de Pesquisa */}
                <div className="mt-6 mb-8">
                    <SearchBar />
                </div>

                {/* Banner Carrossel */}
                <section className="mb-10">
                    <BannerCarousel />
                </section>

                {/* Vídeos, Fórum, Favoritos - VISÍVEIS E ELEGANTES */}
                <section className="mb-10">
                    <div className="grid grid-cols-3 gap-4">
                        <Link
                            href="/videos"
                            className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <Play className="w-5 h-5 text-red-500" />
                                </div>
                                <span className="text-sm font-semibold text-[#1A1A1A]">Vídeos</span>
                                <span className="text-xs text-gray-400 mt-1">Assistir</span>
                            </div>
                        </Link>

                        <Link
                            href="/forum"
                            className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <MessageSquare className="w-5 h-5 text-blue-500" />
                                </div>
                                <span className="text-sm font-semibold text-[#1A1A1A]">Fórum</span>
                                <span className="text-xs text-gray-400 mt-1">Comunidade</span>
                            </div>
                        </Link>

                        <Link
                            href="/favoritos"
                            className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <Heart className="w-5 h-5 text-rose-500" />
                                </div>
                                <span className="text-sm font-semibold text-[#1A1A1A]">Favoritos</span>
                                <span className="text-xs text-gray-400 mt-1">Salvos</span>
                            </div>
                        </Link>
                    </div>
                </section>

                {/* Modalidades */}
                <section className="mb-10">
                    <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">Modalidades</h2>
                    <ModalidadesSection />
                </section>

                {/* Produtos em Destaque */}
                <section>
                    <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">Destaques</h2>
                    <BikeFeed />
                </section>
            </div>

            <BottomNav />
        </main>
    );
}