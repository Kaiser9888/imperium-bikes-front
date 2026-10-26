// Cabeçalhos de segurança enviados em todas as páginas.
const securityHeaders = [
  // Impede que o site seja aberto dentro de um <iframe> de outro domínio (clickjacking).
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // O navegador respeita o Content-Type informado, sem "adivinhar" (ex.: tratar upload como script).
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Para outros sites vai só a origem, nunca o caminho completo da página.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Recursos do aparelho: câmera e microfone só para o próprio site; localização desligada.
  { key: 'Permissions-Policy', value: 'camera=(self), microphone=(self), geolocation=(), browsing-topics=()' },
  // Só HTTPS, por 2 anos.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Política de conteúdo propositalmente enxuta: bloqueia iframes de terceiros sobre o site,
  // plugins (<object>/<embed>) e troca do <base>, sem restringir os scripts de Clerk, Stripe e Mux.
  {
    key: 'Content-Security-Policy',
    value: "frame-ancestors 'self'; object-src 'none'; base-uri 'self'; upgrade-insecure-requests",
  },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Não anuncia a tecnologia do servidor no cabeçalho X-Powered-By.
  poweredByHeader: false,

  experimental: {
    agentUpgrade: 'security',
  },

  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

module.exports = nextConfig
