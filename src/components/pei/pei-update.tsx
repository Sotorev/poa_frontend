"use client"
import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
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


// --- Zod Schemas (Copied from user prompt for context, assuming they are imported from src/schemas/pei.schema.ts) ---

const interventionSchema = z.object({
	interventionId: z.number().int().positive().optional(),
	name: z.string().min(1, 'El nombre es requerido'),
	// Add isCanonical if needed based on API/logic, not in update schema but in GET response
	// isCanonical: z.boolean().optional(),
});

const strategySchema = z.object({
	strategyId: z.number().int().positive().optional(),
	description: z.string().min(1, 'La descripción es requerida'),
	completionPercentage: z.number().min(0).max(100).optional(),
	assignedBudget: z.number().min(0).optional(),
	executedBudget: z.number().min(0).optional(),
	interventions: z.array(interventionSchema).optional(),
});

const strategicObjectiveSchema = z.object({
	strategicObjectiveId: z.number().int().positive().optional(),
	description: z.string().min(1, 'La descripción es requerida'),
	strategies: z.array(strategySchema).optional(),
});

const strategicAreaSchema = z.object({
	strategicAreaId: z.number().int().positive().optional(),
	name: z.string().min(1, 'El nombre es requerido'),
	strategicObjective: strategicObjectiveSchema, // Note: API GET shows this nested, update schema expects it too
});

// Main schema for the update form
// Assuming this is imported from '../schemas/pei.schema'
// import { updatePeiSchema } from '../schemas/pei.schema';
const updatePeiSchema = z.object({
	name: z.string().min(1, 'El nombre es requerido').optional(), // Updated message
	status: z.enum(['Activo', 'Inactivo']),
	startYear: z.number().int().positive().optional(),
	endYear: z.number().int().positive(), // Required in original update schema
	strategicAreas: z.array(strategicAreaSchema).optional(),
	// Include peiId if needed for the PUT request URL, but not part of the body schema typically
});

type PeiUpdateFormData = z.infer<typeof updatePeiSchema>;

// Define the type for the fetched PEI data based on the example response
interface Intervention {
	interventionId: number;
	name: string;
	isDeleted: boolean;
	strategyId: number;
	isCanonical: boolean;
}

interface Strategy {
	strategyId: number;
	description: string;
	strategicObjectiveId: number;
	completionPercentage: number;
	assignedBudget: number;
	executedBudget: number;
	isDeleted: boolean;
	interventions: Intervention[];
}

interface StrategicObjective {
	strategicObjectiveId: number;
	description: string;
	strategicAreaId: number;
	isDeleted: boolean;
	strategies: Strategy[];
}

