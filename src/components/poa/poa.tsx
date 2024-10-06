"use client";
import { withAuth } from '../auth/with-auth'
import PoaPage from './poa-page'

function Users() {

	return (
		<div className='mt-20'>
			<PoaPage />
		</div>
	)
}

export default withAuth(Users, {
	requiredPermissions: [{ module: 'POA', action: 'Create' }],
	requiredRoles: ['Vice Chancellor', 'Pedagogical Coordinator']
})