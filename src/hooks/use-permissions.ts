'use client'

import { useSession } from "next-auth/react"

type Action = 'Create' | 'Edit' | 'View' | 'Delete'

type Role = 'Vicerrector' | 'Decano' | 'Coordinador Pedagógico' | 'Usuario General' | 'Administrador' | 'Proponente'

export function usePermissions() {
	const { data: session } = useSession()

	const checkPermission = (moduleName: string, action: Action): boolean => {
		if (!session?.user.permissions) return false
		return session.user.permissions.some(
			(permission) => permission.moduleName === moduleName && permission.action === action
		)
	}

	const checkRole = (allowedRoles: Role[]): boolean => {
		if (!session?.user.role) return false
		return allowedRoles.includes(session.user.role.roleName as Role)
	}

	return {
		canCreate: (moduleName: string) => checkPermission(moduleName, 'Create'),
		canEdit: (moduleName: string) => checkPermission(moduleName, 'Edit'),
		canView: (moduleName: string) => checkPermission(moduleName, 'View'),
		canDelete: (moduleName: string) => checkPermission(moduleName, 'Delete'),
		isAdmin: () => session?.user.role?.roleName === 'Administrador',
		canManagePOA: () => checkRole(['Vicerrector', 'Decano']),
		hasRole: (roles: Role | Role[]) => {
			const rolesToCheck = Array.isArray(roles) ? roles : [roles]
			return checkRole(rolesToCheck)
		}
	}
}