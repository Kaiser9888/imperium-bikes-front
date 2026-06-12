"use client"

import { useState } from "react"
import { Header } from "@/components/layout/Header"
import { MenuDrawer } from "@/components/layout/menu-drawer"
import { BottomNav } from "@/components/layout/bottom-nav"
import { BannerCarousel } from "@/components/home/banner-carousel"
import { QuickActions } from "@/components/home/quick-actions"
import { ModalidadesSection } from "@/components/home/modalidades-section"
import { ProdutosDestaque } from "@/components/home/produtos-destaque"

export default function Page() {
    const [menuOpen, setMenuOpen] = useState(false)

    return (
        <div className="min-h-screen bg-background">
            <Header
                onMenuClick={() => setMenuOpen(true)}
                cartCount={2}
                notificationCount={3}
            />

            <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

            <main className="mx-auto w-full max-w-7xl pb-24 px-4 md:px-6 lg:px-8">
                <div className="flex flex-col gap-6 py-5">
                    <BannerCarousel />
                    <QuickActions />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <ProdutosDestaque />
                        </div>
                        <div className="lg:col-span-1">
                            <ModalidadesSection />
                        </div>
                    </div>
                </div>
            </main>

            <BottomNav onMenuClick={() => setMenuOpen(true)} />
        </div>
    )
}