import { UseFormReturn, Controller } from 'react-hook-form';
import { z } from 'zod';
import { createFullEventSchema } from '@/schemas/event-schema';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { TrashIcon, PlusCircledIcon } from '@radix-ui/react-icons';
import { EventDates } from './event-dates';
import { EventResponsibles } from './event-responsibles';
import { DocumentUpload } from './document-upload';
import { TableCell, TableRow } from '@/components/ui/table';
import { EventContext } from '../context.event';
import { useContext, useState } from 'react';
import { CampusSelector } from './campus-selector';
import { PurchaseType } from './purchase-type';
import { OdsField } from './ods-field';
import { ResourceSelector } from './event-resources';
import { EventFinancings } from './event-financings';
import { StrategicObjectiveSelector } from './strategic-objective';
import { StrategySelector } from './strategy-selector';
import { InterventionSelector } from './intervention-selector';
import { ProposeAreaObjectiveStrategicDialog } from '@/components/approveProposals/AreaOjectiveStrategic/UI.AreaObjectiveStrategic';
import { useAreaObjectiveStrategicApproval } from '@/components/approveProposals/AreaOjectiveStrategic/useAreaObjectiveStrategicApproval';
import { ProposeStrategyDialog } from '@/components/approveProposals/strategies/UI.strategyPropose';
import { useStrategyProposals } from '@/components/approveProposals/strategies/useStrategyProposals';

type FormSchema = z.infer<typeof createFullEventSchema>;

interface EventRowProps {
	form: UseFormReturn<FormSchema>;
	index: number;
	onRemove?: () => void;
	onCostDetailFilesChange?: (files: File[]) => void;
	onProcessFilesChange?: (files: File[]) => void;
	documentUploadResetKey?: number;
}


