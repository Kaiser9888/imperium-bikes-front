import { ClerkProvider } from '@clerk/nextjs'
import { ptBR } from '@clerk/localizations'
import type { Metadata, Viewport } from 'next'
import { Caesar_Dressing, Geist } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { AppShellProvider } from '@/components/layout/app-shell'
import { AvisoCookies } from '@/components/layout/aviso-cookies'
import { Toaster } from '@/components/ui/sonner'
import { RastreioNavegacao } from '@/components/ui/back-button'
import { UserSyncProvider } from '@/lib/UserSyncContext'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

// Fonte do nome da marca (classe .brand-name no globals.css)
const caesarDressing = Caesar_Dressing({
  variable: '--font-caesar-dressing',
  weight: '400',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Imperium Bikes',
  description: 'Bikes, peças, eventos e vídeos de ciclismo em um só lugar.',
  applicationName: 'Imperium Bikes',
  icons: {
    icon: [{ url: '/favicon.ico' }, { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
  // iPhone: "Adicionar à Tela de Início" abre em tela cheia, com o nome curto
  appleWebApp: {
    capable: true,
    title: 'Imperium',
    // "default": o conteúdo começa abaixo do relógio/entalhe (translúcido jogaria os
    // cabeçalhos para baixo da barra de status)
    statusBarStyle: 'default',
  },
  formatDetection: { telephone: false },
}

// Cor da barra do sistema no app instalado, acompanhando o tema
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fcfcfd' },
    { media: '(prefers-color-scheme: dark)', color: '#0e131b' },
  ],
  viewportFit: 'cover',
  // Sem zoom de pinça na página (jeito de app); fotos ampliam na galeria em tela cheia
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider localization={ptBR} signInUrl="/sign-in" signUpUrl="/sign-up">
      {/* A variável da fonte fica no <html> para os tokens do :root conseguirem lê-la */}
      <html lang="pt-BR" className={`${geistSans.variable} ${caesarDressing.variable}`} suppressHydrationWarning>
        <body className="antialiased">
          {/* Tema claro/escuro: a escolha fica em Configurações e é guardada no navegador */}
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <UserSyncProvider>
              <AppShellProvider>{children}</AppShellProvider>
            </UserSyncProvider>
            <Toaster />
            <RastreioNavegacao />
          </ThemeProvider>
          {/* Estatísticas só carregam com consentimento */}
          <AvisoCookies />
        </body>
      </html>
    </ClerkProvider>
  )
}
