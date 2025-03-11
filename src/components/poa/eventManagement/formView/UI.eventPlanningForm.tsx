"use client"
import { Controller } from "react-hook-form"
import { useContext, useState } from "react"

// Components
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

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
    } = useContext(EventPlanningFormContext)

    const onSubmit = async () => {
        try {
            // Usar la función del contexto que ahora incluye los mensajes toast
            await handleFormSubmit(poaId, onEventSaved, onClose)
        } catch (error) {
            // Si hay errores de validación, mostrar el modal
            if (formErrors.hasErrors) {
                setShowValidationErrors(true)
            }
        }
    }

    const phases = [
        {
            number: 1,
            name: "Selección de Evento",
            hasError: formErrors.phaseErrors?.pei || false,
        },
        {
            number: 2,
            name: "Gestión de Gastos",
            hasError: formErrors.phaseErrors?.info || false,
        },
        {
            number: 3,
            name: "Fechas de Ejecución",
            hasError: formErrors.phaseErrors?.finance || false,
        },
    ]

    // Get current phase based on active tab
    const getCurrentPhase = (tab: string) => {
        switch (tab) {
            case "pei":
                return 1
            case "info":
                return 2
            case "finance":
                return 3
            default:
                return 1
        }
    }

    const [activeTab, setActiveTab] = useState("pei")

    const handlePhaseClick = (phase: number) => {
        switch (phase) {
            case 1:
                setActiveTab("pei")
                break
            case 2:
                setActiveTab("info")
                break
            case 3:
                setActiveTab("finance")
                break
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
                    <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
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
                                <ScrollArea className="h-[calc(90vh-12rem)] px-6">
                                    <div className="px-6 pb-6">
                                        <TabsContent value="pei" className="mt-4 space-y-6 data-[state=inactive]:hidden">
                                            <StrategicObjectiveSelector
                                                selectedObjetive={selectedStrategicObjective!}
                                                onSelectObjetive={(objective) => setSelectedStrategicObjective(objective)}
                                                addStrategicObjective={addStrategicObjective}
                                            />
                                            <AreaEstrategicaComponent
                                                areaEstrategica={selectedStrategicArea?.name || ""}
                                                error={errors?.areaEstrategica?.message}
                                            />
                                            <EstrategiasSelectorComponent
                                                selectedEstrategias={selectedStrategies || []}
                                                onSelectEstrategia={(estrategias) => setSelectedStrategies(estrategias)}
                                                strategicObjectiveIds={selectedStrategicObjective?.strategicObjectiveId}
                                                disabled={!selectedStrategicObjective}
                                            />
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
                                                {formErrors.errorList.find(e => e.field === "interventions") && <FieldError message={formErrors.errorList.find(e => e.field === "interventions")?.message} />}
                                            </div>
                                            <div className="space-y-2">
                                                <OdsSelector
                                                    selected={watch("ods") || []}
                                                    onSelect={(ods) => appendODS(ods)}
                                                    onRemove={(odsId) => removeODS(fieldsODS.findIndex((field) => field.ods === odsId))}
                                                />
                                                {formErrors.errorList.find(e => e.field === "ods") && <FieldError message={formErrors.errorList.find(e => e.field === "ods")?.message} />}
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="info" className="mt-4 space-y-6 data-[state=inactive]:hidden">
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

                                            <div className="space-y-2">
                                                <EventNameComponent value={watch("name") || ""} onChange={(value) => setValue("name", value)} />
                                                {formErrors.errorList.find(e => e.field === "name") && <FieldError message={formErrors.errorList.find(e => e.field === "name")?.message} />}
                                            </div>

                                            <div className="space-y-2">
                                                <ObjectiveComponent
                                                    value={watch("objective") || ""}
                                                    onChange={(value) => setValue("objective", value)}
                                                />
                                                {formErrors.errorList.find(e => e.field === "objective") && <FieldError message={formErrors.errorList.find(e => e.field === "objective")?.message} />}
                                            </div>

                                            <div className="space-y-2">
                                                <ResponsibleComponent
                                                    responsible={watch("responsibles") || []}
                                                    onAppendResponsible={(responsible) => appendResponible(responsible)}
                                                    onUpdateResponsible={(index, responsible) => updateResponsible(index, responsible)}
                                                />
                                                {formErrors.errorList.find(e => e.field === "responsibles") && <FieldError message={formErrors.errorList.find(e => e.field === "responsibles")?.message} />}
                                            </div>

                                            <div className="space-y-2">
                                                <Controller
                                                    name="achievementIndicator"
                                                    control={control}
                                                    defaultValue=""
                                                    render={({ field }) => (
                                                        <IndicadorLogroComponent value={field.value} onChange={(value) => field.onChange(value)} />
                                                    )}
                                                />
                                                {formErrors.errorList.find(e => e.field === "achievementIndicator") && <FieldError message={formErrors.errorList.find(e => e.field === "achievementIndicator")?.message} />}
                                            </div>

                                            <div className="p-4 bg-gray-50 rounded-lg border">
                                                <h3 className="text-md font-semibold text-gray-800">Documentos del Proceso del evento</h3>
                                            </div>
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
                                        </TabsContent>

                                        <TabsContent value="finance" className="mt-4 space-y-6 data-[state=inactive]:hidden">
                                            <div className="space-y-2">
                                                <div className="p-4 bg-gray-50 rounded-lg border">
                                                    <label className="text-sm font-medium text-gray-700">Costo Total</label>
                                                    <div className="mt-1 text-2xl font-bold text-primary">
                                                        Q {(watch("totalCost") || 0).toFixed(2)}
                                                    </div>
                                                </div>
                                                {formErrors.errorList.find(e => e.field === "totalCost") && <FieldError message={formErrors.errorList.find(e => e.field === "totalCost")?.message} />}
                                            </div>

                                            <div className="space-y-2">
                                                <FinancingSource
                                                    contributions={fieldsFinancings}
                                                    onAppendContribution={(contribution) => appendFinancing(contribution)}
                                                    onRemoveContribution={(index) => removeFinancing(index)}
                                                    onUpdateContribution={(index, contribution) => updateFinancing(index, contribution)}
                                                    onTotalCost={(totalCost) => setValue("totalCost", totalCost)}
                                                    isUMES={true}
                                                />
                                                <FinancingSource
                                                    contributions={fieldsFinancings}
                                                    onAppendContribution={(contribution) => appendFinancing(contribution)}
                                                    onRemoveContribution={(index) => removeFinancing(index)}
                                                    onUpdateContribution={(index, contribution) => updateFinancing(index, contribution)}
                                                    onTotalCost={(totalCost) => setValue("totalCost", totalCost)}
                                                    isUMES={false}
                                                />
                                                {formErrors.errorList.find(e => e.field === "financings") && <FieldError message={formErrors.errorList.find(e => e.field === "financings")?.message} />}
                                            </div>

                                            <div className="space-y-2">
                                                <Controller
                                                    name="purchaseTypeId"
                                                    control={control}
                                                    defaultValue={undefined}
                                                    render={({ field }) => (
                                                        <PurchaseType selectedTipo={field.value} onSelectTipo={(tipo) => field.onChange(tipo)} />
                                                    )}
                                                />
                                                {formErrors.errorList.find(e => e.field === "purchaseTypeId") && <FieldError message={formErrors.errorList.find(e => e.field === "purchaseTypeId")?.message} />}
                                            </div>

                                            <Controller
                                                name="costDetailDocuments"
                                                control={control}
                                                defaultValue={[]}
                                                render={({ field }) => (
                                                    <EventCostDetail files={field.value || []} onFilesChange={(files) => field.onChange(files)} />
                                                )}
                                            />
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
                                            {formErrors.errorList.find(e => e.field === "campusId") && <FieldError message={formErrors.errorList.find(e => e.field === "campusId")?.message} />}

                                            <div className="space-y-2">
                                                <RecursosSelectorComponent
                                                    selectedResource={watch("resources") || []}
                                                    onAppendResource={(resource) => {
                                                        appendResource(resource)
                                                    }}
                                                    onRemoveResource={(index) => {
                                                        removeResource(index)
                                                    }}
                                                />
                                                {formErrors.errorList.find(e => e.field === "resources") && <FieldError message={formErrors.errorList.find(e => e.field === "resources")?.message} />}
                                            </div>
                                        </TabsContent>
                                    </div>
                                </ScrollArea>
                            </div>
                        </Tabs>
                    </form>

                    <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 flex-shrink-0 sticky bottom-0">
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