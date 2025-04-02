"use client"
import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast'; // Using toast for notifications
import { Trash2 } from 'lucide-react'; // Import trash icon
import { useCurrentUser } from '@/hooks/use-current-user';
import { updatePeiSchema } from '../../schemas/pei.schema';

// Type alias for the update form data
type PeiUpdateFormData = z.infer<typeof updatePeiSchema>;

// Define the type for the fetched PEI data based on the example response
interface Intervention {
	interventionId?: number;
	name: string;
	isDeleted?: boolean;
	strategyId: number;
	status?: "Aprobado" | "Pendiente" | "Rechazado" | "";
	createdAt?: string;
	updatedAt?: string;
	userId?: number | null;
	reasonForChange?: string | null;
}

interface Strategy {
	strategyId?: number;
	description: string;
	strategicAreaId: number;
	completionPercentage?: number;
	assignedBudget?: number;
	executedBudget?: number | null;
	isDeleted?: boolean;
	interventions: Intervention[];
	status?: "Aprobado" | "Pendiente" | "Rechazado" | "";
	createdAt?: string;
	updatedAt?: string;
	userId?: number | null;
	reasonForChange?: string | null;
}

interface StrategicArea {
	strategicAreaId?: number;
	name: string;
	peiId: number;
	strategicObjective: string;
	isDeleted?: boolean;
	strategies: Strategy[];
	status?: "Aprobado" | "Pendiente" | "Rechazado" | "";
	createdAt?: string;
	updatedAt?: string;
	userId?: number | null;
	reasonForChange?: string | null;
}

interface PeiData {
	peiId: number;
	startYear: number;
	endYear: number;
	name: string;
	status: 'Activo' | 'Inactivo';
	isDeleted: boolean;
	strategicAreas: StrategicArea[];
}