export function EventRow({
	form,
	index,
	onRemove,
	onCostDetailFilesChange,
	onProcessFilesChange,
	documentUploadResetKey
}: EventRowProps) {
	const {
		campuses,
		strategicObjectives,
		strategicAreas
	} = useContext(EventContext)
	const [isProposeDialogStrategicObjectiveOpen, setIsProposeDialogStrategicObjectiveOpen] = useState(false);
	const { handleAddProposal: handleAddStrategicObjectiveProposal, loading: isLoadingStrategicObjectiveProposal } = useAreaObjectiveStrategicApproval();
	const [isProposeStrategyDialogOpen, setIsProposeStrategyDialogOpen] = useState(false);
	const { handleAddStrategy, loading: isLoadingStrategyProposal } = useStrategyProposals();

	return (
		<TableRow className="border-b hover:bg-slate-50">
			{/* Name */}
			<TableCell className="p-2 border-r">
				<FormField
					control={form.control}
					name={`name`}
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Textarea
									placeholder="Nombre del evento"
									className="min-h-[80px] resize-y"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</TableCell>

			{/* Achievement Indicator */}
			<TableCell className="p-2 border-r min-w-[200px]">
				<FormField
					control={form.control}
					name={`achievementIndicator`}
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Textarea
									placeholder="Indicador de logro"
									className="min-h-[80px] resize-y"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</TableCell>

			{/* Event Objective */}
			<TableCell className="p-2 border-r min-w-[200px]">
				<FormField
					control={form.control}
					name={`objective`}
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Textarea
									placeholder="Objetivo del evento"
									className="min-h-[80px] resize-y"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</TableCell>

			{/* Strategic Objective */}
			<TableCell className="p-2 border-r min-w-[200px]">
				<Controller
					name={`strategicObjectiveId`}
					control={form.control}
					defaultValue={undefined}
					render={({ field, fieldState: { error } }) => (
						<FormItem>
							<FormControl>
								<StrategicObjectiveSelector
									selectedObjetive={strategicObjectives?.find((so) => so.strategicObjectiveId === field.value)}
									onSelectObjetive={(strategicObjective) => field.onChange(strategicObjective.strategicObjectiveId)}
								/>
							</FormControl>
							{error && <FormMessage>{error.message}</FormMessage>}
							<Button type="button" variant="outline" size="sm" className="mt-2 w-full" onClick={() => setIsProposeDialogStrategicObjectiveOpen(true)}>
								<PlusCircledIcon className="mr-2 h-4 w-4" />
								Proponer Nuevo Objetivo Estratégico
							</Button>
						</FormItem>
					)}
				/>
				<ProposeAreaObjectiveStrategicDialog
					isOpen={isProposeDialogStrategicObjectiveOpen}
					onClose={() => setIsProposeDialogStrategicObjectiveOpen(false)}
					onPropose={async (data) => {
						await handleAddStrategicObjectiveProposal(data);
						// TODO: Optionally, refresh strategic objectives list here or show a success message
						setIsProposeDialogStrategicObjectiveOpen(false);
					}}
				/>
			</TableCell>
			{/* Strategies */}
			<TableCell className="p-2 border-r min-w-[300px]">
				<Controller
					name={`strategies` as any}
					control={form.control}
					defaultValue={[]}
					render={({ field, fieldState: { error } }) => {
						const currentSelectedObjectiveId = form.watch("strategicObjectiveId");
						const typedStrategies = Array.isArray(field.value) ? field.value : [];

						return (
							<FormItem>
								<FormControl>
									<div className="space-y-2">
										<StrategySelector
											selectedStrategies={typedStrategies}
											onSelectStrategies={(strategies) => field.onChange(strategies)}
											strategicObjectiveId={currentSelectedObjectiveId}
											disabled={!currentSelectedObjectiveId}
										/>
										{error && <FormMessage>{error.message}</FormMessage>}
									</div>
								</FormControl>
								<Button type="button" variant="outline" size="sm" className="mt-2 w-full" onClick={() => setIsProposeStrategyDialogOpen(true)} disabled={!currentSelectedObjectiveId}>
									<PlusCircledIcon className="mr-2 h-4 w-4" />
									Proponer Nueva Estrategia
								</Button>
							</FormItem>
						);
					}}
				/>
				<ProposeStrategyDialog
					isOpen={isProposeStrategyDialogOpen}
					onClose={() => setIsProposeStrategyDialogOpen(false)}
					onPropose={async (data) => {
						await handleAddStrategy(data);
						// TODO: Optionally, refresh strategies list here or show a success message
						setIsProposeStrategyDialogOpen(false);
					}}
					strategicAreas={strategicAreas || []}
				/>
			</TableCell>

			{/* Interventions */}
			<TableCell className="p-2 border-r min-w-[300px]">
				<Controller
					name={`interventions`}
					control={form.control}
					defaultValue={[] as number[]}
					render={({ field, fieldState: { error } }) => {
						const selectedStrategies = form.watch("strategies" as any);
						const strategyIds = Array.isArray(selectedStrategies) ? selectedStrategies.map(s => s.strategyId) : [];
						const currentInterventions: number[] = Array.isArray(field.value) ? field.value.map(Number).filter(id => !isNaN(id)) : [];

						return (
							<FormItem>
								<FormControl>
									<InterventionSelector
										selectedInterventions={currentInterventions}
										onSelect={(interventionIdToAdd) => {
											if (!currentInterventions.includes(interventionIdToAdd)) {
												field.onChange([...currentInterventions, interventionIdToAdd]);
											}
										}}
										onRemove={(interventionIdToRemove) => {
											field.onChange(
												currentInterventions.filter(id => id !== interventionIdToRemove)
											);
										}}
										strategyIds={strategyIds}
										disabled={!strategyIds || strategyIds.length === 0}
										disabledTooltipMessage="Please select at least one strategy first to see available interventions."
									/>
								</FormControl>
								{error && <FormMessage>{error.message}</FormMessage>}
							</FormItem>
						);
					}}
				/>
			</TableCell>

			{/* ODS */}
			<TableCell className="p-2 border-r">
				<Controller
					name={`ods`}
					control={form.control}
					rules={{ validate: (value: any) => (Array.isArray(value) && value.length > 0) || "Debe seleccionar al menos un ODS" }}
					defaultValue={[] as number[]}
					render={({ field, fieldState: { error } }) => {
						const currentOds: number[] = Array.isArray(field.value) ? field.value.map(Number).filter(id => !isNaN(id)) : [];
						return (
							<OdsField
								selected={currentOds}
								onSelect={(odsIdToAdd) => {
									if (!currentOds.includes(odsIdToAdd)) {
										field.onChange([...currentOds, odsIdToAdd]);
									}
								}}
								onRemove={(odsIdToRemove) => {
									field.onChange(currentOds.filter((id) => id !== odsIdToRemove));
								}}
								error={error?.message}
							/>
						);
					}}
				/>
			</TableCell>

			{/* Dates */}
			<TableCell className="p-2 border-r">
				<FormField
					control={form.control}
					name="dates"
					render={({ field }) => (
						<FormItem>
							<EventDates form={form} />
							<FormMessage />
						</FormItem>
					)}
				/>
			</TableCell>

			{/* Responsibles */}
			<TableCell className="p-2 border-r">
				<EventResponsibles form={form} />
			</TableCell>

			{/* Campus */}
			<TableCell className="p-2 w-full border-r">
				<FormField
					control={form.control}
					name={`campusId`}
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<CampusSelector
									selectedCampusId={(field.value === 0 ? undefined : field.value) as any}
									onSelectCampus={(campusId) => field.onChange(campusId)}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</TableCell>





			{/* Purchase Type */}
			<TableCell className="p-2 border-r">
				<Controller
					name={`purchaseTypeId`}
					control={form.control}
					render={({ field, fieldState: { error } }) => (
						<FormItem>
							<FormControl>
								<PurchaseType
									selectedPurchaseTypeId={field.value === undefined ? null : field.value}
									onSelectPurchaseType={(id) => field.onChange(id)}
								/>
							</FormControl>
							{error && <FormMessage>{error.message}</FormMessage>}
						</FormItem>
					)}
				/>
			</TableCell>

			{/* Financings */}
			<TableCell className="p-2 border-r">
				<EventFinancings form={form} />
			</TableCell>

			{/* Total Cost */}
			<TableCell className="p-2 border-r min-w-[120px]">
				<FormField
					control={form.control}
					name={`totalCost`}
					render={({ field }) => {
						const displayTotalCost = typeof field.value === 'number' ? field.value : 0;
						return (
							<FormItem>
								<FormControl>
									<p className="text-sm font-medium p-2 h-9 flex items-center">
										Q {displayTotalCost.toFixed(2)}
									</p>
								</FormControl>
							</FormItem>
						);
					}}
				/>
			</TableCell>



			{/* Resources */}
			<TableCell className="p-2 border-r">
				<Controller
					name={`resources` as any}
					control={form.control}
					defaultValue={[]}
					render={({ field, fieldState: { error } }) => {
						const currentResourcesTyped: Array<{ resourceId: number;[key: string]: any }> = Array.isArray(field.value) ? field.value : [];
						return (
							<FormItem>
								<FormControl>
									<ResourceSelector
										selectedResources={currentResourcesTyped}
										onAppendResource={(resourceToAdd: { resourceId: number }) => {
											if (!currentResourcesTyped.some(r => r.resourceId === resourceToAdd.resourceId)) {
												field.onChange([...currentResourcesTyped, resourceToAdd]);
											}
										}}
										onRemoveResource={(resourceIdToRemove: number) => {
											field.onChange(
												currentResourcesTyped.filter(r => r.resourceId !== resourceIdToRemove)
											);
										}}
									/>
								</FormControl>
								{error && <FormMessage>{error.message}</FormMessage>}
							</FormItem>
						);
					}}
				/>
			</TableCell>

			{/* Cost Detail Documents */}
			<TableCell className="p-2 border-r">
				<DocumentUpload
					name="costDetailDocuments"
					maxFiles={10}
					label="Documentos de Costo"
					onFilesChange={onCostDetailFilesChange}
					resetKey={documentUploadResetKey}
				/>
			</TableCell>

			{/* Process Documents */}
			<TableCell className="p-2 border-r">
				<DocumentUpload
					name="processDocuments"
					maxFiles={10}
					label="Documentos de Proceso"
					onFilesChange={onProcessFilesChange}
					resetKey={documentUploadResetKey}
				/>
			</TableCell>

			{/* Actions */}
			<TableCell className="p-2">
				{onRemove && (
					<Button
						variant="ghost"
						size="icon"
						onClick={onRemove}
						className="text-red-500 hover:text-red-700 hover:bg-red-50"
					>
						<TrashIcon className="h-4 w-4" />
					</Button>
				)}
			</TableCell>
		</TableRow>
	);
} 