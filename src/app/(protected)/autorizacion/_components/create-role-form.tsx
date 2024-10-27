import { useState } from 'react'
import { useCurrentUser } from '@/hooks/use-current-user'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface CreateRoleFormProps {
	onRoleCreated: () => void
}

export function CreateRoleForm({ onRoleCreated }: CreateRoleFormProps) {
	const [roleName, setRoleName] = useState('')
	const user = useCurrentUser()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/roles`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${user?.token}`
				},
				body: JSON.stringify({ roleName })
			})
			if (response.ok) {
				setRoleName('')
				onRoleCreated()
			} else {
				throw new Error('Failed to create role')
			}
		} catch (error) {
			console.error('Error creating role:', error)
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div>
				<Label htmlFor="roleName">Nombre del rol</Label>
				<Input
					id="roleName"
					value={roleName}
					onChange={(e) => setRoleName(e.target.value)}
					placeholder="Ingrese el nombre del rol"
					required
				/>
			</div>
			<Button type="submit">Crear Rol</Button>
		</form>
	)
}