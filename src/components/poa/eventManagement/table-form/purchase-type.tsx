// src/components/poa/components/columns/tipo-de-compra.tsx
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
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { PurchaseTypeWithColor } from '@/types/PurchaseType';
import { EventContext } from "../context.event";

interface PurchaseTypeSelectorProps {
	selectedPurchaseTypeId: number | null;
	onSelectPurchaseType: (id: number | null) => void;
}

const predefinedColors: string[] = [
	"#1E3A8A", "#3C1053", "#065F46", "#831843", "#713F12",
	"#1F2937", "#7C2D12", "#134E4A", "#4C1D95", "#701A75",
	"#064E3B", "#6B21A8", "#7E22CE", "#92400E", "#0F766E"
];

export function PurchaseType({ selectedPurchaseTypeId, onSelectPurchaseType }: PurchaseTypeSelectorProps) {
	const [purchaseTypesWithColor, setPurchaseTypesWithColor] = useState<PurchaseTypeWithColor[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const [isAddingNew, setIsAddingNew] = useState(false);
	const [newPurchaseTypeName, setNewPurchaseTypeName] = useState("");
	const searchInputRef = useRef<HTMLInputElement>(null);
	const newPurchaseTypeInputRef = useRef<HTMLInputElement>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const { purchaseTypes: purchaseTypesFromContext } = useContext(EventContext);

	// Función para asignar un color basado en el índice
	const getColorByIndex = (index: number): string => predefinedColors[index % predefinedColors.length];

	const loadPurchaseTypes = async () => {
		setLoading(true);
		try {
			const mappedPurchaseTypes: PurchaseTypeWithColor[] = purchaseTypesFromContext.map((type, index) => ({
				...type,
				color: getColorByIndex(index),
			}));
			setPurchaseTypesWithColor(mappedPurchaseTypes);
		} catch (err) {
			setError('No se pudieron cargar los tipos de compra.');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadPurchaseTypes();
	}, [purchaseTypesFromContext]);

	const filteredPurchaseTypes = useMemo(() => {
		return purchaseTypesWithColor.filter(type =>
			type.name.toLowerCase().includes(searchTerm.toLowerCase())
		);
	}, [purchaseTypesWithColor, searchTerm]);

	const handleSelectPurchaseTypeById = (typeIdString: string) => {
		const typeId = Number(typeIdString);
		onSelectPurchaseType(selectedPurchaseTypeId === typeId ? null : typeId);
		setIsOpen(false);
	};

	useEffect(() => {
		if (isOpen) {
			searchInputRef.current?.focus();
		}
	}, [isOpen]);

	useEffect(() => {
		if (isAddingNew && newPurchaseTypeInputRef.current) {
			newPurchaseTypeInputRef.current.focus();
		}
	}, [isAddingNew]);

	if (loading) return <div className="text-green-600">Cargando tipos de compra...</div>;
	if (error) return <div className="text-red-500">Error: {error}</div>;

	return (
		<div className="space-y-2">
			{/* Mostrar Tipo de Compra seleccionado */}
			{selectedPurchaseTypeId  && (
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Badge
								variant="secondary"
								className="flex items-center justify-between px-2 py-1 rounded-md text-xs font-bold"
								style={{ backgroundColor: purchaseTypesWithColor.find(t => t.purchaseTypeId === selectedPurchaseTypeId)?.color || '#808080', color: 'white' }}
							>
								<span className="flex items-center">
									{purchaseTypesWithColor.find(t => t.purchaseTypeId === selectedPurchaseTypeId)?.name}
								</span>
								<Button
									variant="ghost"
									size="sm"
									className="ml-1 h-4 w-4 p-0 text-white hover:text-gray-200"
									onClick={(e) => {
										e.stopPropagation();
										onSelectPurchaseType(null);
									}}
									aria-label={`Eliminar ${purchaseTypesWithColor.find(t => t.purchaseTypeId === selectedPurchaseTypeId)?.name}`}
								>
									<X className="h-3 w-3" />
								</Button>
							</Badge>
						</TooltipTrigger>
						<TooltipContent>
							<p>{purchaseTypesWithColor.find(t => t.purchaseTypeId === selectedPurchaseTypeId)?.name }</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			)}

			{/* Selector de Tipo de Compra */}
			<Select
				open={isOpen}
				onOpenChange={(openStatus) => {
					setIsOpen(openStatus);
					if (!openStatus) {
						setSearchTerm("");
					}
				}}
				onValueChange={handleSelectPurchaseTypeById}
				value={selectedPurchaseTypeId ? selectedPurchaseTypeId.toString() : undefined}
			>
				<SelectTrigger className="border-primary focus:outline-none focus:ring-0 focus:ring-primary focus:border-primary">
					<SelectValue placeholder="Selecciona tipos de compra" />
				</SelectTrigger>
				<SelectContent>
					<div className="flex items-center px-3 pb-2 sticky top-0 bg-white z-10">
						<Search className="mr-2 h-4 w-4 shrink-0 text-gray-500" />
						<Input
							ref={searchInputRef}
							placeholder="Buscar tipo de compra..."
							className="h-8 w-full border-primary bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							onBlur={(e) => {
								// Prevenir que el input pierda el foco
								e.preventDefault();
								e.target.focus();
							}}
						/>
					</div>
					<ScrollArea className="h-[200px]">
						<SelectGroup>
							{filteredPurchaseTypes.map((type) => (
								<SelectItem
									key={type.purchaseTypeId}
									value={type.purchaseTypeId.toString()}
									className="flex items-center hover:bg-gray-100 cursor-pointer"
								>
									<div className="flex items-center">
										<Checkbox
											checked={selectedPurchaseTypeId === type.purchaseTypeId}
											onCheckedChange={() => handleSelectPurchaseTypeById(type.purchaseTypeId.toString())}
											onClick={(e) => {
												e.stopPropagation();
												handleSelectPurchaseTypeById(type.purchaseTypeId.toString());
											}}
											className="mr-2 h-4 w-4 rounded border-green-300 text-green-600 focus:ring-green-500"
											style={{
												borderColor: type.color,
												backgroundColor: selectedPurchaseTypeId === type.purchaseTypeId ? type.color : 'transparent',
											}}
										/>
										{type.name}
									</div>
								</SelectItem>
							))}
						</SelectGroup>
					</ScrollArea>
				</SelectContent>
			</Select>

			{/* Mostrar errores de creación */}
			{error && (
				<span className="text-red-500 text-sm">{error}</span>
			)}
		</div>
	);
}
