import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
	const session = request.cookies.get('auth-token')

	// Protect pages that require authentication
	const protectedPaths = ['/*']
	if (protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
		if (!session) {
			return NextResponse.redirect(new URL('/iniciar-sesion', request.url))
		}
	}

	return NextResponse.next()
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}