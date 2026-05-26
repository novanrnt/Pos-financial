import { NextResponse, type NextRequest } from 'next/server';
export function middleware(req: NextRequest) {
  const session = req.cookies.get('pos_session')?.value;
  const path = req.nextUrl.pathname;
  const isAuth = path.startsWith('/login') || path.startsWith('/setup-admin') || path.startsWith('/api/login') || path.startsWith('/api/logout') || path.startsWith('/api/telegram');
  if (!session && !isAuth && path !== '/') return NextResponse.redirect(new URL('/login', req.url));
  if (session && (path === '/' || path === '/login')) return NextResponse.redirect(new URL('/dashboard', req.url));
  return NextResponse.next();
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'] };
