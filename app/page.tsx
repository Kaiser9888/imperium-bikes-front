// app/page.tsx
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { SearchBar } from '@/components/layout/SearchBar'
import { BannerCarousel } from '@/components/home/BannerCarousel'
import { CategoryChips } from '@/components/home/CategoryChips'
import { ModalidadesSection } from '@/components/home/ModalidadesSection'

// Mude esta linha de:
// import { BikeFeed } from '@/components/home/BikeFeed'
// Para:
import BikeFeed from '@/components/home/BikeFeed'  // SEM chaves

export default function Home() {
    return (
        <main className="min-h-screen bg-gray-50">
            <Header />
            <SearchBar />
            <BannerCarousel />
            <CategoryChips />
            <ModalidadesSection />
            <BikeFeed />
            <BottomNav />
        </main>
    );
}