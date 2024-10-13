"use client";
import { withAuth } from '../auth/with-auth'
import CampusComponent from './campus-management-page'

function Users() {

	return (
		<div className='mt-20'>
			<CampusComponent />
		</div>
	)
}

export default withAuth(Users, {
	requiredPermissions: [{ module: 'Auth', action: 'Edit' }],
	requiredRoles: ['Vice Chancellor', 'Pedagogical Coordinator', 'Administrador']
})