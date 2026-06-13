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

  // Logika jika tidak ada token atau token invalid
  if (!token || !(await verifyJWT(token))) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Buat response redirect dan hapus cookie
    const url = new URL('/login', request.url);
    const response = NextResponse.redirect(url);
    response.cookies.delete('token'); // Hapus token yang sudah kadaluarsa
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};