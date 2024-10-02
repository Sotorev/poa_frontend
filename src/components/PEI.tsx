'use client'

import { withAuth } from './withAuth'

function PEI({ user }) {
	return (
		<div>
			<h1>PEI Management</h1>
			{/* PEI management UI */}
		</div>
	)
}

export default withAuth(PEI, {
	requiredPermissions: [{ module: 'PEI', action: 'Edit' }],
	requiredRoles: ['Vice Chancellor', 'Pedagogical Coordinator']
})