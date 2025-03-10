// src/components/poa/eventManagement/formView/eventPlanningForm.tsx

// Libraries
import { DevTool } from "@hookform/devtools";
import { Controller } from 'react-hook-form';
import { useContext } from "react"

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
import { ActivityProjectSelector } from "../fields/actividad-proyecto-selector";
import { EventNameComponent } from "../fields/evento"
import { ObjectiveComponent } from "../fields/objetivo"
import { FinancingSource } from "../fields/financing-source";
import { PurchaseType } from "../fields/purchase-type"
import { EventCostDetail } from "../fields/detalle"
import { CampusSelector } from "../fields/campus-selector"
import { ResponsibleComponent } from "../fields/responsables"
import { RecursosSelectorComponent } from "../fields/recursos-selector"
import { IndicadorLogroComponent } from "../fields/indicador-logro"
import { DetalleProcesoComponent } from "../fields/detalle-proceso"

// Types
import { StrategicArea } from "@/types/StrategicArea"
import { StrategicObjective } from "@/types/StrategicObjective"
import { Strategy } from "@/types/Strategy"

// Context
import { EventPlanningFormContext } from "./eventPlanningForm.context"


interface EventPlanningFormProps {
    isOpen: boolean
    onClose: () => void
    event?: any
    updateField: (field: string, value: any) => void
    addStrategicObjective: (objective: any) => void
    selectedStrategicArea: StrategicArea | undefined
    selectedStrategicObjective: StrategicObjective | undefined
    setSelectedStrategicObjective: (objective: StrategicObjective) => void
    selectedStrategies: Strategy[] | undefined
    setSelectedStrategies: (strategies: Strategy[]) => void
}

export function EventPlanningForm({
    isOpen,
    onClose,
    event,
    updateField,
    addStrategicObjective,
    selectedStrategicArea,
    selectedStrategicObjective,
    setSelectedStrategicObjective,
    selectedStrategies,
    setSelectedStrategies,
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
        watch,
        setValue,
        control
    } = useContext(EventPlanningFormContext)

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle>{event ? "Editar Evento" : "Crear Nuevo Evento"}</DialogTitle>
                </DialogHeader>

                <>
                    <form>
                        <Tabs defaultValue="pei" className="w-full">
                            <TabsList className="px-6">
                                <TabsTrigger value="pei">Plan Estratégico Institucional</TabsTrigger>
                                <TabsTrigger value="info">Información del Evento</TabsTrigger>
                                <TabsTrigger value="finance">Financiamiento del Evento</TabsTrigger>
                            </TabsList>

                            <ScrollArea className="h-[calc(90vh-12rem)] px-6">
                                <TabsContent value="pei" className="mt-4 space-y-6">
                                    <StrategicObjectiveSelector
                                        selectedObjetive={selectedStrategicObjective!}
                                        onSelectObjetive={(objective) => setSelectedStrategicObjective(objective)}
                                        addStrategicObjective={addStrategicObjective}
                                    />
                                    <AreaEstrategicaComponent
                                        areaEstrategica={selectedStrategicArea?.name || ""}
                                        error={event?.errors?.areaEstrategica}
                                    />
                                    <EstrategiasSelectorComponent
                                        selectedEstrategias={selectedStrategies || []}
                                        onSelectEstrategia={(estrategias) => setSelectedStrategies(estrategias)}
                                        strategicObjectiveIds={selectedStrategicObjective?.strategicObjectiveId}
                                        disabled={!selectedStrategicObjective}
                                    />
                                    <IntervencionesSelectorComponent
                                        selectedIntervenciones={watch("interventions") || []}
                                        onSelectIntervencion={(interventionId) => appendIntervention(interventionId)}
                                        onRemove={(interventionId) => removeIntervention(fieldsInterventions.findIndex((field) => field.intervention === interventionId))}
                                        disabled={!selectedStrategies?.length}
                                        strategyIds={selectedStrategies?.map(est => est.strategyId) || []}
                                    />
                                    <OdsSelector
                                        selected={watch("ods") || []}
                                        onSelect={(ods) => appendODS(ods)}
                                        onRemove={(odsId) => removeODS(fieldsODS.findIndex((field) => field.ods === odsId))}
                                    />
                                </TabsContent>

                                <TabsContent value="info" className="mt-4 space-y-6">
                                    <Controller
                                        name="type"
                                        control={control}
                                        defaultValue="Actividad"
                                        render={({ field }) => (
                                            <ActivityProjectSelector
                                                selectedOption={field.value}
                                                onSelectOption={(option) => field.onChange(option)}
                                                dates={watch("dates") || []}
                                                defaultDate={new Date((new Date().getFullYear() + 1), 0, 1)}
                                                onReplaceDates={(dates) => replaceDates(dates)}
                                                onAppendDate={(date) => appendDate(date)}
                                                onChangeDate={(index, date) => updateDate(index, date)}
                                                onRemoveDate={(index) => removeDate(index)}
                                            />
                                        )}
                                    />

                                    <EventNameComponent value={watch("name") || ""} onChange={(value) => setValue("name", value)} />
                                    <ObjectiveComponent value={watch("objective") || ""} onChange={(value) => setValue("objective", value)} />
                                    <ResponsibleComponent
                                        responsible={watch("responsibles") || []}
                                        onAppendResponsible={(responsible) => appendResponible(responsible)}
                                        onUpdateResponsible={(index, responsible) => updateResponsible(index, responsible)}
                                    />
                                    <Controller
                                        name="achievementIndicator"
                                        control={control}
                                        defaultValue=""
                                        render={({ field }) => (
                                            <IndicadorLogroComponent
                                                value={field.value}
                                                onChange={(value) => field.onChange(value)}
                                            />
                                        )}
                                    />
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

                                <TabsContent value="finance" className="mt-4 space-y-6">
                                    <div className="p-4 bg-gray-50 rounded-lg border">
                                        <label className="text-sm font-medium text-gray-700">Costo Total</label>
                                        <div className="mt-1 text-2xl font-bold text-primary">
                                            Q {(watch("totalCost") || 0).toFixed(2)}
                                        </div>
                                    </div>
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
                                    <Controller
                                        name="purchaseTypeId"
                                        control={control}
                                        defaultValue={undefined}
                                        render={({ field }) => (
                                            <PurchaseType
                                                selectedTipo={field.value}
                                                onSelectTipo={(tipo) => field.onChange(tipo)}
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="costDetailDocuments"
                                        control={control}
                                        defaultValue={[]}
                                        render={({ field }) => (
                                            <EventCostDetail
                                                files={field.value || []}
                                                onFilesChange={(files) => field.onChange(files)}
                                            />
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
                                    <RecursosSelectorComponent
                                        selectedRecursos={event?.recursos || []}
                                        onSelectRecursos={(recursos) => updateField("recursos", recursos)}
                                    />
                                </TabsContent>
                            </ScrollArea>
                        </Tabs>
                        <DevTool control={control} />
                    </form>
                </>
                <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
                    <Button variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={() => {
                            /* Lógica para guardar */
                        }}
                    >
                        Guardar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

