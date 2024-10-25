'use client'

import { useState, useEffect } from 'react'
import { useCurrentUser } from '@/hooks/use-current-user'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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

interface PermissionManagerProps {
	role: Role
	allPermissions: Permission[]
	onRoleUpdated: () => void
}

export function PermissionManager({ role, allPermissions, onRoleUpdated }: PermissionManagerProps) {
	const [selectedPermissions, setSelectedPermissions] = useState<number[]>(
		role.permissions.map(p => p.permissionId)
	)
	const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
	const user = useCurrentUser()

	useEffect(() => {
		setSelectedPermissions(role.permissions.map(p => p.permissionId))
	}, [role])

	const handlePermissionChange = (permissionId: number) => {
		setSelectedPermissions((prev) =>
			prev.includes(permissionId)
				? prev.filter((id) => id !== permissionId)
				: [...prev, permissionId]
		)
	}

	const handleUpdateClick = (e: React.FormEvent) => {
		e.preventDefault()
		setIsUpdateDialogOpen(true)
	}

	const handleConfirmUpdate = async () => {
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/roles/${role.roleId}/setPermissions`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${user?.token}`
				},
				body: JSON.stringify({ permissionIds: selectedPermissions })
			})
			if (response.ok) {
				onRoleUpdated()
			} else {
				throw new Error('Error al actualizar los permisos del rol')
			}
		} catch (error) {
			console.error('Error updating role permissions:', error)
		} finally {
			setIsUpdateDialogOpen(false)
		}
	}

	return (
		<>
			<form onSubmit={handleUpdateClick} className="space-y-4">
				<h3 className="text-lg font-semibold">Permisos para {role.roleName}</h3>
				<div className="grid gap-4 md:grid-cols-2">
					{allPermissions.map((permission) => (
						<div key={permission.permissionId} className="flex items-center space-x-2">
							<Checkbox
								id={`permission-${permission.permissionId}`}
								checked={selectedPermissions.includes(permission.permissionId)}
								onCheckedChange={() => handlePermissionChange(permission.permissionId)}
							/>
							<Label htmlFor={`permission-${permission.permissionId}`}>
								{permission.moduleName} - {permission.action}
							</Label>
						</div>
					))}
				</div>
				<Button type="submit">Actualizar permisos</Button>
			</form>

			<AlertDialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>¿Confirmar actualización de permisos?</AlertDialogTitle>
						<AlertDialogDescription>
							¿Está seguro de que desea actualizar los permisos para el rol <b>{role.roleName}</b>?
							Esta acción modificará los permisos asignados al rol.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancelar</AlertDialogCancel>
						<AlertDialogAction onClick={handleConfirmUpdate}>Actualizar</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}