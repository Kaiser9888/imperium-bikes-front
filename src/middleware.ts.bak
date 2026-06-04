import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const rotasProtegidas = ['/perfil', '/meus-anuncios', '/criar-anuncio', '/favoritos', '/chat', '/admin']
const rotasAuth = ['/login', '/cadastro', '/recuperar-senha']


export function middleware(request: NextRequest) {
    const token = request.cookies.get('@imperium:token')?.value
    const { pathname } = request.nextUrl

    const isProtegida = rotasProtegidas.some(rota => pathname === rota || pathname.startsWith(rota + '/'))
    const isAuth = rotasAuth.some(rota => pathname === rota)

    if (isProtegida && !token) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
    }

    if (isAuth && token) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/perfil/:path*', '/meus-anuncios/:path*', '/criar-anuncio/:path*', '/favoritos/:path*', '/chat/:path*', '/admin/:path*', '/login', '/cadastro', '/recuperar-senha'],
}