// src/components/poa/components/columns/campus-selector.tsx

import React, { useState, useContext, useRef, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EventContext } from '@/components/poa/eventManagement/context.event';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { cn } from '@/lib/utils';

interface CampusSelectorProps {
	onSelectCampus: (campusId: number) => void;
	selectedCampusId: number;
	form?: UseFormReturn<any>;
	name?: string;
	showError?: boolean;
}

export function CampusSelector({ onSelectCampus, selectedCampusId, form, name = 'campusId', showError = false }: CampusSelectorProps) {
	const [searchTerm, setSearchTerm] = useState('');
	const [isOpen, setIsOpen] = useState(false);
	const searchInputRef = useRef<HTMLInputElement>(null);

	const { campuses } = useContext(EventContext);

	const filteredCampuses = useMemo(() => {
		return campuses.filter(campus =>
			campus.name.toLowerCase().includes(searchTerm.toLowerCase())
		);
	}, [campuses, searchTerm]);

	// If form is provided, use FormField for validation
	if (form && showError) {
		return (
			<FormField
				control={form.control}
				name={name}
				render={({ field }) => (
					<FormItem>
						<Select 
							onValueChange={(value) => {
								const numValue = Number.parseInt(value);
								field.onChange(numValue);
								onSelectCampus(numValue);
							}} 
							value={selectedCampusId?.toString() || field.value?.toString()}
						>
							<FormControl>
								<SelectTrigger className={cn(
									"border-primary focus:outline-none focus:ring-0 focus:ring-primary focus:border-primary",
									form.formState.errors[name] && "border-destructive"
								)}>
									<SelectValue placeholder="Selecciona un campus" />
								</SelectTrigger>
							</FormControl>
							<SelectContent>
								<div className="flex items-center px-3 pb-2 sticky top-0 bg-white z-10">
									<Search className="mr-2 h-4 w-4 shrink-0 text-gray-500" />
									<Input
										ref={searchInputRef}
										placeholder="Buscar campus..."
										className="h-8 w-full border-primary bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
									/>
								</div>
								<ScrollArea className="h-[200px]">
									{filteredCampuses.map((campus) => (
										<SelectItem
											key={campus.campusId}
											value={campus.campusId.toString()}
											className="text-primary hover:bg-primary/10 focus:bg-primary/10"
										>
											{campus.name}
										</SelectItem>
									))}
								</ScrollArea>
							</SelectContent>
						</Select>
						<FormMessage />
					</FormItem>
				)}
			/>
		);
	}

	// Original implementation without form validation
	return (
		<Select onValueChange={(value) => onSelectCampus(Number.parseInt(value))} value={selectedCampusId?.toString()}>
			<SelectTrigger className="border-primary focus:outline-none focus:ring-0 focus:ring-primary focus:border-primary">
				<SelectValue placeholder="Selecciona un campus" />
			</SelectTrigger>
			<SelectContent>
				<div className="flex items-center px-3 pb-2 sticky top-0 bg-white z-10">
					<Search className="mr-2 h-4 w-4 shrink-0 text-gray-500" />
					<Input
						ref={searchInputRef}
						placeholder="Buscar campus..."
						className="h-8 w-full border-primary bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
				<ScrollArea className="h-[200px]">
					{filteredCampuses.map((campus) => (
						<SelectItem
							key={campus.campusId}
							value={campus.campusId.toString()}
							className="text-primary hover:bg-primary/10 focus:bg-primary/10"
						>
							{campus.name}
						</SelectItem>
					))}
				</ScrollArea>
			</SelectContent>
		</Select>
	);
}
