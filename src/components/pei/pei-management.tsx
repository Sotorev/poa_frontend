"use client";

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
	ArrowDown
} from 'lucide-react';
import { PEI, Strategy } from '@/types/pei';
import { v4 as uuidv4 } from 'uuid';

const steps = ['Detalles del PEI', 'Áreas y Objetivos Estratégicos', 'Estrategias', 'Revisión'];

export default function PeiRegistrationForm({ onSubmit }: { onSubmit: (pei: PEI) => void }) {
	const [currentStep, setCurrentStep] = useState(0);
	const [pei, setPei] = useState<PEI>({
		name: '',
		status: 'Active',
		strategicareas: []
	});

	const handlePeiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setPei(prev => ({ ...prev, [name]: value }));
	};

	const handleStatusChange = (value: 'Active' | 'Inactive') => {
		setPei(prev => ({ ...prev, status: value }));
	};

	const addStrategicPair = () => {
		const tempId = uuidv4();

		setPei(prev => ({
			...prev,
			strategicareas: [
				...prev.strategicareas,
				{
					tempId,
					name: '',
					strategicobjective: {
						tempId: uuidv4(),
						description: '',
						strategies: []
					}
				}
			]
		}));
	};

	const updateStrategicPair = (index: number, field: 'area' | 'objective', value: string) => {
		setPei(prev => {
			const newAreas = [...prev.strategicareas];
			if (field === 'area') {
				newAreas[index].name = value;
			} else {
				newAreas[index].strategicobjective.description = value;
			}
			return { ...prev, strategicareas: newAreas };
		});
	};

	const removeStrategicPair = (index: number) => {
		setPei(prev => ({
			...prev,
			strategicareas: prev.strategicareas.filter((_, i) => i !== index)
		}));
	};

	const moveStrategicPair = (index: number, direction: 'up' | 'down') => {
		setPei(prev => {
			const newAreas = [...prev.strategicareas];
			if (direction === 'up' && index > 0) {
				[newAreas[index - 1], newAreas[index]] = [newAreas[index], newAreas[index - 1]];
			} else if (direction === 'down' && index < newAreas.length - 1) {
				[newAreas[index], newAreas[index + 1]] = [newAreas[index + 1], newAreas[index]];
			}
			return { ...prev, strategicareas: newAreas };
		});
	};

	const addStrategy = (areaIndex: number) => {
		const newStrategy = {
			description: '',
			completionPercentage: 0,
			assignedBudget: 0,
			executedBudget: 0
		};

		setPei(prev => {
			const newAreas = [...prev.strategicareas];
			newAreas[areaIndex] = {
				...newAreas[areaIndex],
				strategicobjective: {
					...newAreas[areaIndex].strategicobjective,
					strategies: [...newAreas[areaIndex].strategicobjective.strategies, newStrategy]
				}
			};
			return { ...prev, strategicareas: newAreas };
		});
	};

	const updateStrategy = (
		areaIndex: number,
		strategyIndex: number,
		field: keyof Strategy,
		value: string | number
	) => {
		setPei(prev => {
			const newAreas = [...prev.strategicareas];
			const strategies = newAreas[areaIndex].strategicobjective.strategies;
			strategies[strategyIndex] = { ...strategies[strategyIndex], [field]: value };
			return { ...prev, strategicareas: newAreas };
		});
	};

	const removeStrategy = (areaIndex: number, strategyIndex: number) => {
		setPei(prev => {
			const newAreas = [...prev.strategicareas];
			newAreas[areaIndex].strategicobjective.strategies =
				newAreas[areaIndex].strategicobjective.strategies.filter((_, i) => i !== strategyIndex);
			return { ...prev, strategicareas: newAreas };
		});
	};

	const handleNext = () => {
		if (currentStep < steps.length - 1) {
			setCurrentStep(currentStep + 1);
		} else {
			// Antes de enviar, eliminamos los tempId
			const peiToSubmit: PEI = {
				...pei,
				strategicareas: pei.strategicareas.map(area => ({
					strategicAreaId: area.strategicAreaId,
					name: area.name,
					strategicobjective: {
						strategicObjectiveId: area.strategicobjective.strategicObjectiveId,
						description: area.strategicobjective.description,
						strategies: area.strategicobjective.strategies.map(strategy => ({
							strategyId: strategy.strategyId,
							description: strategy.description,
							completionPercentage: strategy.completionPercentage,
							assignedBudget: strategy.assignedBudget,
							executedBudget: strategy.executedBudget
						}))
					}
				}))
			};
			onSubmit(peiToSubmit);
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
						<div>
							<Label>Estado</Label>
							<RadioGroup value={pei.status} onValueChange={handleStatusChange}>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="Active" id="active" />
									<Label htmlFor="active">Activo</Label>
								</div>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="Inactive" id="inactive" />
									<Label htmlFor="inactive">Inactivo</Label>
								</div>
							</RadioGroup>
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
								{pei.strategicareas.map((area, index) => (
									<TableRow key={area.tempId || index}>
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
													disabled={index === pei.strategicareas.length - 1}
												>
													<ArrowDown className="h-4 w-4" />
												</Button>
											</div>
										</TableCell>
										<TableCell>
											<Input
												value={area.name}
												onChange={(e) => updateStrategicPair(index, 'area', e.target.value)}
												placeholder={`Ingrese Área Estratégica ${index + 1}`}
											/>
										</TableCell>
										<TableCell>
											<Input
												value={area.strategicobjective.description}
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
						{pei.strategicareas.map((area, areaIndex) => (
							<Card key={area.tempId || areaIndex} className="mb-4">
								<CardHeader>
									<CardTitle>{area.name}</CardTitle>
									<CardDescription>{area.strategicobjective.description}</CardDescription>
								</CardHeader>
								<CardContent>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Estrategia</TableHead>
												<TableHead>% de Cumplimiento</TableHead>
												<TableHead>Presupuesto Asignado</TableHead>
												<TableHead>Presupuesto Ejecutado</TableHead>
												<TableHead>Acciones</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{area.strategicobjective.strategies.map((strategy, strategyIndex) => (
												<TableRow key={strategy.tempId || strategyIndex}>
													<TableCell>
														<Input
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
									<strong>Estado:</strong> {pei.status === 'Active' ? 'Activo' : 'Inactivo'}
								</p>
							</CardContent>
						</Card>
						{pei.strategicareas.map((area, areaIndex) => (
							<Card key={area.tempId || areaIndex}>
								<CardHeader>
									<CardTitle>{area.name}</CardTitle>
								</CardHeader>
								<CardContent>
									<p>
										<strong>Objetivo:</strong> {area.strategicobjective.description}
									</p>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Estrategia</TableHead>
												<TableHead>% de Cumplimiento</TableHead>
												<TableHead>Presupuesto Asignado</TableHead>
												<TableHead>Presupuesto Ejecutado</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{area.strategicobjective.strategies.map((strategy, strategyIndex) => (
												<TableRow key={strategy.tempId || strategyIndex}>
													<TableCell>{strategy.description}</TableCell>
													<TableCell>{strategy.completionPercentage}%</TableCell>
													<TableCell>${strategy.assignedBudget}</TableCell>
													<TableCell>${strategy.executedBudget}</TableCell>
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
		<Card className="w-full max-w-4xl mx-auto">
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
					disabled={currentStep === 0}
				>
					<ChevronLeft className="mr-2 h-4 w-4" /> Atrás
				</Button>
				<Button
					type="button"
					onClick={handleNext}
					disabled={
						(currentStep === 0 && !pei.name) ||
						(currentStep === 1 &&
							pei.strategicareas.some(
								area => !area.name || !area.strategicobjective.description
							))
					}
				>
					{currentStep === steps.length - 1 ? 'Enviar' : 'Siguiente'}{' '}
					<ChevronRight className="ml-2 h-4 w-4" />
				</Button>
			</CardFooter>
		</Card>
	);
}