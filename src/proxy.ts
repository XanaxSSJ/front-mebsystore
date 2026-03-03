import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
    const token = request.cookies.get('jwt')

    const protectedPaths = [
        '/perfil',
        '/ordenes',
        '/checkout',
    ]

    const isProtected = protectedPaths.some(path =>
        request.nextUrl.pathname.startsWith(path)
    )

    if (isProtected && !token) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('from', request.nextUrl.pathname)
        return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/perfil/:path*', '/ordenes/:path*', '/checkout/:path*'],
}