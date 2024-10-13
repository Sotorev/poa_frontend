"use client";
import { withAuth } from '../auth/with-auth'
import ProgramsComponent from './programs-management-page'

function Users() {

	return (
		<div className='mt-20'>
			<ProgramsComponent />
		</div>
	)
}

export default withAuth(Users, {
	requiredPermissions: [{ module: 'Auth', action: 'Edit' }],
	requiredRoles: ['Vice Chancellor', 'Pedagogical Coordinator', 'Administrador']
})