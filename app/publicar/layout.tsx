import type { Metadata, Viewport } from 'next'
import './global.css'
import { GateRecebimentos } from '@/components/carteira/GateRecebimentos'
import { VoltaDepoisDePublicar } from '@/components/publicar/VoltaDepoisDePublicar'

export const metadata: Metadata = {
  title: 'Imperium ',

  icons: { icon: '/favicon.ico' },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

// Sem <html>/<body> próprios: o layout raiz já tem os dois, com o tema e os provedores.
export default function PublicarLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <VoltaDepoisDePublicar>
      <GateRecebimentos>{children}</GateRecebimentos>
    </VoltaDepoisDePublicar>
  )
}
