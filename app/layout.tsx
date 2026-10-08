import { Analytics } from '@vercel/analytics/next'
import { ClerkProvider } from '@clerk/nextjs'
import { ptBR } from '@clerk/localizations'
import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { UserSyncProvider } from '@/lib/UserSyncContext'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Imperium Sports',
  description: 'Eventos, atletas, vídeos e marketplace esportivo em um só lugar.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider localization={ptBR}>
      {/* A variável da fonte fica no <html> para os tokens do :root conseguirem lê-la */}
      <html lang="pt-BR" className={geistSans.variable} suppressHydrationWarning>
        <body className="antialiased">
          <UserSyncProvider>{children}</UserSyncProvider>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}
