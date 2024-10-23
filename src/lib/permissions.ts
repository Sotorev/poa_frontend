import { auth } from "@/auth"

type Action = 'Create' | 'Edit' | 'View' | 'Delete'

export async function checkPermission(moduleName: string, action: Action): Promise<boolean> {
	const session = await auth();
	if (!session?.user.permissions) return false
	return session.user.permissions.some(
		(permission) => permission.moduleName === moduleName && permission.action === action
	)
}

export async function isAdmin(): Promise<boolean> {
	const session = await auth();
	return session?.user.role?.roleName === 'Administrador'
}