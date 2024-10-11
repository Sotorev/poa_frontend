"use client";
import { withAuth } from '../auth/with-auth'
import OdsComponent from './ods-management-page'

function Users() {

	return (
		<div className='mt-20'>
			<OdsComponent />
		</div>
	)
}

export default withAuth(Users, {
	requiredPermissions: [{ module: 'Auth', action: 'Edit' }],
	requiredRoles: ['Vice Chancellor', 'Pedagogical Coordinator', 'Administrador']
})