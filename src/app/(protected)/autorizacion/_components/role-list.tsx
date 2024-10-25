import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

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
	return (
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
								<Button variant="destructive" onClick={() => onDeleteRole(role.roleId)}>
									Eliminar
								</Button>
							)}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	)
}