'use client'

// import PlanificacionFormComponent from '@/components/poa/eventManagement/formView/formulario-planificacion'
import { TablaPlanificacionComponent } from '@/components/poa/eventManagement/tabla-planificacion'
import React, { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const CreatePOAPage = () => {
	const [formPreference, setFormPreference] = useState<'traditional' | 'table'>('traditional')

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
				<TablaPlanificacionComponent />
			) : (
				<TablaPlanificacionComponent />
			)}
		</div>
	)
}

export default CreatePOAPage