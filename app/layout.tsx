import { Analytics } from '@vercel/analytics/next'
import { ClerkProvider } from '@clerk/nextjs'
import { ptBR } from '@clerk/localizations'
import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { AppShellProvider } from '@/components/layout/app-shell'
import { Toaster } from '@/components/ui/sonner'
import { UserSyncProvider } from '@/lib/UserSyncContext'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Imperium Bikes',
  description: 'Bikes, peças, eventos e vídeos de ciclismo em um só lugar.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider localization={ptBR} signInUrl="/sign-in" signUpUrl="/sign-up">
      {/* A variável da fonte fica no <html> para os tokens do :root conseguirem lê-la */}
      <html lang="pt-BR" className={geistSans.variable} suppressHydrationWarning>
        <body className="antialiased">
          {/* Tema claro/escuro: a escolha fica em Configurações e é guardada no navegador */}
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <UserSyncProvider>
              <AppShellProvider>{children}</AppShellProvider>
            </UserSyncProvider>
            <Toaster />
          </ThemeProvider>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}
