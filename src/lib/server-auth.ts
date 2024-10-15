"use server";
import { jwtVerify, JWTPayload } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET!

export interface UserPayload extends JWTPayload {
	userId: number
	username: string
	email: string
	role: {
		roleId: number
		roleName: string
	}
	faculty: {
		name: string
	}
	permissions: {
		permissionId: number
		moduleName: string
		action: string
		description: string
	}[]
}

export async function getServerSession(): Promise<UserPayload | null> {
	console.log('getServerSession called')
	const cookieStore = cookies()
	console.log('Cookie store:', cookieStore);
	
	const token = cookieStore.get('auth-token')

	console.log('Auth token:', token ? 'Found' : 'Not found')
	console.log('Auth token value:', token?.value)
	if (!token) {
		console.log('No auth-token cookie, returning null')
		return null
	}

	try {
		console.log('Attempting to verify JWT')
		const verified = await jwtVerify(token.value, new TextEncoder().encode(JWT_SECRET))
		console.log('JWT verified successfully')
		return verified.payload as unknown as UserPayload
	} catch (error) {
		console.error('Error verifying JWT:', error)
		return null
	}
}

export async function Login(username: string, password: string): Promise<UserPayload> {
	const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ username, password }),
		credentials: 'include',
	})

	if (!response.ok) {
		throw new Error('Login failed')
	}

	const data = await getServerSession()
	if (!data) {
		throw new Error('Failed to get user session')
	}
	return data
}