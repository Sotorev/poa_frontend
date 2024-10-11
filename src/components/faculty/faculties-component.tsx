"use client";
import { withAuth } from '../auth/with-auth'
import FacultyComponent from './faculties-management-page'

function Users() {

	return (
		<div className='mt-20'>
			<FacultyComponent />
		</div>
	)
}

export default withAuth(Users, {
	requiredPermissions: [{ module: 'Auth', action: 'Edit' }],
	requiredRoles: ['Vice Chancellor', 'Pedagogical Coordinator', 'Administrador']
})