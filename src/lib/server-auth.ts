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
	const cookieStore = cookies()
	const token = cookieStore.get('auth-token')

	if (!token) {
		console.log('No auth-token cookie found')
		return null
	}

	try {
		const { payload } = await jwtVerify(
			token.value,
			new TextEncoder().encode(JWT_SECRET),
			{
				algorithms: ['HS256'], // Specify the algorithm you're using
			}
		)

		// Check if the token has expired
		if (payload.exp && Date.now() >= payload.exp * 1000) {
			console.log('Token has expired')
			return null
		}

		return payload as UserPayload
	} catch (error) {
		console.error('Error verifying JWT:', error)
		return null
	}
}