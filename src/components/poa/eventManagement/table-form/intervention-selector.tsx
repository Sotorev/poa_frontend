// src/components/poa/components/columns/intervenciones-selector.tsx
// Renamed to intervention-selector.tsx

'use client';

// Libraries
import React, { useState, useEffect, useMemo, useRef, useContext, useCallback } from 'react';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from "@/components/ui/button";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';

// Types
import { Intervention } from '@/types/Intervention';

// Context
import { EventContext } from '../context.event';

interface InterventionSelectorProps {
	selectedInterventions: number[];
	onSelect: (interventionId: number) => void;
	onRemove: (interventionId: number) => void;
	disabled?: boolean;
	disabledTooltipMessage?: string;
	strategyIds: number[];
}

export function InterventionSelector({
	selectedInterventions,
	onSelect,
	onRemove,
	disabled = false,
	disabledTooltipMessage = "Please select at least one strategy first.",
	strategyIds,
}: InterventionSelectorProps) {
	const [availableInterventions, setAvailableInterventions] = useState<Intervention[]>([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [isOpen, setIsOpen] = useState(false);
	const searchInputRef = useRef<HTMLInputElement>(null);

	const { interventions } = useContext(EventContext);

	const loadAvailableInterventions = useCallback(async () => {
		try {
			const filtered = interventions.filter(
				(intervention) => !intervention.isDeleted && strategyIds.includes(intervention.strategyId)
			);
			setAvailableInterventions(filtered);
		} catch (error) {
			console.error("Error loading interventions:", error);
		}
	}, [interventions, strategyIds]);

	useEffect(() => {
		if (!disabled && strategyIds.length > 0) {
			loadAvailableInterventions();
		} else {
			setAvailableInterventions([]);
		}
	}, [disabled, strategyIds, interventions, loadAvailableInterventions]);

	const filteredListOfInterventions = useMemo(() => {
		return availableInterventions.filter((intervention) =>
			intervention.name.toLowerCase().includes(searchTerm.toLowerCase())
		);
	}, [availableInterventions, searchTerm]);

	const toggleSelection = (interventionId: number) => {
		if (disabled) return;
		if (selectedInterventions.includes(interventionId)) {
			onRemove(interventionId);
		} else {
			onSelect(interventionId);
		}
	};

	const handleRemoveItem = (interventionId: number, event: React.MouseEvent) => {
		event.stopPropagation();
		if (disabled) return;
		onRemove(interventionId);
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
						<div className="space-y-2">
							<div className="flex flex-wrap gap-2 mb-2 min-h-[28px]">
								{selectedInterventions.map((interventionId) => {
									const interventionDetails = availableInterventions.find(
										(int) => int.interventionId === interventionId
									);
									// Fallback if details not found in currently availableInterventions (e.g. if strategy changed)
									const displayDetails = interventionDetails || interventions.find(int => int.interventionId === interventionId);

									if (!displayDetails) return null;
									return (
										<Badge
											key={interventionId}
											variant="secondary"
											className={`bg-primary/10 text-primary flex items-center ${disabled ? "opacity-50 cursor-not-allowed" : ""
												}`}
										>
											{displayDetails.isCustom ? `E${displayDetails.interventionId}` : displayDetails.interventionId}
											<Button
												variant="ghost"
												size="sm"
												className="ml-1 h-4 w-4 p-0 text-primary hover:text-primary hover:bg-primary/10"
												onClick={(event) => handleRemoveItem(interventionId, event)}
												aria-label={`Remove ${displayDetails.name}`}
												disabled={disabled}
											>
												<X className="h-3 w-3" />
											</Button>
										</Badge>
									);
								})}
							</div>

							<Select
								open={isOpen}
								onOpenChange={(openState) => {
									setIsOpen(openState);
									if(!openState) setSearchTerm('');
								}}
								disabled={disabled}
								onValueChange={(val) => toggleSelection(Number(val))}
								value='' // Reset value to allow re-selection of the same item if needed, handled by toggleSelection
							>
								<SelectTrigger className="w-[300px] border border-primary focus:outline-none focus:ring-0 focus:ring-primary focus:border-primary">
									<SelectValue placeholder="Select interventions" />
								</SelectTrigger>
								<SelectContent>
									<div className="flex items-center px-3 pb-2 sticky top-0 bg-white z-10">
										<Search className="mr-2 h-4 w-4 shrink-0 text-gray-500" />
										<Input
											ref={searchInputRef}
											placeholder="Search intervention..."
											className="h-8 w-full bg-transparent focus:outline-none focus:ring-0 focus:border-primary border-primary"
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
											disabled={disabled}
										/>
									</div>
									<ScrollArea className="h-[200px]">
										<SelectGroup>
											{filteredListOfInterventions.length === 0 && !disabled && (
												<div className="text-center text-sm text-gray-500 py-2">
													No interventions available for the selected strategies or search term.
												</div>
											)}
											{filteredListOfInterventions.map((intervention) => (
												<SelectItem
													key={intervention.interventionId}
													value={intervention.interventionId.toString()}
													className="focus:bg-primary/10 focus:text-primary hover:bg-primary/10"
													onSelect={(e) => e.preventDefault()} // Prevent closing on select, toggleSelection handles it
												>
													<div className="flex items-center" onClick={() => toggleSelection(intervention.interventionId)}>
														<Checkbox
															checked={selectedInterventions.includes(intervention.interventionId)}
															className="mr-2 h-4 w-4 rounded border-primary text-primary focus:ring-primary"
															disabled={disabled}
														/>
														<div
															className={`w-6 h-6 rounded-sm mr-2 flex items-center justify-center text-white text-xs font-bold ${intervention.isCustom ? "bg-primary" : "bg-primary"
																}`}
														>
															{intervention.isCustom ? `E${intervention.interventionId}` : intervention.interventionId}
														</div>
														{intervention.name}
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
				{disabled && (
					<TooltipContent>
						<p>{disabledTooltipMessage}</p>
					</TooltipContent>
				)}
			</Tooltip>
		</TooltipProvider>
	);
}
