"use client";
import { withAuth } from '../auth/with-auth'
import UsersComponent from './app-users-page'

function Users() {

	return (
		<div className='mt-20'>
			<UsersComponent />
		</div>
	)
}

export default withAuth(Users, {
	requiredPermissions: [{ module: 'Auth', action: 'Edit' }],
	requiredRoles: ['Vice Chancellor', 'Pedagogical Coordinator', 'Administrador']
})