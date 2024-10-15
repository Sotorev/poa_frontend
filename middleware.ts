import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define public paths that don't require authentication
const publicPaths = ['/iniciar-sesion']

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl

	// Check if the path is public
	if (publicPaths.some(path => pathname.startsWith(path))) {
		return NextResponse.next()
	}

	// For all other paths, check the session
	const session = request.cookies.get('auth-session');

	if (!session) {
		// Store the original URL to redirect back after login
		const encodedFrom = encodeURIComponent(pathname)
		return NextResponse.redirect(new URL(`/iniciar-sesion?from=${encodedFrom}`, request.url))
	}

	return NextResponse.next()
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		'/((?!api|_next/static|_next/image|favicon.ico).*)',
	],
}