// src/components/poa/eventManagement/formView/eventPlanningForm.tsx

// Libraries
import { DevTool } from "@hookform/devtools";
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
import { ActividadProyectoSelector } from "../fields/actividad-proyecto-selector"
import { EventoComponent } from "../fields/evento"
import { ObjetivoComponent } from "../fields/objetivo"
import { UMESFinancingComponent } from "../fields/umes-financing-source"
import { OtherFinancingSourceComponent } from "../fields/other-financing-source"
import TipoDeCompraComponent from "../fields/tipo-de-compra"
import { EventCostDetail } from "../fields/detalle"
import { CampusSelector } from "../fields/campus-selector"
import { ResponsablesComponent } from "../fields/responsables"
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
    financingSources: any[]
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
    financingSources,
    selectedStrategicArea,
    selectedStrategicObjective,
    setSelectedStrategicObjective,
    selectedStrategies,
    setSelectedStrategies,
}: EventPlanningFormProps) {
    const {
        fieldsInterventions,
        appendIntervention,
        removeIntervention,
        fieldsODS,
        appendODS,
        removeODS,
        watch,
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
                                    <ActividadProyectoSelector
                                        selectedOption={event?.tipoEvento || "actividad"}
                                        onSelectOption={(tipo) => updateField("tipoEvento", tipo)}
                                        fechas={event?.fechas || []}
                                        onChangeFechas={(fechas) => updateField("fechas", fechas)}
                                        fechaProyecto={event?.fechaProyecto || { start: new Date(), end: new Date() }}
                                        onChangeFechaProyecto={(fecha) => updateField("fechaProyecto", fecha)}
                                    />
                                    <EventoComponent value={event?.evento || ""} onChange={(value) => updateField("evento", value)} />
                                    <ObjetivoComponent value={event?.objetivo || ""} onChange={(value) => updateField("objetivo", value)} />
                                    <ResponsablesComponent
                                        responsablePlanificacion={event?.responsablePlanificacion || ""}
                                        responsableEjecucion={event?.responsableEjecucion || ""}
                                        responsableSeguimiento={event?.responsableSeguimiento || ""}
                                        onChangeResponsablePlanificacion={(value: string) => updateField("responsablePlanificacion", value)}
                                        onChangeResponsableEjecucion={(value: string) => updateField("responsableEjecucion", value)}
                                        onChangeResponsableSeguimiento={(value: string) => updateField("responsableSeguimiento", value)}
                                    />
                                    <IndicadorLogroComponent
                                        value={event?.indicadorLogro || ""}
                                        onChange={(value: string) => updateField("indicadorLogro", value)}
                                    />
                                    <DetalleProcesoComponent
                                        files={event?.processDocuments || []}
                                        onFilesChange={(files: File[]) => updateField("processDocuments", files)}
                                    />
                                </TabsContent>

                                <TabsContent value="finance" className="mt-4 space-y-6">
                                    <div className="p-4 bg-gray-50 rounded-lg border">
                                        <label className="text-sm font-medium text-gray-700">Costo Total</label>
                                        <div className="mt-1 text-2xl font-bold text-green-600">
                                            Q {(event?.aporteUMES + event?.aporteOtros || 0).toFixed(2)}
                                        </div>
                                    </div>
                                    <UMESFinancingComponent
                                        contributions={event?.aporteUMES || []}
                                        onChangeContributions={(aportes) => updateField("aporteUMES", aportes)}
                                        totalCost={event?.aporteUMES + event?.aporteOtros || 0}
                                        financingSources={financingSources}
                                    />
                                    <OtherFinancingSourceComponent
                                        contributions={event?.aporteOtros || []}
                                        onChangeContributions={(aportes) => updateField("aporteOtros", aportes)}
                                        totalCost={event?.aporteUMES + event?.aporteOtros || 0}
                                        financingSources={financingSources}
                                    />
                                    <TipoDeCompraComponent
                                        selectedTipo={event?.tipoCompra || ""}
                                        onSelectTipo={(tipos: string | null) => updateField("tipoCompra", tipos)}
                                    />
                                    <EventCostDetail
                                        files={event?.costDetailDocuments || []}
                                        onFilesChange={(files) => updateField("costDetailDocuments", files)}
                                    />
                                    <CampusSelector
                                        selectedCampusId={event?.campusId || ""}
                                        onSelectCampus={(campusId) => updateField("campusId", campusId)}
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