function PEIUpdate() {
	const [peiData, setPeiData] = useState<PeiData | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const user = useCurrentUser()

	const form = useForm<PeiUpdateFormData>({
		resolver: zodResolver(updatePeiSchema),
		defaultValues: async () => {
			setIsLoading(true);
			setError(null);
			try {
				const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pei/current`,
					{
						headers: {
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${user?.token}`
						},
					}
				);
				if (!response.ok) {
					throw new Error(`Error HTTP! estado: ${response.status}`);
				}
				const data: PeiData = await response.json();
				setPeiData(data); // Store full data including peiId
				setIsLoading(false);
				
				// Map fetched data to form schema, handling potential nulls/undefined if necessary
				return {
					name: data.name,
					status: data.status,
					startYear: data.startYear,
					endYear: data.endYear,
					strategicAreas: data.strategicAreas?.map((area: StrategicArea) => ({
						strategicAreaId: area.strategicAreaId,
						name: area.name,
						strategicObjective: area.strategicObjective,
						isDeleted: area.isDeleted,
						strategies: area.strategies?.map((strategy: Strategy) => {
							const mappedInterventions = strategy.interventions?.map((intervention: Intervention) => ({
								interventionId: intervention.interventionId,
								name: intervention.name,
								isDeleted: intervention.isDeleted,
								status: intervention.status || undefined,
								strategyId: intervention.strategyId
							})) ?? [];
							
							return {
								strategyId: strategy.strategyId,
								strategicAreaId: strategy.strategicAreaId,
								description: strategy.description,
								completionPercentage: strategy.completionPercentage,
								assignedBudget: strategy.assignedBudget,
								executedBudget: strategy.executedBudget ?? undefined,
								isDeleted: strategy.isDeleted,
								interventions: mappedInterventions,
								status: strategy.status || undefined
							};
						}) ?? [],
					})) ?? [],
				};
			} catch (err) {
				console.error("Error al obtener datos del PEI:", err);
				setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido');
				setIsLoading(false);
				// Return empty/default structure on error to avoid breaking the form
				return {
					name: '',
					status: 'Activo',
					startYear: new Date().getFullYear(),
					endYear: new Date().getFullYear() + 4,
					strategicAreas: [],
				};
			}
		},
	});

	const { fields: strategicAreaFields, append: appendStrategicArea, remove: removeStrategicArea, update: updateStrategicArea } = useFieldArray({
		control: form.control,
		name: "strategicAreas",
	});

	// Logic to handle deletion with cascade effect
	const handleDeleteStrategicArea = (areaIndex: number) => {
		const areas = form.getValues('strategicAreas');
		if (!areas || !areas[areaIndex]) {
			removeStrategicArea(areaIndex);
			return;
		}
		
		const area = areas[areaIndex];
		
		// If it doesn't have an ID yet, just remove it from the form
		if (!area.strategicAreaId) {
			removeStrategicArea(areaIndex);
			return;
		}
		
		// Mark the area and all its strategies and interventions as deleted
		const updatedArea = {
			...area,
			isDeleted: true,
			strategies: area.strategies ? 
				area.strategies.map((strategy: any) => ({
					...strategy,
					isDeleted: true,
					interventions: strategy.interventions ? 
						strategy.interventions.map((intervention: any) => ({
							...intervention,
							isDeleted: true
						})) : []
				})) : []
		};
		
		// First update the data for logical deletion
		updateStrategicArea(areaIndex, updatedArea);
		
		// Then remove from UI for immediate feedback
		removeStrategicArea(areaIndex);
	};

	// Filter visible strategic areas
	const visibleStrategicAreaFields = strategicAreaFields.filter((field, index) => {
		const values = form.getValues(`strategicAreas.${index}`);
		return !values?.isDeleted;
	});

	async function onSubmit(values: PeiUpdateFormData) {
		if (!peiData?.peiId) {
			toast({
				title: "Error",
				description: "Falta el ID del PEI. No se puede actualizar.",
				variant: "destructive",
			});
			return;
		}
		console.log("Enviando valores:", JSON.stringify(values, null, 2)); // Log values before sending

		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pei/${peiData.peiId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${user?.token}`
				},

				body: JSON.stringify(values),
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ message: "Ocurrió un error desconocido durante el envío." }));
				throw new Error(errorData.message || `Error HTTP! estado: ${response.status}`);
			}

			const result = await response.json();
			toast({
				title: "Éxito",
				description: "¡PEI actualizado correctamente!",
			});
			console.log("Actualización exitosa:", result);
		} catch (err) {
			console.error("Error al actualizar el PEI:", err);
			toast({
				title: "Error",
				description: `Error al actualizar el PEI: ${err instanceof Error ? err.message : 'Error desconocido'}`,
				variant: "destructive",
			});
		}
	}

	if (isLoading) {
		return <div>Cargando datos del PEI...</div>; // Replace with a proper spinner/skeleton loader
	}

	if (error) {
		return <div className="text-red-600">Error al cargar datos del PEI: {error}</div>;
	}

	return (
		<Card className="w-full max-w-4xl mx-auto my-8">
			<CardHeader>
				<CardTitle>Actualizar PEI: {peiData?.name}</CardTitle>
				<CardDescription>Modifica los detalles del Plan Estratégico Institucional.</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
						{/* Basic PEI Info */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Nombre del PEI</FormLabel>
										<FormControl>
											<Input placeholder="Ingrese el nombre del PEI" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="status"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Estado</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Seleccione el estado" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="Activo">Activo</SelectItem>
												<SelectItem value="Inactivo">Inactivo</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="startYear"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Año de Inicio</FormLabel>
										<FormControl>
											{/* Ensure value is treated as number */}
											<Input
												type="number"
												placeholder="AAAA"
												{...field}
												value={field.value || ''} // Handle potential null/undefined
												onChange={e => field.onChange(parseInt(e.target.value, 10) || null)} // Parse to number
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="endYear"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Año de Fin</FormLabel>
										<FormControl>
											<Input
												type="number"
												placeholder="AAAA"
												{...field}
												value={field.value || ''}
												onChange={e => field.onChange(parseInt(e.target.value, 10) || null)}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<Separator />

						{/* Strategic Areas */}
						<div>
							<h3 className="text-lg font-semibold mb-4">Áreas Estratégicas</h3>
							{visibleStrategicAreaFields.map((areaField, visibleIndex) => {
								// Find the actual index in the original array
								const actualIndex = strategicAreaFields.findIndex(field => field.id === areaField.id);
								return (
									<Card key={areaField.id} className="mb-6 border border-gray-300 dark:border-gray-700">
										<CardHeader className="flex flex-row items-center justify-between bg-gray-50 dark:bg-gray-800 p-4">
											<CardTitle className="text-md">Área Estratégica {visibleIndex + 1}</CardTitle>
											<Button
												type="button"
												variant="destructive"
												size="sm"
												onClick={() => handleDeleteStrategicArea(actualIndex)}
											>
												<Trash2 className="h-4 w-4 mr-1" /> Eliminar Área
											</Button>
										</CardHeader>
										<CardContent className="p-4 space-y-4">
											<FormField
												control={form.control}
												name={`strategicAreas.${actualIndex}.name`}
												render={({ field }) => (
													<FormItem>
														<FormLabel>Nombre del Área</FormLabel>
														<FormControl>
															<Input placeholder="Ingrese el nombre del área estratégica" {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											{/* Strategic Objective (now a text field) */}
											<FormField
												control={form.control}
												name={`strategicAreas.${actualIndex}.strategicObjective`}
												render={({ field }) => (
													<FormItem>
														<FormLabel>Objetivo Estratégico</FormLabel>
														<FormControl>
															<Input placeholder="Ingrese el objetivo estratégico" {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											{/* Strategies (directly under Strategic Area) */}
											<StrategiesArray control={form.control} areaIndex={actualIndex} />
										</CardContent>
									</Card>
								);
							})}
							<Button
								type="button"
								variant="outline"
								onClick={() => appendStrategicArea({
									name: '',
									strategicObjective: '',
									strategies: [],
								})}
							>
								Añadir Área Estratégica
							</Button>
						</div>

						<Separator />

						<Button type="submit" disabled={form.formState.isSubmitting}>
							{form.formState.isSubmitting ? 'Actualizando...' : 'Actualizar PEI'}
						</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}


// --- Helper Component for Nested Strategies Array ---
interface StrategiesArrayProps {
	control: any; // Type properly: Control<PeiUpdateFormData>
	areaIndex: number;
}

const StrategiesArray: React.FC<StrategiesArrayProps> = ({ control, areaIndex }) => {
	// Use useFormContext to get access to the form methods
	const { getValues } = useFormContext();
	const { fields, append, remove, update } = useFieldArray({
		control,
		name: `strategicAreas.${areaIndex}.strategies`,
	});

	const handleDeleteStrategy = (strategyIndex: number) => {
		// Access strategy using the traditional approach with index path
		const strategies = getValues(`strategicAreas.${areaIndex}.strategies`);
		if (!strategies || !strategies[strategyIndex]) {
			// If we can't get the strategy, just remove it
			remove(strategyIndex);
			return;
		}
		
		const strategy = strategies[strategyIndex];
		
		// If it doesn't have an ID yet, just remove it from the form
		if (!strategy.strategyId) {
			remove(strategyIndex);
			return;
		}
		
		// Otherwise, mark it as deleted
		// Also mark all of its interventions as deleted
		const updatedStrategy = {
			...strategy,
			isDeleted: true,
			interventions: strategy.interventions ? strategy.interventions.map((intervention: any) => ({
				...intervention,
				isDeleted: true
			})) : []
		};
		
		// First update the data for logical deletion
		update(strategyIndex, updatedStrategy);
		
		// Then remove from UI for immediate feedback
		remove(strategyIndex);
	};

	return (
		<div className="space-y-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
			<h4 className="text-md font-semibold mb-2">Estrategias</h4>
			{fields.map((strategyField, visibleIndex) => {
				// Find the actual index in the original array
				const actualIndex = fields.findIndex(field => field.id === strategyField.id);
				return (
					<Card key={strategyField.id} className="mb-4 border border-green-300 dark:border-green-700">
						<CardHeader className="flex flex-row items-center justify-between bg-green-50 dark:bg-green-900 p-2">
							<CardTitle className="text-sm">Estrategia {visibleIndex + 1}</CardTitle>
							<Button
								type="button"
								variant="destructive"
								onClick={() => handleDeleteStrategy(actualIndex)}
							>
								<Trash2 className="h-3 w-3" /> {/* Smaller icon */}
							</Button>
						</CardHeader>
						<CardContent className="p-3 space-y-3">
							<FormField
								control={control}
								name={`strategicAreas.${areaIndex}.strategies.${actualIndex}.description`}
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-xs">Descripción</FormLabel>
										<FormControl>
											<Input className="text-sm" placeholder="Descripción de la estrategia" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className="grid grid-cols-3 gap-2">
								<FormField
									control={control}
									name={`strategicAreas.${areaIndex}.strategies.${actualIndex}.completionPercentage`}
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-xs">% Completado</FormLabel>
											<FormControl>
												<Input
													type="number"
													className="text-sm"
													placeholder="%" {...field}
													value={field.value ?? ''}
													onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={control}
									name={`strategicAreas.${areaIndex}.strategies.${actualIndex}.assignedBudget`}
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-xs">Presupuesto Asignado</FormLabel>
											<FormControl>
												<Input
													type="number"
													className="text-sm"
													placeholder="Presupuesto" {...field}
													value={field.value ?? ''}
													onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
													step="0.01"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={control}
									name={`strategicAreas.${areaIndex}.strategies.${actualIndex}.executedBudget`}
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-xs">Presupuesto Ejecutado</FormLabel>
											<FormControl>
												<Input
													type="number"
													className="text-sm"
													placeholder="Presupuesto" {...field}
													value={field.value ?? ''}
													onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
													step="0.01"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{/* Interventions (nested within Strategy) */}
							<InterventionsArray control={control} areaIndex={areaIndex} strategyIndex={actualIndex} />
						</CardContent>
					</Card>
				);
			})}
			<Button
				type="button"
				variant="outline"
				size="sm"
				onClick={() => append({
					description: '',
					strategicAreaId: getValues(`strategicAreas.${areaIndex}.strategicAreaId`),
					completionPercentage: 0, // Provide defaults
					assignedBudget: 0,
					executedBudget: 0,
					interventions: [],
				})}
			>
				Añadir Estrategia
			</Button>
		</div>
	);
}


// --- Helper Component for Nested Interventions Array ---
interface InterventionsArrayProps {
	control: any; // Type properly: Control<PeiUpdateFormData>
	areaIndex: number;
	strategyIndex: number;
}

const InterventionsArray: React.FC<InterventionsArrayProps> = ({ control, areaIndex, strategyIndex }) => {
	// Use useFormContext to get access to the form methods
	const { getValues } = useFormContext();
	const { fields, append, remove, update } = useFieldArray({
		control,
		name: `strategicAreas.${areaIndex}.strategies.${strategyIndex}.interventions`,
	});

	const handleDeleteIntervention = (interventionIndex: number) => {
		// Simple removal approach that doesn't rely on accessing field values directly
		const interventions = getValues(`strategicAreas.${areaIndex}.strategies.${strategyIndex}.interventions`);
		if (!interventions || !interventions[interventionIndex]) {
			// If we can't get the intervention, just remove it
			remove(interventionIndex);
			return;
		}
		
		const intervention = interventions[interventionIndex];
		
		// If it doesn't have an ID yet, just remove it from the form
		if (!intervention.interventionId) {
			remove(interventionIndex);
			return;
		}
		
		// First update the data for logical deletion
		update(interventionIndex, {
			...intervention,
			isDeleted: true,
		});
		
		// Then remove from UI for immediate feedback
		remove(interventionIndex);
	};

	return (
		<div className="space-y-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
			<h5 className="text-sm font-semibold mb-1">Intervenciones</h5>
			{fields.map((interventionField, interventionIndex) => (
				<Card key={interventionField.id} className="mb-2 border border-purple-300 dark:border-purple-700">
					<CardHeader className="flex flex-row items-center justify-between bg-purple-50 dark:bg-purple-900 p-1 px-2">
						<CardTitle className="text-xs">Intervención {interventionIndex + 1}</CardTitle>
						<Button
							type="button"
							variant="ghost" // Less prominent delete
							className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900"
							onClick={() => handleDeleteIntervention(interventionIndex)}
						>
							<Trash2 className="h-3 w-3" />
						</Button>
					</CardHeader>
					<CardContent className="p-2">
						<FormField
							control={control}
							name={`strategicAreas.${areaIndex}.strategies.${strategyIndex}.interventions.${interventionIndex}.name`}
							render={({ field }) => (
								<FormItem>
									{/* No label needed if context is clear */}
									{/* <FormLabel className="text-xs">Nombre</FormLabel> */}
									<FormControl>
										<Input className="text-xs h-8" placeholder="Nombre de la intervención" {...field} />
									</FormControl>
									<FormMessage className="text-xs"/>
								</FormItem>
							)}
						/>
					</CardContent>
				</Card>
			))}
			<Button
				type="button"
				variant="outline"
				onClick={() => append({ name: '' })}
			>
				Añadir Intervención
			</Button>
		</div>
	);
}


export default PEIUpdate;