"use client"

import { useState } from "react"
import { Header } from "@/components/layout/Header"
import { MenuDrawer } from "@/components/layout/menu-drawer"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Footer } from "@/components/layout/footer"
import { Banner } from "@/components/home/banner"
import { ModalidadesSection } from "@/components/home/modalidades-section"
import { EventosSection } from "@/components/home/eventos-section"
import { VideosSection } from "@/components/home/videos-section"
import { ProdutosDestaque } from "@/components/home/produtos-destaque"

export default function Page() {
    const [menuOpen, setMenuOpen] = useState(false)

    return (
        <div className="min-h-screen bg-background">
            <Header onMenuClick={() => setMenuOpen(true)} notificationCount={0} />

            <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

            {/* Atletas e Notícias entram aqui quando houver fonte real de dados */}
            <main className="mx-auto flex w-full max-w-7xl flex-col gap-14 px-4 pb-16 pt-5 sm:px-6 lg:gap-20 lg:px-8 lg:pt-8">
                <Banner />
                <ModalidadesSection />
                <EventosSection />
                <VideosSection />
                <ProdutosDestaque />
            </main>

            <Footer />

            <BottomNav onMenuClick={() => setMenuOpen(true)} />
        </div>
    )
}
