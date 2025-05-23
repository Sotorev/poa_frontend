import { auth } from "@/auth"

type Action = 'Create' | 'Edit' | 'View' | 'Delete'
type SpanishAction = 'Crear' | 'Editar' | 'Ver' | 'Eliminar'

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
}

const actionMapping: { [key in Action]: SpanishAction } = {
	'Create': 'Crear',
	'Edit': 'Editar',
	'View': 'Ver',
	'Delete': 'Eliminar'
}

export async function checkPermission(moduleName: string, action: Action): Promise<boolean> {
	const session = await auth();
	if (!session?.user.permissions) return false

	// Si el moduleName está en inglés, obtener su equivalente en español
	const spanishModule = moduleMapping[moduleName] || moduleName
	const spanishAction = actionMapping[action]

	return session.user.permissions.some(
		(permission) => permission.moduleName === spanishModule && permission.action === spanishAction
	)
}

export async function isAdmin(): Promise<boolean> {
	const session = await auth();
	return session?.user.role?.roleName === 'Administrador'
}