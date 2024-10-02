'use client'

import { withAuth } from './auth/withAuth'

function PEI({  }) {
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