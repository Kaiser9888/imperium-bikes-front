import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Apenas log, sem redirecionamento
    console.log('Middleware:', request.nextUrl.pathname)
    return NextResponse.next()
}

export const config = {
    matcher: ['/login', '/perfil', '/cadastro']
}