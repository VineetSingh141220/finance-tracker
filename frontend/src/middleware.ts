import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // protect dashboard routes — check for refresh token cookie
    // (actual auth is done client-side, this is just a guard)
    const protectedPaths = ['/dashboard', '/expenses', '/budgets', '/reports', '/suggestions'];
    const isProtected = protectedPaths.some(p => pathname.startsWith(p));

    if (isProtected) {
        // We can't check JWT from middleware easily, so we rely on
        // client-side AuthContext. This just ensures the cookie exists.
        const hasRefresh = req.cookies.get('refreshToken');
        if (!hasRefresh) {
            return NextResponse.redirect(new URL('/login', req.url));
        }
    }

    // redirect logged-in users away from auth pages
    if (pathname === '/login' || pathname === '/register') {
        const hasRefresh = req.cookies.get('refreshToken');
        if (hasRefresh) {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/expenses/:path*', '/budgets/:path*', '/reports/:path*', '/suggestions/:path*', '/login', '/register'],
};
