'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from "@/components/ui/table";
import {
	PlusCircle,
	Trash2,
	ChevronRight,
	ChevronLeft,
	ArrowUp,
	ArrowDown,
	Loader2
} from 'lucide-react';

import type { PEI, Strategy, Intervention } from '@/types/pei';
import { Textarea } from '../ui/textarea';

const steps = ['Detalles del PEI', 'Áreas y Objetivos Estratégicos', 'Estrategias e Intervenciones', 'Revisión'];

export default function Component({ onSubmit, isSubmitting }: { onSubmit: (pei: PEI) => void, isSubmitting: boolean }) {
	const [currentStep, setCurrentStep] = useState(0);
	const [pei, setPei] = useState<PEI>({
		name: '',
		status: 'Activo',
		strategicAreas: [],
		startYear: new Date().getFullYear(),
		endYear: new Date().getFullYear() + 1
	});

	const handlePeiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		// Convert value to number if the field is startYear or endYear
		const processedValue = (name === 'startYear' || name === 'endYear') ? Number(value) : value;
		setPei(prev => ({ ...prev, [name]: processedValue }));
	};

	const addStrategicPair = () => {

		setPei(prev => ({
			...prev,
			strategicAreas: [
				...prev.strategicAreas,
				{
					name: '',
					strategicObjective: {
						description: '',
						strategies: []
					}
				}
			]
		}));
	};

	const updateStrategicPair = (index: number, field: 'area' | 'objective', value: string) => {
		setPei(prev => {
			const newAreas = [...prev.strategicAreas];
			if (field === 'area') {
				newAreas[index].name = value;
			} else {
				newAreas[index].strategicObjective.description = value;
			}
			return { ...prev, strategicAreas: newAreas };
		});
	};

	const removeStrategicPair = (index: number) => {
		setPei(prev => ({
			...prev,
			strategicAreas: prev.strategicAreas.filter((_, i) => i !== index)
		}));
	};

	const moveStrategicPair = (index: number, direction: 'up' | 'down') => {
		setPei(prev => {
			const newAreas = [...prev.strategicAreas];
			if (direction === 'up' && index > 0) {
				[newAreas[index - 1], newAreas[index]] = [newAreas[index], newAreas[index - 1]];
			} else if (direction === 'down' && index < newAreas.length - 1) {
				[newAreas[index], newAreas[index + 1]] = [newAreas[index + 1], newAreas[index]];
			}
			return { ...prev, strategicAreas: newAreas };
		});
	};

	const addStrategy = (areaIndex: number) => {
		const newStrategy = {
			description: '',
			completionPercentage: 0,
			assignedBudget: 0,
			executedBudget: 0,
			interventions: []
		};

		setPei(prev => {
			const newAreas = [...prev.strategicAreas];
			newAreas[areaIndex] = {
				...newAreas[areaIndex],
				strategicObjective: {
					...newAreas[areaIndex].strategicObjective,
					strategies: [...(newAreas[areaIndex].strategicObjective.strategies || []), newStrategy]
				}
			};
			return { ...prev, strategicAreas: newAreas };
		});
	};

	const updateStrategy = (
		areaIndex: number,
		strategyIndex: number,
		field: keyof Strategy,
		value: string | number
	) => {
		setPei(prev => {
			const newAreas = [...prev.strategicAreas];
			const strategies = newAreas[areaIndex].strategicObjective.strategies || [];
			strategies[strategyIndex] = { ...strategies[strategyIndex], [field]: value };
			return { ...prev, strategicAreas: newAreas };
		});
	};

	const removeStrategy = (areaIndex: number, strategyIndex: number) => {
		setPei(prev => {
			const newAreas = [...prev.strategicAreas];
			newAreas[areaIndex].strategicObjective.strategies =
				newAreas[areaIndex].strategicObjective.strategies?.filter((_, i) => i !== strategyIndex);
			return { ...prev, strategicAreas: newAreas };
		});
	};

	const addIntervention = (areaIndex: number, strategyIndex: number) => {
		const newIntervention: Intervention = {
			name: ''
		};

		setPei(prev => {
			const newAreas = [...prev.strategicAreas];
			const strategies = newAreas[areaIndex].strategicObjective.strategies || [];
			const newStrategies = [...strategies];
			newStrategies[strategyIndex] = {
				...newStrategies[strategyIndex],
				interventions: [...(newStrategies[strategyIndex].interventions || []), newIntervention]
			};
			newAreas[areaIndex] = {
				...newAreas[areaIndex],
				strategicObjective: {
					...newAreas[areaIndex].strategicObjective,
					strategies: newStrategies
				}
			};
			return { ...prev, strategicAreas: newAreas };
		});
	};

	const updateIntervention = (
		areaIndex: number,
		strategyIndex: number,
		interventionIndex: number,
		value: string
	) => {
		setPei(prev => {
			const newAreas = [...prev.strategicAreas];
			const strategies = newAreas[areaIndex].strategicObjective.strategies || [];
			const newStrategies = [...strategies];
			const interventions = newStrategies[strategyIndex].interventions || [];
			const newInterventions = [...interventions];
			newInterventions[interventionIndex] = { ...newInterventions[interventionIndex], name: value };
			newStrategies[strategyIndex] = { ...newStrategies[strategyIndex], interventions: newInterventions };
			newAreas[areaIndex] = {
				...newAreas[areaIndex],
				strategicObjective: {
					...newAreas[areaIndex].strategicObjective,
					strategies: newStrategies
				}
			};
			return { ...prev, strategicAreas: newAreas };
		});
	};

	const removeIntervention = (areaIndex: number, strategyIndex: number, interventionIndex: number) => {
		setPei(prev => {
			const newAreas = [...prev.strategicAreas];
			const strategies = newAreas[areaIndex].strategicObjective.strategies || [];
			strategies[strategyIndex].interventions =
				strategies[strategyIndex].interventions?.filter((_, i) => i !== interventionIndex);
			return { ...prev, strategicAreas: newAreas };
		});
	};

	const handleNext = () => {
		if (currentStep < steps.length - 1) {
			setCurrentStep(currentStep + 1);
		} else {
			onSubmit(pei);
		}
	};

	const handleBack = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1);
		}
	};

	const renderStep = () => {
		switch (currentStep) {
			case 0:
				return (
					<div className="space-y-4">
						<div>
							<Label htmlFor="name">Nombre del PEI</Label>
							<Input
								id="name"
								name="name"
								value={pei.name}
								onChange={handlePeiChange}
								placeholder="Ingrese el nombre del PEI"
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label htmlFor="startYear">Año de inicio</Label>
								<Input
									id="startYear"
									name="startYear"
									type="number"
									value={pei.startYear}
									onChange={handlePeiChange}
									placeholder="Año de inicio"
									min={new Date().getFullYear()}
									max={9999}
								/>
							</div>
							<div>
								<Label htmlFor="endYear">Año de finalización</Label>
								<Input
									id="endYear"
									name="endYear"
									type="number"
									value={pei.endYear}
									onChange={handlePeiChange}
									placeholder="Año de finalización"
									min={pei.startYear ? pei.startYear + 1 : new Date().getFullYear() + 1}
									max={9999}
								/>
							</div>
						</div>
					</div>
				);
			case 1:
				return (
					<div className="space-y-4">
						<h3 className="text-lg font-semibold mb-4">Áreas y Objetivos Estratégicos</h3>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-[50px]">Orden</TableHead>
									<TableHead>Área Estratégica</TableHead>
									<TableHead>Objetivo Estratégico</TableHead>
									<TableHead className="w-[100px]">Acciones</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{pei.strategicAreas.map((area, index) => (
									<TableRow key={area.strategicAreaId || index}>
										<TableCell>
											<div className="flex flex-col items-center space-y-1">
												<Button
													variant="ghost"
													size="icon"
													onClick={() => moveStrategicPair(index, 'up')}
													disabled={index === 0}
												>
													<ArrowUp className="h-4 w-4" />
												</Button>
												<span>{index + 1}</span>
												<Button
													variant="ghost"
													size="icon"
													onClick={() => moveStrategicPair(index, 'down')}
													disabled={index === pei.strategicAreas.length - 1}
												>
													<ArrowDown className="h-4 w-4" />
												</Button>
											</div>
										</TableCell>
										<TableCell>
											<Textarea
												value={area.name}
												onChange={(e) => updateStrategicPair(index, 'area', e.target.value)}
												placeholder={`Ingrese Área Estratégica ${index + 1}`}
											/>
										</TableCell>
										<TableCell>
											<Textarea
												value={area.strategicObjective.description}
												onChange={(e) => updateStrategicPair(index, 'objective', e.target.value)}
												placeholder={`Ingrese Objetivo Estratégico ${index + 1}`}
											/>
										</TableCell>
										<TableCell>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => removeStrategicPair(index)}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
						<Button onClick={addStrategicPair} className="w-full mt-4">
							<PlusCircle className="mr-2 h-4 w-4" /> Agregar Área y Objetivo Estratégico
						</Button>
					</div>
				);
			case 2:
				return (
					<div className="space-y-4">
						{pei.strategicAreas.map((area, areaIndex) => (
							<Card key={area.strategicAreaId || areaIndex} className="mb-4">
								<CardHeader>
									<CardTitle>{area.name}</CardTitle>
									<CardDescription>{area.strategicObjective.description}</CardDescription>
								</CardHeader>
								<CardContent>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Estrategia</TableHead>
												<TableHead>% de Cumplimiento</TableHead>
												<TableHead>Presupuesto Asignado</TableHead>
												<TableHead>Presupuesto Ejecutado</TableHead>
												<TableHead>Intervenciones</TableHead>
												<TableHead>Acciones</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{area.strategicObjective.strategies?.map((strategy, strategyIndex) => (
												<TableRow key={strategy.strategyId || strategyIndex}>
													<TableCell>
														<Textarea
															value={strategy.description}
															onChange={(e) =>
																updateStrategy(areaIndex, strategyIndex, 'description', e.target.value)
															}
															placeholder={`Ingrese Estrategia ${strategyIndex + 1}`}
														/>
													</TableCell>
													<TableCell>
														<Input
															type="number"
															value={strategy.completionPercentage}
															onChange={(e) =>
																updateStrategy(
																	areaIndex,
																	strategyIndex,
																	'completionPercentage',
																	Number(e.target.value)
																)
															}
															placeholder="% de Cumplimiento"
														/>
													</TableCell>
													<TableCell>
														<Input
															type="number"
															value={strategy.assignedBudget}
															onChange={(e) =>
																updateStrategy(
																	areaIndex,
																	strategyIndex,
																	'assignedBudget',
																	Number(e.target.value)
																)
															}
															placeholder="Presupuesto Asignado"
														/>
													</TableCell>
													<TableCell>
														<Input
															type="number"
															value={strategy.executedBudget}
															onChange={(e) =>
																updateStrategy(
																	areaIndex,
																	strategyIndex,
																	'executedBudget',
																	Number(e.target.value)
																)
															}
															placeholder="Presupuesto Ejecutado"
														/>
													</TableCell>
													<TableCell>
														{strategy.interventions?.map((intervention, interventionIndex) => (
															<div key={intervention.interventionId || interventionIndex} className="flex items-center mb-2">
																<Input
																	value={intervention.name}
																	onChange={(e) =>
																		updateIntervention(areaIndex, strategyIndex, interventionIndex, e.target.value)
																	}
																	placeholder={`Intervención ${interventionIndex + 1}`}
																	className="mr-2"
																/>
																<Button
																	variant="ghost"
																	size="icon"
																	onClick={() => removeIntervention(areaIndex, strategyIndex, interventionIndex)}
																>
																	<Trash2 className="h-4 w-4" />
																</Button>
															</div>
														))}
														<Button onClick={() => addIntervention(areaIndex, strategyIndex)} size="sm">
															<PlusCircle className="mr-2 h-4 w-4" /> Agregar Intervención
														</Button>
													</TableCell>
													<TableCell>
														<Button
															variant="ghost"
															size="icon"
															onClick={() => removeStrategy(areaIndex, strategyIndex)}
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
									<Button onClick={() => addStrategy(areaIndex)} className="mt-4">
										<PlusCircle className="mr-2 h-4 w-4" /> Agregar Estrategia
									</Button>
								</CardContent>
							</Card>
						))}
					</div>
				);
			case 3:
				return (
					<div className="space-y-4">
						<h3 className="font-semibold text-lg">Revisión de Detalles del PEI</h3>
						<Card>
							<CardContent className="pt-6">
								<p>
									<strong>Nombre:</strong> {pei.name}
								</p>
								<p>
									<strong>Estado:</strong> {pei.status === 'Activo' ? 'Activo' : 'Inactivo'}
								</p>
								<p>
									<strong>Año de inicio:</strong> {pei.startYear}
								</p>
								<p>
									<strong>Año de finalización:</strong> {pei.endYear}
								</p>
							</CardContent>
						</Card>
						{pei.strategicAreas.map((area, areaIndex) => (
							<Card key={area.strategicAreaId || areaIndex}>
								<CardHeader>
									<CardTitle>{area.name}</CardTitle>
								</CardHeader>
								<CardContent>
									<p>
										<strong>Objetivo:</strong> {area.strategicObjective.description}
									</p>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Estrategia</TableHead>
												<TableHead>% de Cumplimiento</TableHead>
												<TableHead>Presupuesto Asignado</TableHead>
												<TableHead>Presupuesto Ejecutado</TableHead>
												<TableHead>Intervenciones</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{area.strategicObjective.strategies?.map((strategy, strategyIndex) => (
												<TableRow key={strategy.strategyId || strategyIndex}>
													<TableCell>{strategy.description}</TableCell>
													<TableCell>{strategy.completionPercentage}%</TableCell>
													<TableCell>${strategy.assignedBudget}</TableCell>
													<TableCell>${strategy.executedBudget}</TableCell>
													<TableCell>
														<ul>
															{strategy.interventions?.map((intervention, interventionIndex) => (
																<li key={intervention.interventionId || interventionIndex}>
																	{intervention.name}
																</li>
															))}
														</ul>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</CardContent>
							</Card>
						))}
					</div>
				);
			default:
				return null;
		}
	};

	return (
		<Card className="w-full max-w-6xl mx-auto ">
			<CardHeader>
				<CardTitle>Registro de PEI</CardTitle>
				<CardDescription>Crear un nuevo Plan Estratégico Institucional (PEI)</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="mb-6">
					<div className="flex justify-between mb-2">
						{steps.map((step, index) => (
							<div
								key={step}
								className={`text-sm font-medium ${index <= currentStep ? 'text-primary' : 'text-muted-foreground'
									}`}
							>
								{step}
							</div>
						))}
					</div>
					<div className="w-full bg-secondary h-2 rounded-full">
						<div
							className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
							style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
						></div>
					</div>
				</div>
				{renderStep()}
			</CardContent>
			<CardFooter className="flex justify-between">
				<Button
					type="button"
					variant="outline"
					onClick={handleBack}
					disabled={currentStep === 0 || isSubmitting}
				>
					<ChevronLeft className="mr-2 h-4 w-4" /> Atrás
				</Button>
				<Button
					type="button"
					onClick={handleNext}
					disabled={
						isSubmitting ||
						(currentStep === 0 && !pei.name) ||
						(currentStep === 1 &&
							pei.strategicAreas.some(
								area => !area.name || !area.strategicObjective.description
							))
					}
				>
					{isSubmitting ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Enviando...
						</>
					) : currentStep === steps.length - 1 ? (
						'Enviar'
					) : (
						<>
							Siguiente <ChevronRight className="ml-2 h-4 w-4" />
						</>
					)}
				</Button>
			</CardFooter>
		</Card>
	);
}