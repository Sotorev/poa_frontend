"use client";
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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

interface RoleListProps {
	roles: Role[]
	onSelectRole: (role: Role) => void
	onDeleteRole: (roleId: number) => void
	canEdit: boolean
	canDelete: boolean
}

export function RoleList({ roles, onSelectRole, onDeleteRole, canEdit, canDelete }: RoleListProps) {
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
	const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)

	const handleDeleteClick = (role: Role) => {
		setRoleToDelete(role)
		setIsDeleteDialogOpen(true)
	}

	const handleConfirmDelete = () => {
		if (roleToDelete) {
			onDeleteRole(roleToDelete.roleId)
		}
		setIsDeleteDialogOpen(false)
	}

	return (
		<>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Nombre del Rol</TableHead>
						<TableHead>Acciones</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{roles.map((role) => (
						<TableRow key={role.roleId}>
							<TableCell>{role.roleName}</TableCell>
							<TableCell>
								{canEdit && (
									<Button variant="outline" onClick={() => onSelectRole(role)} className="mr-2">
										Editar
									</Button>
								)}
								{canDelete && (
									<Button variant="destructive" onClick={() => handleDeleteClick(role)}>
										Eliminar
									</Button>
								)}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			<AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>¿Está seguro de que desea eliminar este rol?</AlertDialogTitle>
						<AlertDialogDescription>
							Esta acción no se puede deshacer. Se eliminará permanentemente el rol
							{roleToDelete && <strong> {roleToDelete.roleName}</strong>}.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancelar</AlertDialogCancel>
						<AlertDialogAction onClick={handleConfirmDelete}>Eliminar</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}