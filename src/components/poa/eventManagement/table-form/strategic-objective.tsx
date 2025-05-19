// src/components/poa/components/columns/objetivos-estrategicos-selector.tsx
'use client';

import React, { useState, useMemo, useRef, useEffect, useContext } from "react";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Types
import { StrategicObjective } from "@/types/StrategicObjective";
interface StrategicObjectiveProps {
	selectedObjetive?: StrategicObjective;
	onSelectObjetive: (objetivo: StrategicObjective) => void;
	addStrategicObjective?: (objetivo: StrategicObjective) => void;
}

// Context
import { EventContext } from "../context.event";

interface ExtendedStrategicObjective extends StrategicObjective {
	number: number;
}

export function StrategicObjectiveSelector({ selectedObjetive, onSelectObjetive, addStrategicObjective }: StrategicObjectiveProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const [extendedStrategicObjective, setExtendedStrategicObjective] = useState<ExtendedStrategicObjective[]>([]);

	const { strategicObjectives, strategicAreas } = useContext(EventContext);
	const searchInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const extended = strategicObjectives.map((obj, index) => ({
			...obj,
			number: index + 1,
		}));
		setExtendedStrategicObjective(extended);
	}, [strategicObjectives]);

	const filteredObjetivos = useMemo(() => {
		return strategicObjectives.filter(obj =>
			obj.description.toLowerCase().includes(searchTerm.toLowerCase())
		);
	}, [strategicObjectives, searchTerm]);

	const handleSelectObjetivo = (value: string) => {
		const selected = strategicObjectives.find(obj => obj.strategicObjectiveId.toString() === value);
		if (selected) {
			onSelectObjetive(selected);
		}
	};

	useEffect(() => {
		if (isOpen && searchInputRef.current) {
			searchInputRef.current.focus();
		}
	}, [isOpen]);

	const selectedObjetivo = selectedObjetive;
	const selectedStrategicArea = useMemo(() => {
		if (selectedObjetivo && strategicAreas) {
			return strategicAreas.find(sa => sa.strategicAreaId === selectedObjetivo.strategicAreaId);
		}
		return null;
	}, [selectedObjetivo, strategicAreas]);

	return (
		<div className="space-y-2 w-full max-w-md">
			<Select
				onValueChange={handleSelectObjetivo}
				open={isOpen}
				onOpenChange={setIsOpen}
				value={selectedObjetive?.description || ""}
			>
				<SelectTrigger className="w-full border-primary focus:outline-none focus:ring-0 focus:ring-primary focus:border-primary">
					<SelectValue placeholder="Seleccionar objetivo">
						{/* selected objective */}
						{selectedObjetivo && (
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<div className="flex items-center w-full">
											<div className="flex-shrink-0 w-6 h-6 rounded bg-primary text-white font-bold flex items-center justify-center mr-2">
												{extendedStrategicObjective.find((o) => o.strategicObjectiveId === selectedObjetivo.strategicObjectiveId)?.number}
											</div>
											<span className="truncate flex-grow">{selectedObjetivo.description}</span>
										</div>
									</TooltipTrigger>
									<TooltipContent side="bottom" align="start" className="max-w-xs">
										<p>{selectedObjetivo.description}</p>
										{(() => {
											const area = strategicAreas.find(sa => sa.strategicAreaId === selectedObjetivo.strategicAreaId);
											return area ? <p className="text-xs text-muted-foreground mt-1">Área: {area.name}</p> : null;
										})()}
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						)}
					</SelectValue>
				</SelectTrigger>
				<SelectContent>
					<div className="flex items-center px-3 pb-2 sticky top-0 bg-white z-10">
						<Search className="mr-2 h-4 w-4 shrink-0 text-gray-500" />
						<Input
							ref={searchInputRef}
							placeholder="Buscar objetivo..."
							className="h-8 w-full bg-transparent focus:outline-none focus:ring-0 focus:border-primary border-primary"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
					{/* options to select */}
					<ScrollArea className="h-[200px]">
						<SelectGroup>
							{filteredObjetivos.map((obj) => (
								<SelectItem
									key={obj.strategicObjectiveId}
									value={obj.strategicObjectiveId.toString()}
									className="flex items-start py-2 px-3 cursor-pointer hover:bg-primary/10"
								>
									<div className="flex items-start w-[300px]">
										<div className={`flex-shrink-0 w-6 h-6 rounded ${selectedObjetive ? 'bg-primary' : 'bg-primary'
											} text-white font-bold flex items-center justify-center mr-2`}>
											{extendedStrategicObjective.find((o) => o.strategicObjectiveId === obj.strategicObjectiveId)?.number}
										</div>
										<div className="flex-grow">
											<p className="text-sm leading-tight">{obj.description}</p>
											{(() => {
												const area = strategicAreas.find(sa => sa.strategicAreaId === obj.strategicAreaId);
												return area ? <p className="text-xs text-muted-foreground">Área: {area.name}</p> : null;
											})()}
										</div>
									</div>
								</SelectItem>
							))}
						</SelectGroup>
					</ScrollArea>
				</SelectContent>
			</Select>
			{selectedStrategicArea && (
				<div className="mt-1 text-sm text-muted-foreground px-1">
					Área Estratégica: {selectedStrategicArea.name}
				</div>
			)}
		</div>
	);
}