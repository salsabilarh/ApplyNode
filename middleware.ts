import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/auth';

const publicRoutes = ['/login', '/register', '/api/auth/login', '/api/auth/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Izinkan akses ke public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Ambil token dari cookie
  const token = request.cookies.get('token')?.value;

  // Jika tidak ada token atau token tidak valid, redirect ke login (untuk halaman web)
  if (!token) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }

  const payload = await verifyJWT(token);
  if (!payload) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};