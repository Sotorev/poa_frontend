'use client'

import { useState, useEffect } from 'react'
import { useCurrentUser } from '@/hooks/use-current-user'
import { usePermissions } from '@/hooks/use-permissions'
import { ProtectedRoute } from '../../_components/protected-route'
import { RoleList } from './role-list'
import { CreateRoleForm } from './create-role-form'
import { PermissionManager } from './permissions-manager'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/hooks/use-toast'

interface Permission {
	permissionId: number
	moduleName: string
	action: 'Create' | 'Edit' | 'View' | 'Delete'
	description: string
	isDeleted: boolean
}

interface Role {
	roleId: number
	roleName: string
	isDeleted: boolean
	permissions: Permission[]
}

export default function RolesManagementPage() {
	const [roles, setRoles] = useState<Role[]>([])
	const [selectedRole, setSelectedRole] = useState<Role | null>(null)
	const user = useCurrentUser()
	const { canView, canCreate, canEdit, canDelete } = usePermissions()

	useEffect(() => {
		fetchRoles()
	}, [])

	const fetchRoles = async () => {
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/roles`, {
				headers: {
					'Authorization': `Bearer ${user?.token}`
				}
			})
			if (response.ok) {
				const data = await response.json()
				setRoles(data)
			} else {
				toast({
					title: 'Error',
					description: 'Error al obtener roles',
					variant: 'destructive',
				})
			}
		} catch (error) {
			console.error('Error fetching roles:', error)
		}
	}

	const deleteRole = async (roleId: number) => {
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/roles/${roleId}`, {
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${user?.token}`
				}
			})
			if (response.ok) {
				// Role deleted successfully
			} else {
				throw new Error('Error al eliminar el rol')
			}
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Error al eliminar el rol',
				variant: 'destructive',
			})
			console.error('Error deleting role:', error)
		}
	}

	const updateRoleName = async (roleId: number, roleName: string) => {
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/roles/${roleId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${user?.token}`
				},
				body: JSON.stringify({ roleName })
			})
			if (response.ok) {
				await fetchRoles()
				toast({
					title: 'Éxito',
					description: 'Nombre del rol actualizado exitosamente',
				})
			} else {
				throw new Error('Error al actualizar el nombre del rol')
			}
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Error al actualizar el nombre del rol',
				variant: 'destructive',
			})
			console.error('Error updating role name:', error)
		}
	}

	const handleRoleCreated = async () => {
		await fetchRoles()
		toast({
			title: 'Éxito',
			description: 'Rol creado exitosamente',
		})
	}

	const handleRoleUpdated = async () => {
		await fetchRoles()
		toast({
			title: 'Éxito',
			description: 'Rol actualizado exitosamente',
		})
	}

	const handleRoleDeleted = async (roleId: number) => {
		setSelectedRole(null)
		await deleteRole(roleId)
		toast({
			title: 'Éxito',
			description: 'Rol eliminado exitosamente',
		})
		await fetchRoles()
	}

	return (
		<ProtectedRoute moduleName="Auth" action="View">
			<div className="container mx-auto p-6">
				<h1 className="text-3xl font-bold mb-6">Gestión de roles y permisos</h1>
				<Tabs defaultValue="view" className="space-y-4">
					<TabsList>
						<TabsTrigger value="view">Ver roles y permisos</TabsTrigger>
						<TabsTrigger value="manage">Gestionar roles</TabsTrigger>
						<TabsTrigger value="create">Crear rol</TabsTrigger>
					</TabsList>
					<TabsContent value="view">
						<Card>
							<CardHeader>
								<CardTitle>Roles y permisos</CardTitle>
								<CardDescription>Ver todos los roles y sus permisos</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-6">
									{roles.map((role) => (
										<div key={role.roleId} className="border p-4 rounded-md">
											<h3 className="text-lg font-semibold mb-2">{role.roleName}</h3>
											<div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
												{role.permissions.map((permission) => (
													<div key={permission.permissionId} className="text-sm">
														{permission.moduleName} - {permission.action}
													</div>
												))}
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</TabsContent>
					<TabsContent value="manage">
						<div className="grid gap-6 md:grid-cols-2">
							<Card>
								<CardHeader>
									<CardTitle>Roles</CardTitle>
									<CardDescription>Administrar roles existentes</CardDescription>
								</CardHeader>
								<CardContent>
									<RoleList
										roles={roles}
										onSelectRole={setSelectedRole}
										onDeleteRole={handleRoleDeleted}
										onUpdateRoleName={updateRoleName} // Pass the new method
										canEdit={canEdit('Auth')}
										canDelete={canDelete('Auth')}
									/>
								</CardContent>
							</Card>
							<Card>
								<CardHeader>
									<CardTitle>{selectedRole ? 'Editar Rol' : 'Seleccione un Rol'}</CardTitle>
									<CardDescription>
										{selectedRole ? 'Modificar permisos del rol' : 'Elija un rol para editar sus permisos'}
									</CardDescription>
								</CardHeader>
								<CardContent>
									{canEdit('Auth') && selectedRole && (
										<PermissionManager
											role={selectedRole}
											allPermissions={roles.find(r => r.roleId === 6)?.permissions || []}
											onRoleUpdated={handleRoleUpdated}
										/>
									)}
								</CardContent>
							</Card>
						</div>
					</TabsContent>
					<TabsContent value="create">
						<Card>
							<CardHeader>
								<CardTitle>Crear Nuevo Rol</CardTitle>
								<CardDescription>Añadir un nuevo rol al sistema</CardDescription>
							</CardHeader>
							<CardContent>
								{canCreate('Auth') && (
									<CreateRoleForm onRoleCreated={handleRoleCreated} />
								)}
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</ProtectedRoute>
	)
}