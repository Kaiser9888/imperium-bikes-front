// app/page.tsx
'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { SearchBar } from '@/components/layout/SearchBar';
import { BannerCarousel } from '@/components/home/BannerCarousel';
import { ModalidadesSection } from '@/components/home/ModalidadesSection';
import BikeFeed from '@/components/home/BikeFeed';

export default function Home() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <main className="min-h-screen bg-[#1E1F22] pb-20">
            <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

            {menuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMenuOpen(false)}
                />
            )}

            <div className="max-w-7xl mx-auto px-4">
                <div className="mt-4 mb-6">
                    <SearchBar />
                </div>

                <section className="mb-8">
                    <BannerCarousel />
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold text-[#EFEDE6] mb-4">Modalidades</h2>
                    <ModalidadesSection />
                </section>

                <section>
                    <h2 className="text-xl font-bold text-[#EFEDE6] mb-4">Produtos em Destaque</h2>
                    <BikeFeed />
                </section>
            </div>

            <BottomNav />
        </main>
    );
}