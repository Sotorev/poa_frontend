"use client"
import { Controller } from "react-hook-form"
import { useContext } from "react"

// Components
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

// Custom Components
import { AreaEstrategicaComponent } from "../fields/area-estrategica"
import { StrategicObjectiveSelector } from "../fields/objetivos-estrategicos-selector"
import { EstrategiasSelectorComponent } from "../fields/estrategias-selector"
import { IntervencionesSelectorComponent } from "../fields/intervenciones-selector"
import { OdsSelector } from "../fields/ods-selector"
import { ActivityProjectSelector } from "../fields/actividad-proyecto-selector"
import { EventNameComponent } from "../fields/evento"
import { ObjectiveComponent } from "../fields/objetivo"
import { FinancingSource } from "../fields/financing-source"
import { PurchaseType } from "../fields/purchase-type"
import { CostDetailFile } from "../fields/costDetailFile"
import { CampusSelector } from "../fields/campus-selector"
import { ResponsibleComponent } from "../fields/responsables"
import { RecursosSelectorComponent } from "../fields/recursos-selector"
import { IndicadorLogroComponent } from "../fields/indicador-logro"
import { ProcessDetailFile } from "../fields/processDetailFile"
import { ValidationErrorsModal } from "./UI.validationErrorsModal"
import { FieldError } from "./field-error"
import { PhaseIndicator } from "./phase-indicator"
import { ProposeAreaObjectiveStrategicDialog } from "@/components/approveProposals/AreaOjectiveStrategic/UI.AreaObjectiveStrategic"

// Context
import { EventPlanningFormContext } from "./context.eventPlanningForm"
import { EventContext } from "../context.event"
import { PlusIcon } from "lucide-react"
import { useAreaObjectiveStrategicApproval } from "@/components/approveProposals/AreaOjectiveStrategic/useAreaObjectiveStrategicApproval"
interface EventPlanningFormProps {
}

// Section Title Component for consistent styling
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <div className="mb-4">
        <h3 className="text-lg font-semibold text-primary">{children}</h3>
        <Separator className="mt-2" />
    </div>
)

