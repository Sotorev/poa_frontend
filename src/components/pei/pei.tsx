'use client'

import { useState } from 'react'
import type { PEI } from '@/types/pei'
import { withAuth } from '../auth/with-auth'
import PeiManagement from './pei-management'
import { useToast } from "@/hooks/use-toast"

function PEI() {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const { toast } = useToast()

	const handleSubmit = async (pei: PEI) => {
		setIsSubmitting(true)
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pei`, {
				method: 'POST',
				body: JSON.stringify(pei),
				headers: {
					'Content-Type': 'application/json'
				},
				credentials: 'include'
			})

			if (!response.ok) {
				throw new Error('Failed to submit PEI')
			}

			const data = await response.json()
			toast({
				title: "Éxito",
				description: "¡PEI enviado con éxito!",
			})
			console.log('Submitted PEI:', data)
		} catch (error) {
			console.error('Error submitting PEI:', error)
			toast({
				title: "Error",
				description: "Error al enviar el PEI. Por favor, inténtelo de nuevo.",
				variant: "destructive",
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className='mt-20'>
			<PeiManagement onSubmit={handleSubmit} isSubmitting={isSubmitting} />
		</div>
	)
}

export default withAuth(PEI, {
	requiredPermissions: [{ module: 'PEI', action: 'Edit' }],
	requiredRoles: ['Vice Chancellor', 'Pedagogical Coordinator']
})