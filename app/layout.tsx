import { Analytics } from '@vercel/analytics/next'
import { ClerkProvider } from '@clerk/nextjs'
import { ptBR } from '@clerk/localizations'
import type { Metadata } from 'next'
import Image from 'next/image'
import {
    Geist,
    Cinzel,
    UnifrakturCook,
    Caesar_Dressing,
} from 'next/font/google'
import { UserSyncProvider } from '@/lib/UserSyncContext'
import './globals.css'

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
})

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
    title: 'Imperium  ',

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
      <ClerkProvider localization={ptBR}>
          <html
            lang="pt-BR"
            suppressHydrationWarning
          >
          <body


            className={`
                        ${geistSans.variable}
                        ${cinzel.variable}
                        ${blackletter.variable}
                        ${caesar.variable}
                        antialiased
                    `}
          >

          <Image
            src="/logo1.png"
            alt="Imperium Bikes"
            width={180}
            height={60}
          />

          <UserSyncProvider>
              {children}
          </UserSyncProvider>

          <Analytics />
          </body>
          </html>
      </ClerkProvider>
    )
}