export function EventPlanningForm({
}: EventPlanningFormProps) {
    // Context
    const {
        fieldsInterventions,
        appendIntervention,
        removeIntervention,
        fieldsODS,
        appendODS,
        removeODS,
        appendDate,
        updateDate,
        removeDate,
        replaceDates,
        appendResponible,
        updateResponsible,
        appendFinancing,
        removeFinancing,
        updateFinancing,
        appendResource,
        removeResource,
        watch,
        setValue,
        control,
        handleSubmit,
        reset,
        errors,
        isSubmitting,
        formErrors,
        showValidationErrors,
        setShowValidationErrors,
        handleFormSubmit,
        activeTab,
        setActiveTab,
        phases,
        handlePhaseClick,
        getCurrentPhase,
        scrollContainerRef,
    } = useContext(EventPlanningFormContext)

    const {
        isOpen,
        setIsOpen,
        poaId,
        selectedStrategicArea,
        selectedStrategicObjective,
        setSelectedStrategicObjective,
        selectedStrategies,
        setSelectedStrategies,
        eventEditing,
        isProposeDialogOpen,
        setIsProposeDialogOpen,
    } = useContext(EventContext)

    const { handleAddProposal } = useAreaObjectiveStrategicApproval()

    const onSubmit = async () => {
        try {
            await handleFormSubmit(poaId || undefined)
        } catch (error) {
            if (formErrors.hasErrors) {
                setShowValidationErrors(true)
            }
        }
    }

    return (
        <>
            <ValidationErrorsModal
                isOpen={showValidationErrors}
                onClose={() => setShowValidationErrors(false)}
                errors={formErrors}
            />

            <ProposeAreaObjectiveStrategicDialog 
                isOpen={isProposeDialogOpen}
                onClose={() => setIsProposeDialogOpen(false)}
                onPropose={handleAddProposal}
            />

            <Dialog open={isOpen} onOpenChange={() => setIsOpen(false)}>
                <DialogContent
                    className="max-w-4xl p-0 flex flex-col overflow-hidden"
                    style={{
                        height: "min(90vh, 900px)",
                        marginTop: "1rem",
                        marginBottom: "1rem",
                    }}
                >
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            reset()                          
                            setIsOpen(false);
                        }}
                        className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 disabled:pointer-events-none z-50"
                    >
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                        </svg>
                        <span className="sr-only">Cerrar</span>
                    </button>

                    <DialogHeader className="px-6 py-4 border-b flex-shrink-0 z-20">
                        <DialogTitle>{eventEditing ? "Editar Evento" : "Crear Nuevo Evento"}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
                        <Tabs defaultValue="pei" className="flex flex-col flex-1" value={activeTab} onValueChange={setActiveTab}>
                            <div className="h-24 px-6 py-2 border-b flex-shrink-0 bg-white sticky top-0 z-10">
                                <PhaseIndicator
                                    phases={phases}
                                    currentPhase={getCurrentPhase(activeTab)}
                                    onPhaseClick={handlePhaseClick}
                                />
                            </div>

                            <TabsList className="sr-only">
                                <TabsTrigger value="pei">Plan Estratégico Institucional</TabsTrigger>
                                <TabsTrigger value="info">Información del Evento</TabsTrigger>
                                <TabsTrigger value="finance">Financiamiento del Evento</TabsTrigger>
                            </TabsList>

                            <div className="flex-1 overflow-hidden">
                                <ScrollArea ref={scrollContainerRef} className="h-80 w-full px-12">
                                    <TabsContent value="pei" className="mt-6 space-y-8 data-[state=inactive]:hidden">
                                        <div className="space-y-6">
                                            <SectionTitle>Objetivo Estratégico</SectionTitle>
                                            <div className="flex flex-row gap-4 justify-between">
                                                <StrategicObjectiveSelector
                                                    selectedObjetive={selectedStrategicObjective!}
                                                    onSelectObjetive={(objective) => setSelectedStrategicObjective(objective)}
                                                />
                                                <Button variant="outline" className="justify-end" onClick={() => setIsProposeDialogOpen(true)}>
                                                    <PlusIcon className="w-4 h-4" />
                                                    <span>Proponer Objetivo Estratégico</span>
                                                </Button>
                                            </div>
                                            <AreaEstrategicaComponent
                                                areaEstrategica={selectedStrategicArea?.name || ""}
                                                error={errors?.areaEstrategica?.message}
                                            />
                                        </div>

                                        <div className="space-y-6">
                                            <SectionTitle>Estrategias</SectionTitle>
                                            <EstrategiasSelectorComponent
                                                selectedEstrategias={selectedStrategies || []}
                                                onSelectEstrategia={(estrategias) => setSelectedStrategies(estrategias)}
                                                strategicObjectiveIds={selectedStrategicObjective?.strategicObjectiveId}
                                                disabled={!selectedStrategicObjective}
                                            />
                                        </div>

                                        <div className="space-y-6">
                                            <SectionTitle>Intervenciones</SectionTitle>
                                            <div className="space-y-2">
                                                <IntervencionesSelectorComponent
                                                    selectedIntervenciones={watch("interventions") || []}
                                                    onSelectIntervencion={(interventionId) => appendIntervention(interventionId)}
                                                    onRemove={(interventionId) =>
                                                        removeIntervention(
                                                            fieldsInterventions.findIndex((field) => field.intervention === interventionId),
                                                        )
                                                    }
                                                    disabled={!selectedStrategies?.length}
                                                    strategyIds={selectedStrategies?.map((est) => est.strategyId) || []}
                                                />
                                                {formErrors.errorList.find((e) => e.field === "interventions") && (
                                                    <FieldError
                                                        message={formErrors.errorList.find((e) => e.field === "interventions")?.message}
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <SectionTitle>Objetivos de Desarrollo Sostenible</SectionTitle>
                                            <div className="space-y-2">
                                                <OdsSelector
                                                    selected={watch("ods") || []}
                                                    onSelect={(ods) => appendODS(ods)}
                                                    onRemove={(odsId) => removeODS(fieldsODS.findIndex((field) => field.ods === odsId))}
                                                />
                                                {formErrors.errorList.find((e) => e.field === "ods") && (
                                                    <FieldError message={formErrors.errorList.find((e) => e.field === "ods")?.message} />
                                                )}
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="info" className="mt-6 space-y-8 data-[state=inactive]:hidden">
                                        <div className="space-y-6">
                                            <SectionTitle>Tipo de Evento</SectionTitle>
                                            <Controller
                                                name="type"
                                                control={control}
                                                defaultValue="Actividad"
                                                render={({ field }) => (
                                                    <ActivityProjectSelector
                                                        selectedOption={field.value}
                                                        onSelectOption={(option) => field.onChange(option)}
                                                        dates={watch("dates") || []}
                                                        defaultDate={new Date(new Date().getFullYear() + 1, 0, 1)}
                                                        onReplaceDates={(dates) => replaceDates(dates)}
                                                        onAppendDate={(date) => appendDate(date)}
                                                        onChangeDate={(index, date) => updateDate(index, date)}
                                                        onRemoveDate={(index) => removeDate(index)}
                                                    />
                                                )}
                                            />
                                        </div>

                                        <div className="space-y-6">
                                            <SectionTitle>Información General</SectionTitle>
                                            <div className="space-y-4">
                                                <div className="space-y-2 w-full px-2">
                                                    <EventNameComponent
                                                        value={watch("name") || ""}
                                                        onChange={(value) => setValue("name", value)}
                                                    />
                                                    {formErrors.errorList.find((e) => e.field === "name") && (
                                                        <FieldError message={formErrors.errorList.find((e) => e.field === "name")?.message} />
                                                    )}
                                                </div>

                                                <div className="space-y-2 w-full px-2">
                                                    <ObjectiveComponent
                                                        value={watch("objective") || ""}
                                                        onChange={(value) => setValue("objective", value)}
                                                    />
                                                    {formErrors.errorList.find((e) => e.field === "objective") && (
                                                        <FieldError message={formErrors.errorList.find((e) => e.field === "objective")?.message} />
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <SectionTitle>Responsables</SectionTitle>
                                            <div className="space-y-2 w-full px-2">
                                                <ResponsibleComponent
                                                    responsible={watch("responsibles") || []}
                                                    onAppendResponsible={(responsible) => appendResponible(responsible)}
                                                    onUpdateResponsible={(index, responsible) => updateResponsible(index, responsible)}
                                                />
                                                {formErrors.errorList.find((e) => e.field === "responsibles") && (
                                                    <FieldError message={formErrors.errorList.find((e) => e.field === "responsibles")?.message} />
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <SectionTitle>Indicador de Logro</SectionTitle>
                                            <div className="space-y-2 w-full px-2">
                                                <Controller
                                                    name="achievementIndicator"
                                                    control={control}
                                                    defaultValue=""
                                                    render={({ field }) => (
                                                        <IndicadorLogroComponent value={field.value} onChange={(value) => field.onChange(value)} />
                                                    )}
                                                />
                                                {formErrors.errorList.find((e) => e.field === "achievementIndicator") && (
                                                    <FieldError
                                                        message={formErrors.errorList.find((e) => e.field === "achievementIndicator")?.message}
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-6 w-full px-2">
                                            <SectionTitle>Documentos del Proceso</SectionTitle>
                                            <Controller
                                                name="processDocuments"
                                                control={control}
                                                defaultValue={[]}
                                                render={({ field }) => (
                                                    <ProcessDetailFile
                                                        files={(field.value || [])}
                                                        onFilesChange={(files) => field.onChange(files)}
                                                    />
                                                )}
                                            />
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="finance" className="mt-6 space-y-8 data-[state=inactive]:hidden">
                                        <div className="space-y-6">
                                            <SectionTitle>Costo total</SectionTitle>
                                            <div className="mt-1 text-2xl font-bold text-primary">
                                                Q {(watch("totalCost") || 0).toFixed(2)}
                                            </div>
                                            {formErrors.errorList.find((e) => e.field === "totalCost") && (
                                                <FieldError message={formErrors.errorList.find((e) => e.field === "totalCost")?.message} />
                                            )}
                                        </div>

                                        <div className="space-y-6">
                                            <SectionTitle>Financiamiento UMES</SectionTitle>
                                            <FinancingSource
                                                contributions={watch("financings") || []}
                                                onAppendContribution={(contribution) => appendFinancing(contribution)}
                                                onRemoveContribution={(index) => removeFinancing(index)}
                                                onUpdateContribution={(index, contribution) => updateFinancing(index, contribution)}
                                                onTotalCost={(totalCost) => setValue("totalCost", totalCost)}
                                                isUMES={true}
                                            />
                                        </div>

                                        <div className="space-y-6">
                                            <SectionTitle>Financiamiento Externo</SectionTitle>
                                            <FinancingSource
                                                contributions={watch("financings") || []}
                                                onAppendContribution={(contribution) => appendFinancing(contribution)}
                                                onRemoveContribution={(index) => removeFinancing(index)}
                                                onUpdateContribution={(index, contribution) => updateFinancing(index, contribution)}
                                                onTotalCost={(totalCost) => setValue("totalCost", totalCost)}
                                                isUMES={false}
                                            />
                                            {formErrors.errorList.find((e) => e.field === "financings") && (
                                                <FieldError message={formErrors.errorList.find((e) => e.field === "financings")?.message} />
                                            )}
                                        </div>

                                        <div className="space-y-6 w-full px-2">
                                            <SectionTitle>Tipo de Compra</SectionTitle>
                                            <div className="space-y-2 w-full px-2">
                                                <Controller
                                                    name="purchaseTypeId"
                                                    control={control}
                                                    defaultValue={undefined}
                                                    render={({ field }) => (
                                                        <PurchaseType selectedTipo={field.value} onSelectTipo={(tipo) => field.onChange(tipo)} />
                                                    )}
                                                />
                                                {formErrors.errorList.find((e) => e.field === "purchaseTypeId") && (
                                                    <FieldError
                                                        message={formErrors.errorList.find((e) => e.field === "purchaseTypeId")?.message}
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-6 w-full px-2">
                                            <SectionTitle>Documentos de Detalle de Costos</SectionTitle>
                                            <Controller
                                                name="costDetailDocuments"
                                                control={control}
                                                defaultValue={[]}
                                                render={({ field }) => (
                                                    <CostDetailFile 
                                                        files={(field.value || [])} 
                                                        onFilesChange={(files) => field.onChange(files)} 
                                                    />
                                                )}
                                            />
                                        </div>

                                        <div className="space-y-6 w-full px-2">
                                            <SectionTitle>Campus</SectionTitle>
                                            <Controller
                                                name="campusId"
                                                control={control}
                                                defaultValue={undefined}
                                                render={({ field }) => (
                                                    <CampusSelector
                                                        selectedCampusId={field.value}
                                                        onSelectCampus={(campusId) => field.onChange(campusId)}
                                                    />
                                                )}
                                            />
                                            {formErrors.errorList.find((e) => e.field === "campusId") && (
                                                <FieldError message={formErrors.errorList.find((e) => e.field === "campusId")?.message} />
                                            )}
                                        </div>

                                        <div className="space-y-6 w-full px-2">
                                            <SectionTitle>Recursos</SectionTitle>
                                            <div className="space-y-2 w-full px-2">
                                                <RecursosSelectorComponent
                                                    selectedResource={watch("resources") || []}
                                                    onAppendResource={(resource) => {
                                                        appendResource(resource)
                                                    }}
                                                    onRemoveResource={(index) => {
                                                        removeResource(index)
                                                    }}
                                                />
                                                {formErrors.errorList.find((e) => e.field === "resources") && (
                                                    <FieldError message={formErrors.errorList.find((e) => e.field === "resources")?.message} />
                                                )}
                                            </div>
                                        </div>
                                    </TabsContent>
                                </ScrollArea>
                            </div>
                        </Tabs>
                    </form>

                    <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 flex-shrink-0 sticky bottom-0 z-20">
                        <Button variant="outline" onClick={() => { 
                            reset(); 
                            setIsOpen(false); 
                        }} disabled={isSubmitting}>
                            Cancelar
                        </Button>
                        <Button onClick={() => {
                            onSubmit(); 
                        }} disabled={isSubmitting}>
                            {isSubmitting ? "Guardando..." : "Guardar"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

