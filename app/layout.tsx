import { Analytics } from '@vercel/analytics/next'
import { ClerkProvider } from '@clerk/nextjs'
import { ptBR } from '@clerk/localizations'
import type { Metadata } from 'next'
import { Geist, Cinzel, UnifrakturCook } from 'next/font/google'
import AutoSync from '@/components/auth/AutoSync'
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

export const metadata: Metadata = {
    title: 'Imperium Bikes — O Império das Bicicletas',
    description:
        'Marketplace de bicicletas Imperium Bikes. Mountain, Speed, BMX, Downhill e Urbana. Encontre, compare e conquiste.',
    generator: 'v0.app',
    icons: {
        icon: [
            {
                url: '/icon-light-32x32.png',
                media: '(prefers-color-scheme: light)',
            },
            {
                url: '/icon-dark-32x32.png',
                media: '(prefers-color-scheme: dark)',
            },
            {
                url: '/icon.svg',
                type: 'image/svg+xml',
            },
        ],
        apple: '/apple-icon.png',
    },
}

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <ClerkProvider
            localization={ptBR}
            appearance={{
                variables: {
                    colorPrimary: '#9e2b25',
                    colorText: '#3a2f2a',
                    borderRadius: '0.5rem',
                },
            }}
        >
            <html
                lang="pt-BR"
                className={`${geistSans.variable} ${cinzel.variable} ${blackletter.variable} bg-background`}
            >
            <body className="font-sans antialiased">
            <AutoSync />
            {children}
            {process.env.NODE_ENV === 'production' && <Analytics />}
            </body>
            </html>
        </ClerkProvider>
    )
}