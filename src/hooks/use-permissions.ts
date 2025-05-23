'use client'

import { useSession } from "next-auth/react"

import { Role } from "@/types/Permission"

type Action = 'Crear' | 'Editar' | 'Ver' | 'Eliminar'

type ModuleMapping = {
	[key: string]: string;
}

const moduleMapping: ModuleMapping = {
	'POA': 'POA',
	'PEI': 'PEI',
	'Campus': 'Campus',
	'Faculty': 'Facultades',
	'Events': 'Eventos',
	'Auth': 'Autenticación',
	'Dashboard': 'Dashboard'
}

const actionMapping: { [key: string]: Action } = {
	'Create': 'Crear',
	'Edit': 'Editar',
	'View': 'Ver',
	'Delete': 'Eliminar'
}

export function usePermissions() {
	const { data: session } = useSession()

	const checkPermission = (moduleName: string, action: 'Create' | 'Edit' | 'View' | 'Delete'): boolean => {
		if (!session?.user?.permissions) return false
		const spanishModule = moduleMapping[moduleName] || moduleName
		const spanishAction = actionMapping[action]
		return session.user.permissions.some(
			(permission) => permission.moduleName === spanishModule && permission.action === spanishAction
		)
	}

	const checkRole = (allowedRoles: Role[]): boolean => {
		if (!session?.user?.role) return false
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