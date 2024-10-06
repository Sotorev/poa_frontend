import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getServerSession } from './lib/server-auth'

export async function middleware(request: NextRequest) {
	const session = await getServerSession()	

	// Protect pages that require authentication
	const protectedPaths = ['/*']
	if (protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
		if (!session) {
			return NextResponse.redirect(new URL('/login', request.url))
		}
	}

	return NextResponse.next()
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}