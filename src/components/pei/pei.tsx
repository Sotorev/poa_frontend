'use client'

import type { PEI } from '@/types/pei'
import { withAuth } from '../auth/withAuth'
import PeiManagement from './pei-management'

function PEI() {

	const handleSubmit = async (pei: PEI) => {
		// Here you would typically send the PEI data to your API
		fetch(`${process.env.NEXT_PUBLIC_API_URL}/pei`, {
			method: 'POST',
			body: JSON.stringify(pei),
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include'
		})
		console.log('Submitting PEI:', pei)
		// Implement your API call here
	}
	return (
		<PeiManagement onSubmit={handleSubmit} />
	)
}

export default withAuth(PEI, {
	requiredPermissions: [{ module: 'PEI', action: 'Edit' }],
	requiredRoles: ['Vice Chancellor', 'Pedagogical Coordinator']
})