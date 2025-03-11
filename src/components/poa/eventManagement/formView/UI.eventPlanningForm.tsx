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
import { EventCostDetail } from "../fields/detalle"
import { CampusSelector } from "../fields/campus-selector"
import { ResponsibleComponent } from "../fields/responsables"
import { RecursosSelectorComponent } from "../fields/recursos-selector"
import { IndicadorLogroComponent } from "../fields/indicador-logro"
import { DetalleProcesoComponent } from "../fields/detalle-proceso"
import { ValidationErrorsModal } from "./UI.validationErrorsModal"
import { FieldError } from "./field-error"
import { PhaseIndicator } from "./phase-indicator"

// Types
import type { StrategicArea } from "@/types/StrategicArea"
import type { StrategicObjective } from "@/types/StrategicObjective"
import type { Strategy } from "@/types/Strategy"
import type { UpdateEventRequest } from "./schema.eventPlanningForm"
import type { ResponseFullEvent } from "./type.eventPlanningForm"

// Context
import { EventPlanningFormContext } from "./context.eventPlanningForm"

interface EventPlanningFormProps {
    isOpen: boolean
    onClose: () => void
    event?: UpdateEventRequest
    selectedStrategicArea: StrategicArea | undefined
    selectedStrategicObjective: StrategicObjective | undefined
    setSelectedStrategicObjective: (objective: StrategicObjective) => void
    selectedStrategies: Strategy[] | undefined
    setSelectedStrategies: (strategies: Strategy[]) => void
    poaId?: number
    onEventSaved?: (event: ResponseFullEvent) => void
    addStrategicObjective: (objective: any) => void
}

// Section Title Component for consistent styling
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <div className="mb-4">
        <h3 className="text-lg font-semibold text-primary">{children}</h3>
        <Separator className="mt-2" />
    </div>
)

export function EventPlanningForm({
    isOpen,
    onClose,
    event,
    selectedStrategicArea,
    selectedStrategicObjective,
    setSelectedStrategicObjective,
    selectedStrategies,
    setSelectedStrategies,
    poaId,
    onEventSaved,
    addStrategicObjective,
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
        fieldsFinancings,
        appendResource,
        removeResource,
        watch,
        setValue,
        control,
        handleSubmit,
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

    const onSubmit = async () => {
        try {
            await handleFormSubmit(poaId, onEventSaved, onClose)
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

            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent
                    className="max-w-4xl p-0 flex flex-col overflow-hidden"
                    style={{
                        height: "min(90vh, 900px)",
                        marginTop: "1rem",
                        marginBottom: "1rem",
                    }}
                >
                    <DialogHeader className="px-6 py-4 border-b flex-shrink-0 z-20">
                        <DialogTitle>{event ? "Editar Evento" : "Crear Nuevo Evento"}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
                        <Tabs defaultValue="pei" className="flex flex-col flex-1" value={activeTab} onValueChange={setActiveTab}>
                            <div className="px-6 py-2 border-b flex-shrink-0 bg-white sticky top-0 z-10">
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
                            <ScrollArea ref={scrollContainerRef} className="h-64 w-full px-12">
                                    <TabsContent value="pei" className="mt-6 space-y-8 data-[state=inactive]:hidden">
                                        <div className="space-y-6">
                                            <SectionTitle>Objetivo Estratégico</SectionTitle>
                                            <StrategicObjectiveSelector
                                                selectedObjetive={selectedStrategicObjective!}
                                                onSelectObjetive={(objective) => setSelectedStrategicObjective(objective)}
                                                addStrategicObjective={addStrategicObjective}
                                            />
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
                                                    <DetalleProcesoComponent
                                                        files={field.value || []}
                                                        onFilesChange={(files: File[]) => field.onChange(files)}
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
                                                contributions={fieldsFinancings}
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
                                                contributions={fieldsFinancings}
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
                                                    <EventCostDetail files={field.value || []} onFilesChange={(files) => field.onChange(files)} />
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
                        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Cancelar
                        </Button>
                        <Button onClick={() => onSubmit()} disabled={isSubmitting}>
                            {isSubmitting ? "Guardando..." : "Guardar"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

