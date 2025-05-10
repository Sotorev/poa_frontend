import NextAuth from "next-auth";
import {
	DEFAULT_LOGIN_REDIRECT,
	apiAuthPrefix,
	authRoutes,
	publicRoutes
} from "./routes";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";

export default auth((req) => {
	const { nextUrl } = req;
	const isLoggedIn = !!req.auth;

	const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
	const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
	const isAuthRoute = authRoutes.includes(nextUrl.pathname);

	if (isApiAuthRoute) {
		return NextResponse.next();
	}

	if (isAuthRoute) {
		if (isLoggedIn) {
			return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
		}
		return NextResponse.next();
	}

	if (nextUrl.pathname === '/') {
		return NextResponse.redirect(new URL('/inicio', nextUrl));
	}

	if (!isLoggedIn && !isPublicRoute) {
		return NextResponse.redirect(new URL("/iniciar-sesion ", nextUrl));
	}

	return NextResponse.next();
})

export const config = {
	matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}