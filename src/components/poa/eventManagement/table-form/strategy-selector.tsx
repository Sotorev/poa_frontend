// src/components/poa/components/columns/strategy-selector.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef, useContext } from 'react';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';

// hooks
import { useCurrentUser } from '@/hooks/use-current-user';

// Context
import { EventContext } from '../context.event';

// Types
import { Strategy } from '@/types/Strategy';

interface StrategySelectorProps {
	selectedStrategies: Strategy[];
	onSelectStrategies: (strategies: Strategy[]) => void;
	strategicObjectiveId: number | undefined;
	disabled?: boolean;
}

export function StrategySelector({
	selectedStrategies,
	onSelectStrategies,
	strategicObjectiveId,
	disabled = false,
}: StrategySelectorProps) {
	const [availableStrategies, setAvailableStrategies] = useState<Strategy[]>([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [isOpen, setIsOpen] = useState(false);
	const searchInputRef = useRef<HTMLInputElement>(null);
	const user = useCurrentUser();
	const { strategics } = useContext(EventContext);

	const fetchData = useCallback(async () => {
		try {
			if (!strategicObjectiveId) {
				setAvailableStrategies([]);
				return;
			}
			const filteredData = strategics.filter(strategy => strategy.strategicAreaId === strategicObjectiveId);
			setAvailableStrategies(filteredData);

		} catch (error) {
			console.error('Error fetching strategies:', error);
		}
	}, [strategicObjectiveId, strategics]);

	useEffect(() => {
		if (!disabled) {
			fetchData();
		} else {
			setAvailableStrategies([]);
		}
	}, [strategicObjectiveId, user?.token, disabled, fetchData]);

	const filteredStrategiesToDisplay = useMemo(() => {
		return availableStrategies.filter((strategy) =>
			strategy.description.toLowerCase().includes(searchTerm.toLowerCase())
		);
	}, [availableStrategies, searchTerm]);

	const handleSelectStrategy = (strategyId: string) => {
		if (disabled) return;
		const strategy = availableStrategies.find(s => s.strategyId.toString() === strategyId);
		if (!strategy) return;

		const updatedStrategies = selectedStrategies.some(s => s.strategyId.toString() === strategyId)
			? selectedStrategies.filter(s => s.strategyId.toString() !== strategyId)
			: [...selectedStrategies, strategy];

		onSelectStrategies(updatedStrategies);
	};

	const handleRemoveStrategy = (id: string) => {
		if (disabled) return;
		const updatedStrategies = selectedStrategies.filter(s =>
			s.strategyId.toString() !== id
		);
		onSelectStrategies(updatedStrategies);
	};

	useEffect(() => {
		if (isOpen && searchInputRef.current) {
			searchInputRef.current.focus();
		}
	}, [isOpen]);

	return (
		<TooltipProvider>
			<Tooltip open={disabled ? undefined : false}>
				<TooltipTrigger asChild>
					<div>
						<div className="space-y-2 w-full max-w-md">
							<div className="flex flex-wrap gap-2 mb-2 min-h-[28px]">
								{selectedStrategies.map((strategy) => {
									return (
										<Badge key={strategy.strategyId} variant="secondary" className="bg-primary/10 text-primary p-0 flex items-center">
											<span className="text-primary font-bold text-xs mr-1">
												{strategy.strategyId}
											</span>
											<Button
												variant="ghost"
												size="sm"
												className="h-5 w-5 p-0 text-primary hover:text-primary hover:bg-primary/10"
												onClick={() => handleRemoveStrategy(strategy.strategyId.toString())}
												disabled={disabled}
											>
												<X className="h-3 w-3" />
											</Button>
										</Badge>
									);
								})}
							</div>

							<Select
								onValueChange={handleSelectStrategy}
								open={isOpen}
								onOpenChange={(open) => {
									setIsOpen(open);
									if (!open) {
										setSearchTerm("");
									}
								}}
								value=""
								disabled={disabled}
							>
								<SelectTrigger className="w-[300px] border-primary focus:outline-none focus:ring-0 focus:ring-primary focus:border-primary">
									<SelectValue placeholder="Selecciona estrategias" />
								</SelectTrigger>
								<SelectContent>
									<div className="flex items-center px-3 pb-2 sticky top-0 bg-white z-10">
										<Search className="mr-2 h-4 w-4 shrink-0 text-gray-500" />
										<Input
											ref={searchInputRef}
											placeholder="Buscar estrategia..."
											className="h-8 w-full bg-transparent focus:outline-none focus:ring-0 focus:border-primary border-primary"
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
											disabled={disabled}
										/>
									</div>
									<ScrollArea className="h-[200px]">
										<SelectGroup>
											{filteredStrategiesToDisplay.length === 0 && !disabled && (
												<div className="text-center text-sm text-gray-500 py-2">
													No hay estrategias disponibles para el objetivo seleccionado.
												</div>
											)}
											{filteredStrategiesToDisplay.map((strategy) => (
												<SelectItem
													key={strategy.strategyId}
													value={strategy.strategyId.toString()}
													onSelect={(e) => e.preventDefault()}
													className="flex items-start py-2 px-3 cursor-pointer hover:bg-primary/10"
												>
													<div className="flex items-start w-full" onClick={() => handleSelectStrategy(strategy.strategyId.toString())}>
														<Checkbox
															checked={selectedStrategies.some(s => s.strategyId.toString() === strategy.strategyId.toString())}
															className="mr-2 mt-1 h-4 w-4 rounded border-primary text-primary focus:ring-primary"
															disabled={disabled}
														/>
														<div className="flex-shrink-0 w-6 h-6 rounded bg-primary text-white font-bold flex items-center justify-center mr-2">
															{strategy.strategyId}
														</div>
														<TooltipProvider>
															<Tooltip>
																<TooltipTrigger asChild>
																	<div className="flex-grow">
																		<p className="text-sm leading-tight truncate">{strategy.description}</p>
																	</div>
																</TooltipTrigger>
																<TooltipContent>
																	<p>{strategy.description}</p>
																</TooltipContent>
															</Tooltip>
														</TooltipProvider>
													</div>
												</SelectItem>
											))}
										</SelectGroup>
									</ScrollArea>
								</SelectContent>
							</Select>
						</div>
					</div>
				</TooltipTrigger>
				{disabled && <TooltipContent><p>{"Seleccione primero un objetivo estratégico."}</p></TooltipContent>}
			</Tooltip>
		</TooltipProvider>
	);
}
