'use client'

import { useSession } from "next-auth/react"

type Action = 'Create' | 'Edit' | 'View' | 'Delete'

export function usePermissions() {
	const { data: session } = useSession()

	const checkPermission = (moduleName: string, action: Action): boolean => {
		if (!session?.user.permissions) return false
		return session.user.permissions.some(
			(permission) => permission.moduleName === moduleName && permission.action === action
		)
	}

	return {
		canCreate: (moduleName: string) => checkPermission(moduleName, 'Create'),
		canEdit: (moduleName: string) => checkPermission(moduleName, 'Edit'),
		canView: (moduleName: string) => checkPermission(moduleName, 'View'),
		canDelete: (moduleName: string) => checkPermission(moduleName, 'Delete'),
		isAdmin: () => session?.user.role?.roleName === 'Administrador',
	}
}