interface StrategicArea {
	strategicAreaId: number;
	name: string;
	peiId: number;
	isDeleted: boolean;
	strategicObjective: StrategicObjective;
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
				// Ensure keys match the updatePeiSchema fields
				return {
					name: data.name,
					status: data.status,
					startYear: data.startYear,
					endYear: data.endYear,
					strategicAreas: data.strategicAreas?.map(area => ({
						strategicAreaId: area.strategicAreaId,
						name: area.name,
						strategicObjective: {
							strategicObjectiveId: area.strategicObjective?.strategicObjectiveId,
							description: area.strategicObjective?.description ?? '',
							strategies: area.strategicObjective?.strategies?.map(strategy => ({
								strategyId: strategy.strategyId,
								description: strategy.description,
								completionPercentage: strategy.completionPercentage,
								assignedBudget: strategy.assignedBudget,
								executedBudget: strategy.executedBudget,
								interventions: strategy.interventions?.map(intervention => ({
									interventionId: intervention.interventionId,
									name: intervention.name,
								})) ?? [],
							})) ?? [],
						},
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

	const { fields: strategicAreaFields, append: appendStrategicArea, remove: removeStrategicArea } = useFieldArray({
		control: form.control,
		name: "strategicAreas",
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
			// Optionally reset form or redirect user
			// form.reset(); // Consider if resetting is desired after successful update
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
							{strategicAreaFields.map((areaField, areaIndex) => (
								<Card key={areaField.id} className="mb-6 border border-gray-300 dark:border-gray-700">
									<CardHeader className="flex flex-row items-center justify-between bg-gray-50 dark:bg-gray-800 p-4">
										<CardTitle className="text-md">Área Estratégica {areaIndex + 1}</CardTitle>
										<Button
											type="button"
											variant="destructive"
											size="sm"
											onClick={() => removeStrategicArea(areaIndex)}
										>
											<Trash2 className="h-4 w-4 mr-1" /> Eliminar Área
										</Button>
									</CardHeader>
									<CardContent className="p-4 space-y-4">
										<FormField
											control={form.control}
											name={`strategicAreas.${areaIndex}.name`}
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

										{/* Strategic Objective (nested within Area) */}
										<Card className="border border-blue-300 dark:border-blue-700">
											<CardHeader className="bg-blue-50 dark:bg-blue-900 p-3">
												<CardTitle className="text-sm">Objetivo Estratégico</CardTitle>
											</CardHeader>
											<CardContent className="p-4 space-y-4">
												<FormField
													control={form.control}
													name={`strategicAreas.${areaIndex}.strategicObjective.description`}
													render={({ field }) => (
														<FormItem>
															<FormLabel>Descripción del Objetivo</FormLabel>
															<FormControl>
																<Input placeholder="Ingrese la descripción del objetivo" {...field} />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>

												{/* Strategies (nested within Objective) */}
												<StrategiesArray control={form.control} areaIndex={areaIndex} />

											</CardContent>
										</Card>
									</CardContent>
								</Card>
							))}
							<Button
								type="button"
								variant="outline"
								onClick={() => appendStrategicArea({
									name: '',
									strategicObjective: {
										description: '',
										strategies: [],
									},
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
	const { fields, append, remove } = useFieldArray({
		control,
		name: `strategicAreas.${areaIndex}.strategicObjective.strategies`,
	});

	return (
		<div className="space-y-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
			<h4 className="text-md font-semibold mb-2">Estrategias</h4>
			{fields.map((strategyField, strategyIndex) => (
				<Card key={strategyField.id} className="mb-4 border border-green-300 dark:border-green-700">
					<CardHeader className="flex flex-row items-center justify-between bg-green-50 dark:bg-green-900 p-2">
						<CardTitle className="text-sm">Estrategia {strategyIndex + 1}</CardTitle>
						<Button
							type="button"
							variant="destructive"
							onClick={() => remove(strategyIndex)}
						>
							<Trash2 className="h-3 w-3" /> {/* Smaller icon */}
						</Button>
					</CardHeader>
					<CardContent className="p-3 space-y-3">
						<FormField
							control={control}
							name={`strategicAreas.${areaIndex}.strategicObjective.strategies.${strategyIndex}.description`}
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
								name={`strategicAreas.${areaIndex}.strategicObjective.strategies.${strategyIndex}.completionPercentage`}
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
								name={`strategicAreas.${areaIndex}.strategicObjective.strategies.${strategyIndex}.assignedBudget`}
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
								name={`strategicAreas.${areaIndex}.strategicObjective.strategies.${strategyIndex}.executedBudget`}
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
						<InterventionsArray control={control} areaIndex={areaIndex} strategyIndex={strategyIndex} />
					</CardContent>
				</Card>
			))}
			<Button
				type="button"
				variant="outline"
				size="sm"
				onClick={() => append({
					description: '',
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
	const { fields, append, remove } = useFieldArray({
		control,
		name: `strategicAreas.${areaIndex}.strategicObjective.strategies.${strategyIndex}.interventions`,
	});

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
							onClick={() => remove(interventionIndex)}
						>
							<Trash2 className="h-3 w-3" />
						</Button>
					</CardHeader>
					<CardContent className="p-2">
						<FormField
							control={control}
							name={`strategicAreas.${areaIndex}.strategicObjective.strategies.${strategyIndex}.interventions.${interventionIndex}.name`}
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