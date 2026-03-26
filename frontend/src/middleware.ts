import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
    // Note: Cross-domain cookies (Vercel -> Render) are not visible to middleware.
    // We rely on client-side AuthContext in (dashboard)/layout.tsx for protection.
    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/expenses/:path*', '/budgets/:path*', '/reports/:path*', '/suggestions/:path*', '/login', '/register'],
};
