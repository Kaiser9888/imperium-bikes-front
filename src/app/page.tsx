import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { SearchBar } from '@/components/layout/SearchBar'
import { CategoryChips } from '@/components/home/CategoryChips'
import { BannerCarousel } from '@/components/home/BannerCarousel'
import { ModalidadesSection } from '@/components/home/ModalidadesSection'
import { BikeFeed } from '@/components/home/BikeFeed'

export default function Home() {
    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f5f5f5',
            paddingBottom: '70px'
        }}>
            <Header />
            <div className="container">  {/* ← Adicionar */}
                <SearchBar />
                <CategoryChips />
                <BannerCarousel />
                <ModalidadesSection />
                <BikeFeed />
            </div>
            <BottomNav />
        </div>
    )
}