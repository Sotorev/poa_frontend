'use client'

// import PlanificacionFormComponent from '@/components/poa/eventManagement/formView/formulario-planificacion'
import React, { useState, useEffect, useContext } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Components
import { TraditionalView } from '@/components/poa/eventManagement/formView/UI.traditionalView'

// Context
import { EventContext, EventProvider } from '@/components/poa/eventManagement/context.event'
import { TableForm } from '@/components/poa/eventManagement/table-form/table-form'
import { Card, CardTitle, CardHeader } from '@/components/ui/card'

const PageContent = () => {
	const [formPreference, setFormPreference] = useState<'traditional' | 'table'>('traditional')
	const { isPoaApproved } = useContext(EventContext)
	
	useEffect(() => {
		// Load preference from local storage
		const savedPreference = localStorage.getItem('poaFormPreference')
		if (savedPreference === 'traditional' || savedPreference === 'table') {
			setFormPreference(savedPreference)
		}
	}, [])

	const handlePreferenceChange = (value: string) => {
		if (value === 'traditional' || value === 'table') {
			setFormPreference(value)
			// Save preference to local storage
			localStorage.setItem('poaFormPreference', value)
		}
	}
	
	
	return (
		<div className="w-full max-w-7xl mx-auto">
			{isPoaApproved && (
				<Card className="mb-6">
					<CardHeader>
						<CardTitle>POA aprobado</CardTitle>
						Es importante especificar que, dado que el POA ya fue aprobado,
						todos los eventos creados a través de este formulario serán considerados
						como extraordinarios. Por lo tanto, deberán ser autorizados previamente,
						ya que no estaban contemplados en la planificación original
					</CardHeader>
				</Card>
			)}
			<div className="mb-6">
				<Select onValueChange={handlePreferenceChange} value={formPreference}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Select form type" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="traditional">Formulario tradicional</SelectItem>
						<SelectItem value="table">Formulario tabla</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{formPreference === 'traditional' ? (
				<TraditionalView />
			) : (
				<TableForm />
			)}
		</div>
	)
}

const CreatePOAPage = () => {
	return (
		<EventProvider>
			<PageContent />
		</EventProvider>
	)
}

export default CreatePOAPage