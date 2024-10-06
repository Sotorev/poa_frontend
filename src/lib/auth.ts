import { UserPayload } from './server-auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export async function login(username: string, password: string): Promise<UserPayload> {
	const response = await fetch(`${API_URL}/api/auth/login`, {
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

	const data = await response.json()
	return data
}

export async function logout(): Promise<void> {
	await fetch(`${API_URL}/api/auth/logout`, {
		method: 'POST',
		credentials: 'include',
	})
	
}

export async function getSession(): Promise<UserPayload | null> {
	const response = await fetch(`${API_URL}/api/auth/session`, {
		credentials: 'include',
	})

	if (!response.ok) {
		return null
	}

	return response.json()
}

export async function hasPermission(user: UserPayload | null, moduleName: string, action: string): Promise<boolean> {
	if (!user || !user.permissions) {
		console.error('User or user permissions are undefined in hasPermission', user)
		return false
	}

	const hasPermission = user.permissions.some(
		(permission) => permission.moduleName === moduleName && permission.action === action
	)
	console.log(`Checking permission: ${moduleName}:${action}. Result:`, hasPermission)
	return hasPermission
}

export async function hasRole(user: UserPayload | null, role: string): Promise<boolean> {
	if (!user || !user.role) {
		console.error('User or user role is undefined in hasRole', user)
		return false
	}
	const hasRole = user.role.roleName === role
	console.log(`Checking role: ${role}. Result:`, hasRole)
	return hasRole
}