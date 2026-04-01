import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  const isAuthPage = pathname === '/login' || pathname === '/register'

  // Unauthenticated users: redirect to login (except auth pages)
  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  // Authenticated users: redirect away from auth pages
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }

  // Redirect root to dashboard
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|brand/).*)'],
}
