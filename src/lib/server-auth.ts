import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET!

export interface UserPayload {
	userId: number
	username: string
	email: string
	role: {
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
	"use server";
	const cookieStore = cookies()
	const token = cookieStore.get('auth-token')

	if (!token) {
		return null
	}

	try {
		const verified = await jwtVerify(token.value, new TextEncoder().encode(JWT_SECRET))
		return verified.payload as unknown as UserPayload
	} catch{
		return null
	}
}