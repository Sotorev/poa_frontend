'use client'

import { useState } from 'react'
import type { PEI } from '@/types/pei'
import PeiManagement from './pei-register'
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Settings } from 'lucide-react'
import { PoaRegistrationPeriodForm } from './poa-registration-period'
import { useCurrentUser } from '@/hooks/use-current-user'
import Link from 'next/link'
import { unknown } from 'zod'

type PoaRegistrationPeriod = {
	year: number
	registrationStartDate: string
	registrationEndDate: string
	peiId: number
}

export default function PEIModule() {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { toast } = useToast();
	const user = useCurrentUser();

	const handleSubmit = async (pei: PEI) => {
		setIsSubmitting(true)
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pei`, {
				method: 'POST',
				body: JSON.stringify(pei),
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${user?.token}`
				},
			})
			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error)
			}

			toast({
				title: "Éxito",
				description: "¡PEI enviado con éxito!",
			})
		
		} catch (error) {
			toast({
				title: "Error",
				description: (error instanceof Error ? error.message : "Error al enviar el PEI. Por favor, inténtelo de nuevo."),
				variant: "destructive",
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	const handlePoaRegistrationPeriodSubmit = async (period: PoaRegistrationPeriod) => {
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/poaRegistrationPeriods`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${user?.token}`
			},
			body: JSON.stringify(period),
		})

		if (!response.ok) {
			throw new Error('Error al enviar el período de registro de POA')
		}

		const data = await response.json()
	
	}

	return (
		<div className="container mx-auto p-4 mt-20">
			<h1 className="text-2xl font-bold mb-6">Gestión de PEI</h1>
			<div className="grid gap-6 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center">
							<PlusCircle className="mr-2" />
							Registrar Nuevo PEI
						</CardTitle>
						<CardDescription>Cree un nuevo Plan Estratégico Institucional para cerrar un ciclo</CardDescription>
					</CardHeader>
					<CardContent>
						<Button onClick={() => document.getElementById('peiForm')?.scrollIntoView({ behavior: 'smooth' })}>
							Iniciar Registro
						</Button>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center">
							<Settings className="mr-2" />
							Gestionar PEI Actual
						</CardTitle>
						<CardDescription>Administre y actualice el Plan Estratégico Institucional vigente</CardDescription>
					</CardHeader>
					<CardContent className='flex md:flex-col gap-2'>
						<Link href="/pei/editar" className='bg-primary p-2 text-white rounded-lg text-center'>
							Editar Plan Estratégico Institucional
						</Link>
						{/* <PoaRegistrationPeriodForm onSubmit={handlePoaRegistrationPeriodSubmit} /> */}
					</CardContent>
				</Card>
			</div>
			<div id="peiForm" className="mt-12">
				<Card>
					<CardHeader>
						<CardTitle>Formulario de Registro de PEI</CardTitle>
						<CardDescription>Complete los detalles del nuevo Plan Estratégico Institucional</CardDescription>
					</CardHeader>
					<CardContent>
						<PeiManagement onSubmit={handleSubmit} isSubmitting={isSubmitting} />
					</CardContent>
				</Card>
			</div>
		</div>
	)
}