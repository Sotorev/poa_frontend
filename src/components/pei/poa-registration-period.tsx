'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from 'lucide-react'
import { useCurrentUser } from '@/hooks/use-current-user'

type PoaRegistrationPeriod = {
	year: number
	registrationStartDate: string
	registrationEndDate: string
	peiId: number
}

type CurrentPEI = {
	peiId: number
	startYear: number
	endYear: number
	name: string
}

type PoaRegistrationPeriodFormProps = {
	onSubmit: (period: PoaRegistrationPeriod) => Promise<void>
}

export function PoaRegistrationPeriodForm({ onSubmit }: PoaRegistrationPeriodFormProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isLoading, setIsLoading] = useState(true)
	const { toast } = useToast()
	const [currentPEI, setCurrentPEI] = useState<CurrentPEI | null>(null)
	const [period, setPeriod] = useState<PoaRegistrationPeriod>({
		year: new Date().getFullYear(),
		registrationStartDate: '',
		registrationEndDate: '',
		peiId: 0,
	})
	const user = useCurrentUser();

	useEffect(() => {
		const fetchCurrentPEI = async () => {
			try {
				const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pei/current`, {
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${user?.token}`
					},				})
				if (!response.ok) {
					throw new Error('Error al obtener el PEI actual')
				}
				const data = await response.json()
				setCurrentPEI({
					peiId: data.peiId,
					startYear: data.startYear,
					endYear: data.endYear,
					name: data.name
				})
				setPeriod(prev => ({ ...prev, peiId: data.peiId }))
			} catch (error) {
				console.error('Error fetching current PEI:', error)
				toast({
					title: "Error",
					description: "No se pudo obtener el PEI actual. Por favor, inténtelo de nuevo más tarde.",
					variant: "destructive",
				})
			} finally {
				setIsLoading(false)
			}
		}

		if (isOpen) {
			fetchCurrentPEI()
		}
	}, [isOpen, toast])

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		setPeriod(prev => ({ ...prev, [name]: name === 'year' ? Number(value) : value }))
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsSubmitting(true)
		try {
			await onSubmit(period)
			toast({
				title: "Éxito",
				description: "Período de registro de POA creado exitosamente.",
			})
			setIsOpen(false)
		} catch (error) {
			console.error('Error al enviar el período de registro de POA:', error)
			toast({
				title: "Error",
				description: "Error al crear el período de registro de POA. Por favor, inténtelo de nuevo.",
				variant: "destructive",
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button>Habilitar periodo de registro de POA</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Registrar Período de POA</DialogTitle>
					<DialogDescription>
						Ingrese los detalles para el nuevo período de registro de POA.
					</DialogDescription>
				</DialogHeader>
				{isLoading ? (
					<div className="flex justify-center items-center h-40">
						<Loader2 className="h-8 w-8 animate-spin" />
					</div>
				) : currentPEI ? (
					<form onSubmit={handleSubmit}>
						<div className="grid gap-4 py-4">
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="year" className="text-right">
									Año
								</Label>
								<Input
									id="year"
									name="year"
									type="number"
									value={period.year}
									onChange={handleChange}
									className="col-span-3"
									min={currentPEI.startYear}
									max={currentPEI.endYear}
									required
								/>
							</div>
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="registrationStartDate" className="text-right">
									Fecha de inicio
								</Label>
								<Input
									id="registrationStartDate"
									name="registrationStartDate"
									type="date"
									value={period.registrationStartDate}
									onChange={handleChange}
									className="col-span-3"
									required
								/>
							</div>
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="registrationEndDate" className="text-right">
									Fecha de fin
								</Label>
								<Input
									id="registrationEndDate"
									name="registrationEndDate"
									type="date"
									value={period.registrationEndDate}
									onChange={handleChange}
									className="col-span-3"
									min={period.registrationStartDate}
									required
								/>
							</div>
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="currentPEI" className="text-right">
									PEI Actual
								</Label>
								<Input
									id="currentPEI"
									value={currentPEI.name}
									className="col-span-3"
									disabled
								/>
							</div>
						</div>
						<DialogFooter>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Enviando...
									</>
								) : (
									'Registrar Período'
								)}
							</Button>
						</DialogFooter>
					</form>
				) : (
					<div className="text-center text-red-500">
						No se pudo cargar la información del PEI actual. Por favor, inténtelo de nuevo más tarde.
					</div>
				)}
			</DialogContent>
		</Dialog>
	)
}