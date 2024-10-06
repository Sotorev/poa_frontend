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
	requiredPermissions: [{ module: 'Users', action: 'Edit' }],
	requiredRoles: ['Vice Chancellor', 'Pedagogical Coordinator']
})