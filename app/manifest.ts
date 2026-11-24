import type { MetadataRoute } from 'next'

/**
 * Manifesto do app (PWA): com ele e HTTPS o celular oferece "Instalar app" /
 * "Adicionar à tela inicial", e o site abre em tela cheia com o ícone da orca.
 * Sem service worker de propósito: cache offline esconderia as atualizações.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Imperium Bikes',
    short_name: 'Imperium',
    description: 'Bikes, peças, eventos e vídeos de ciclismo em um só lugar.',
    lang: 'pt-BR',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    // Creme do logo: é a cor da tela de abertura enquanto o app carrega
    background_color: '#f7f4ef',
    theme_color: '#0e131b',
    categories: ['shopping', 'sports', 'social'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Buscar', url: '/buscar', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
      { name: 'Vídeos', url: '/videos', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
      { name: 'Memento', url: '/videos/memento', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
      { name: 'Vender', url: '/vendedor', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
    ],
  }
}
