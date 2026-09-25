// app/layout.tsx
import { Analytics } from '@vercel/analytics/next'
import { ClerkProvider } from '@clerk/nextjs'
import { ptBR } from '@clerk/localizations'
import type { Metadata } from 'next'
import { Geist, Cinzel, UnifrakturCook, Caesar_Dressing } from 'next/font/google'
import { UserSyncProvider } from '@/lib/UserSyncContext'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const cinzel = Cinzel({
    variable: '--font-cinzel',
    subsets: ['latin'],
    weight: ['400', '500', '600', '700', '800', '900'],
})
const blackletter = UnifrakturCook({
    variable: '--font-blackletter',
    subsets: ['latin'],
    weight: ['700'],
})
const caesar = Caesar_Dressing({
    variable: '--font-caesar',
    subsets: ['latin'],
    weight: '400',
})

export const metadata: Metadata = {
    title: 'Imperium Bikes — O Império das Bicicletas',
    description: 'Marketplace de bicicletas Imperium Bikes. Mountain, Speed, BMX, Downhill e Urbana.',
    icons: {
        icon: [
            { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
            { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
            { url: '/icon.svg', type: 'image/svg+xml' },
        ],
        apple: '/apple-icon.png',
    },
}
