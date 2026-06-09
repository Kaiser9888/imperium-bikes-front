import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { ClerkProvider } from '@clerk/nextjs'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    themeColor: '#DC2626',
}

export const metadata: Metadata = {
    metadataBase: new URL('https://imperiumbikes0.com.br'),
    title: {
        default: 'Imperium Bikes - Marketplace de Bicicletas',
        template: '%s | Imperium Bikes',
    },
    description:
        'Compre e venda bikes, peças e acessórios. Participe de torneios, assista vídeos e conecte-se com a comunidade de ciclismo.',
    keywords: [
        'bikes',
        'bicicletas',
        'MTB',
        'speed',
        'downhill',
        'peças',
        'acessórios',
        'torneios',
        'ciclismo',
    ],
    authors: [{ name: 'Imperium Bikes' }],
    creator: 'Imperium Bikes',
    publisher: 'Imperium Bikes',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    openGraph: {
        type: 'website',
        locale: 'pt_BR',
        url: 'https://imperiumbikes0.com.br',
        siteName: 'Imperium Bikes',
        title: 'Imperium Bikes - Marketplace de Bicicletas',
        description:
            'Compre e venda bikes, peças e acessórios. Participe de torneios e conecte-se com a comunidade.',
        images: [
            {
                url: '/logo.png',
                width: 200,
                height: 60,
                alt: 'Imperium Bikes',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Imperium Bikes',
        description: 'Marketplace de Bicicletas',
        images: ['/logo.png'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <ClerkProvider>
            <html lang="pt-BR" suppressHydrationWarning>
            <body className={inter.className}>
            <Providers>{children}</Providers>
            </body>
            </html>
        </ClerkProvider>
    )
}