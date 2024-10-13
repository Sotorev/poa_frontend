"use client";
import { withAuth } from '../auth/with-auth'
import DepartmentComponent from './department-management-page'

function Users() {

	return (
		<div className='mt-20'>
			<DepartmentComponent />
		</div>
	)
}

export default withAuth(Users, {
	requiredPermissions: [{ module: 'Auth', action: 'Edit' }],
	requiredRoles: ['Vice Chancellor', 'Pedagogical Coordinator', 'Administrador']
})