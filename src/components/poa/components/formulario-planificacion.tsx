// src/components/poa/components/PlanificacionFormComponent.tsx

'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from 'react-toastify'
import { z } from 'zod'

import { ObjetivosEstrategicosSelectorComponent } from './columns/objetivos-estrategicos-selector'
import { EstrategiasSelectorComponent } from './columns/estrategias-selector'
import { IntervencionesSelectorComponent } from './columns/intervenciones-selector'
import { OdsSelector } from './columns/ods-selector'
import { ActividadProyectoSelector } from './columns/actividad-proyecto-selector'
import CurrencyInput from './columns/currency-input'
import { AporteUmesComponent } from './columns/aporte-umes'
import { AporteOtrasFuentesComponent } from './columns/aporte-otras-fuentes'
import TipoDeCompraComponent from './columns/tipo-de-compra'
import { RecursosSelectorComponent } from './columns/recursos-selector'
import { DetalleComponent } from './columns/detalle'
import { DetalleProcesoComponent } from './columns/detalle-proceso' // Importamos el componente
import { AreaEstrategicaComponent } from './columns/area-estrategica'
import { EventoComponent } from './columns/evento'
import { ObjetivoComponent } from './columns/objetivo'
import { EstadoComponent } from './columns/estado'
import { ResponsablesComponent } from './columns/responsables'
import { IndicadorLogroComponent } from './columns/indicador-logro'
import { CampusSelector } from './columns/campus-selector'
import EventsCorrectionsComponent from '../sections/events-viewer/EventsCorrectionsComponent'
import { filaPlanificacionSchema } from '@/schemas/filaPlanificacionSchema'
import { useCurrentUser } from '@/hooks/use-current-user'

import {
  getStrategicAreas,
  getStrategicObjectives,
  getUserById,
  getPoaByFacultyAndYear
} from '@/services/apiService'

import { StrategicArea } from '@/types/StrategicArea'
import { StrategicObjective } from '@/schemas/strategicObjectiveSchema'

type FilaPlanificacionForm = z.infer<typeof filaPlanificacionSchema>

interface FilaPlanificacion extends FilaPlanificacionForm {
  estado: 'planificado' | 'aprobado' | 'rechazado'
  comentarioDecano: string
  detalleProceso: File | null // Añadido para manejar el archivo
}

interface FilaError {
  [key: string]: string
}

interface DatePair {
  start: Date
  end: Date
}

const getColumnName = (field: string): string => {
  const columnMap: { [key: string]: string } = {
    areaEstrategica: "Área Estratégica",
    objetivoEstrategico: "Objetivo Estratégico",
    estrategias: "Estrategias",
    intervencion: "Intervención",
    ods: "ODS",
    tipoEvento: "Tipo de Evento",
    evento: "Evento",
    objetivo: "Objetivo",
    estado: "Estado",
    costoTotal: "Costo Total",
    aporteUMES: "Aporte UMES",
    aporteOtros: "Aporte Otros",
    tipoCompra: "Tipo de Compra",
    detalle: "Detalle de Costos",
    campusId: "Campus",
    responsablePlanificacion: "Responsable de Planificación",
    responsableEjecucion: "Responsable de Ejecución",
    responsableSeguimiento: "Responsable de Seguimiento",
    recursos: "Recursos",
    indicadorLogro: "Indicador de Logro",
    fechas: "Fechas",
    detalleProceso: "Detalle del Proceso",
    comentarioDecano: "Comentario Decano",
  }
  return columnMap[field] || field
}

export default function PlanificacionFormComponent() {
  const user = useCurrentUser();
  const userId = user?.userId

  const initialFila: FilaPlanificacion = {
    id: Date.now().toString(),
    areaEstrategica: '',
    objetivoEstrategico: '',
    estrategias: [],
    intervencion: [],
    ods: [],
    tipoEvento: 'actividad',
    evento: '',
    objetivo: '',
    estado: 'planificado',
    costoTotal: 0,
    aporteUMES: [],
    aporteOtros: [],
    tipoCompra: "",
    detalle: null,
    responsablePlanificacion: '',
    responsableEjecucion: '',
    responsableSeguimiento: '',
    recursos: [],
    indicadorLogro: '',
    detalleProceso: null, // Inicializamos detalleProceso
    comentarioDecano: '',
    fechas: [{ start: new Date(), end: new Date() }],
    campusId: '',
  }

  const [fila, setFila] = useState<FilaPlanificacion>(initialFila)

  const [strategicAreas, setStrategicAreas] = useState<StrategicArea[]>([])
  const [strategicObjectives, setStrategicObjectives] = useState<StrategicObjective[]>([])
  const [objetivoToAreaMap, setObjetivoToAreaMap] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [filaErrors, setFilaErrors] = useState<FilaError>({})

  const [facultyId, setFacultyId] = useState<number | null>(null)
  const [poaId, setPoaId] = useState<number | null>(null)
  const [loadingPoa, setLoadingPoa] = useState<boolean>(false)
  const [errorPoa, setErrorPoa] = useState<string | null>(null)

  const [isErrorModalOpen, setIsErrorModalOpen] = useState<boolean>(false)
  const [modalErrorList, setModalErrorList] = useState<{ column: string, message: string }[]>([])

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false)

  // Estados para gestionar la deshabilitación
  const [isEstrategiasDisabled, setIsEstrategiasDisabled] = useState<boolean>(true)
  const [isIntervencionesDisabled, setIsIntervencionesDisabled] = useState<boolean>(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const areas = await getStrategicAreas(user?.token || '')
        const activeAreas = areas.filter(area => !area.isDeleted)
        setStrategicAreas(activeAreas)

        const objectives = await getStrategicObjectives(user?.token || '')
        const activeObjectives = objectives.filter(obj => !obj.isDeleted)
        setStrategicObjectives(activeObjectives)

        const map: { [key: string]: string } = {}
        activeObjectives.forEach(obj => {
          const areaMatched = activeAreas.find(area => area.strategicAreaId === obj.strategicAreaId)
          if (areaMatched) {
            map[obj.strategicObjectiveId.toString()] = areaMatched.name
          } else {
            console.warn(`No se encontró Área Estratégica para el Objetivo Estratégico ID: ${obj.strategicObjectiveId}`)
          }
        })
        setObjetivoToAreaMap(map)
      } catch (err) {
        if (err instanceof z.ZodError) {
          setError("Error en la validación de datos de áreas estratégicas u objetivos estratégicos.")
          console.error(err.errors)
        } else {
          setError((err as Error).message)
        }
      } finally {
        setLoading(false)
      }
    }

      fetchData()
    }, [])

  useEffect(() => {
    const fetchFacultyAndPoa = async () => {
      if (!userId) {
        setErrorPoa("Usuario no autenticado.")
        return
      }
      try {
        const userData = await getUserById(userId, user?.token || '')
        const fetchedFacultyId = userData.facultyId
        setFacultyId(fetchedFacultyId)

        const currentYear = new Date().getFullYear()

        setLoadingPoa(true)
        const poaData = await getPoaByFacultyAndYear(fetchedFacultyId, currentYear, user?.token || '')
        const fetchedPoaId = poaData.poaId
        setPoaId(fetchedPoaId)
      } catch (err) {
        setErrorPoa((err as Error).message)
        console.error(err)
      } finally {
        setLoadingPoa(false)
      }
    }

    fetchFacultyAndPoa()
  }, [userId])

  // Función para actualizar los campos de la fila
  const actualizarFila = (campo: keyof FilaPlanificacion, valor: any | null) => {
    setFila(prevFila => {
      const updatedFila = { ...prevFila, [campo]: valor }
      if (campo === 'objetivoEstrategico') {
        updatedFila.areaEstrategica = objetivoToAreaMap[valor] || ''

        // Gestionar deshabilitación del selector de estrategias
        setIsEstrategiasDisabled(!valor) // Deshabilitar si no hay objetivo estratégico seleccionado

        // Resetear estrategias e intervenciones si el objetivo estratégico cambia
        if (!valor) {
          updatedFila.estrategias = []
          updatedFila.intervencion = []
          setIsIntervencionesDisabled(true)
        } else {
          // Si se selecciona un objetivo estratégico, verificar si hay estrategias seleccionadas
          setIsIntervencionesDisabled(updatedFila.estrategias.length === 0)
        }
      }

      if (campo === 'estrategias') {
        // Gestionar deshabilitación del selector de intervenciones
        setIsIntervencionesDisabled((valor as string[]).length === 0)
      }

      return updatedFila
    })
  }  

  // Función para manejar cambios en `IntervencionesSelectorComponent`
  const actualizarIntervencion = (intervenciones: string[]) => {
    actualizarFila('intervencion', intervenciones)
  }

  // Añadir un nuevo objetivo estratégico
  const addStrategicObjective = (createdObjetivo: StrategicObjective) => {
    setStrategicObjectives(prev => [...prev, createdObjetivo])
    const area = strategicAreas.find(area => area.strategicAreaId === createdObjetivo.strategicAreaId)
    if (area) {
      setObjetivoToAreaMap(prevMap => ({
        ...prevMap,
        [createdObjetivo.strategicObjectiveId.toString()]: area.name,
      }))
    } else {
      console.warn(`No se encontró Área Estratégica para el nuevo Objetivo Estratégico ID: ${createdObjetivo.strategicObjectiveId}`)
    }
    toast.success("Nuevo objetivo estratégico agregado.")
  }

  const manejarCambioFechas = (data: { tipoEvento: "actividad" | "proyecto"; fechas: DatePair[] }) => {
    // Implementar si es necesario
  }

  const enviarActividad = async () => {
    if (loadingPoa) {
      toast.warn("Aún se está obteniendo el poaId. Por favor, espera un momento.")
      return
    }

    if (errorPoa) {
      toast.error(`No se puede enviar la actividad debido a un error: ${errorPoa}`)
      return
    }

    if (!poaId) {
      toast.error("poaId no está disponible.")
      return
    }

    const validation = filaPlanificacionSchema.safeParse(fila)

    if (!validation.success) {
      const errors: FilaError = {}
      const errorsList: { column: string, message: string }[] = []

      validation.error.errors.forEach(err => {
        const field = err.path[0] as string
        const message = err.message
        errors[field] = message
        errorsList.push({
          column: getColumnName(field),
          message: message,
        })
      })
      setFilaErrors(errors)
      setModalErrorList(errorsList)
      setIsErrorModalOpen(true)
      toast.error("Hay errores en el formulario. Por favor, revisa los campos.")
      console.error("Error de validación:", validation.error.errors)
      return
    }

    if (!fila.detalle) {
      setIsConfirmModalOpen(true)
      return
    }

    await enviarAlBackend()
  }

  const enviarAlBackend = async () => {
    try {
      if (!process.env.NEXT_PUBLIC_API_URL) {
        throw new Error("La URL de la API no está definida.")
      }

      const eventData = {
        name: fila.evento.trim(),
        type: fila.tipoEvento === 'actividad' ? 'Actividad' : 'Proyecto',
        poaId: poaId,
        statusId: 1,
        completionPercentage: 0,
        campusId: parseInt(fila.campusId, 10),
        objective: fila.objetivo.trim(),
        eventNature: 'Planificado',
        isDelayed: false,
        achievementIndicator: fila.indicadorLogro.trim(),
        purchaseTypeId: parseInt(fila.tipoCompra, 10),
        totalCost: fila.costoTotal,
        dates: fila.fechas.map(pair => ({
          startDate: pair.start.toISOString().split('T')[0],
          endDate: pair.end.toISOString().split('T')[0],
        })),
        financings: [
          ...fila.aporteUMES.map(aporte => ({
            financingSourceId: aporte.financingSourceId,
            percentage: aporte.porcentaje,
            amount: aporte.amount,
          })),
          ...fila.aporteOtros.map(aporte => ({
            financingSourceId: aporte.financingSourceId,
            percentage: aporte.porcentaje,
            amount: aporte.amount,
          })),
        ],
        approvals: [],
        responsibles: [
          {
            responsibleRole: 'Principal',
            name: fila.responsablePlanificacion.trim(),
          },
          {
            responsibleRole: 'Ejecución',
            name: fila.responsableEjecucion.trim(),
          },
          {
            responsibleRole: 'Seguimiento',
            name: fila.responsableSeguimiento.trim(),
          },
        ],
        interventions: fila.intervencion.map(id => parseInt(id, 10)).filter(id => !isNaN(id)),
        ods: fila.ods.map(id => parseInt(id, 10)).filter(id => !isNaN(id)),
        recursos: fila.recursos,
        userId: userId,
      }

      console.log("Datos a enviar:", eventData)

      const formData = new FormData()
      formData.append('data', JSON.stringify(eventData))

      if (fila.detalle) {
        formData.append('costDetailDocuments', fila.detalle)
      }

      if (fila.detalleProceso) {
        formData.append('processDocument', fila.detalleProceso) // Enviamos el archivo como 'processDocument'
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fullEvent`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Error al enviar la actividad: ${errorData.message || response.statusText}`)
      }

      const result = await response.json()
      console.log(`Actividad enviada exitosamente:`, result)

      toast.success("Actividad enviada exitosamente.")

      setFila(prevFila => ({ ...prevFila, estado: 'aprobado' }))

      setFilaErrors({})

      // Restablecer el formulario a sus valores iniciales
      setFila(initialFila)

      // Resetear deshabilitaciones
      setIsEstrategiasDisabled(true)
      setIsIntervencionesDisabled(true)
    } catch (err) {
      console.error(err)
      toast.error(`Error al enviar la actividad: ${(err as Error).message}`)
    }
  }

  const confirmarEnvioSinDetalle = async () => {
    await enviarAlBackend()
    setIsConfirmModalOpen(false)
  }

  if (loading || loadingPoa) return <div className="flex justify-center items-center h-screen">Cargando datos...</div>
  if (error) return <div className="text-red-500 text-center">Error: {error}</div>
  if (errorPoa) return <div className="text-red-500 text-center">Error al obtener poaId: {errorPoa}</div>

  const strategicObjective = strategicObjectives.find(
    (obj) => obj.strategicObjectiveId.toString() === fila.objetivoEstrategico
  )

  const strategicObjectiveId = strategicObjective
    ? strategicObjective.strategicObjectiveId
    : 0

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Evento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6">
          <Card className="p-4">
                <CardHeader>
                  <CardTitle>Plan estratégico institucional</CardTitle>
                </CardHeader>
                <CardContent className='grid md:grid-cols-2'>
            <div>
              <label className="block font-medium mb-2">Área Estratégica</label>
              <AreaEstrategicaComponent
                areaEstrategica={fila.areaEstrategica}
                error={filaErrors?.areaEstrategica}
              />
              {filaErrors?.areaEstrategica && (
                <span className="text-red-500 text-sm">{filaErrors.areaEstrategica}</span>
              )}
            </div>
            <div>
              <label className="block font-medium mb-2">Objetivo Estratégico</label>
              <ObjetivosEstrategicosSelectorComponent
                selectedObjetivos={[fila.objetivoEstrategico]}
                onSelectObjetivo={(objetivo) => actualizarFila('objetivoEstrategico', objetivo)}
                strategicObjectives={strategicObjectives}
                addStrategicObjective={addStrategicObjective}
              />
              {filaErrors?.objetivoEstrategico && (
                <span className="text-red-500 text-sm">{filaErrors.objetivoEstrategico}</span>
              )}
            </div>
            <div className="pt-16">
              <label className="block font-medium mb-2">Estrategias</label>
              <EstrategiasSelectorComponent
                selectedEstrategias={fila.estrategias}
                onSelectEstrategia={(estrategias) => actualizarFila('estrategias', estrategias)}
                strategicObjectiveIds={fila.objetivoEstrategico ? [Number(fila.objetivoEstrategico)] : []}
                disabled={isEstrategiasDisabled}
                tooltipMessage="Por favor, seleccione primero un objetivo estratégico."

              />
              {filaErrors?.estrategias && (
                <span className="text-red-500 text-sm">{filaErrors.estrategias}</span>
              )}
            </div>
            <div className="pt-16">
              <label className="block font-medium mb-2">Intervención</label>
              <IntervencionesSelectorComponent
                selectedIntervenciones={fila.intervencion}
                onSelectIntervencion={actualizarIntervencion}
                disabled={isIntervencionesDisabled}
                tooltipMessage="Por favor, seleccione primero al menos una estrategia."
                strategyIds={fila.estrategias} // Pasamos las estrategias seleccionadas

              />
              {filaErrors?.intervencion && (
                <span className="text-red-500 text-sm">{filaErrors.intervencion}</span>
              )}
            </div>
            <div>
              <label className="block font-medium mb-2">ODS</label>
              <OdsSelector
                selectedODS={fila.ods}
                onSelectODS={(ods) => actualizarFila('ods', ods)}
              />
              {filaErrors?.ods && (
                <span className="text-red-500 text-sm">{filaErrors.ods}</span>
              )}
            </div>
            </CardContent>
            </Card>
            <div>
              <label className="block font-medium mb-2">Tipo de Evento</label>
              <ActividadProyectoSelector
                selectedOption={fila.tipoEvento}
                onSelectOption={(tipo) => actualizarFila('tipoEvento', tipo)}
                onChange={(data) => manejarCambioFechas(data)}
              />
              {filaErrors?.tipoEvento && (
                <span className="text-red-500 text-sm">{filaErrors.tipoEvento}</span>
              )}
            </div>
            <div>
              <label className="block font-medium mb-2">Evento</label>
              <EventoComponent
                value={fila.evento}
                onChange={(value) => actualizarFila('evento', value)}
              />
              {filaErrors?.evento && (
                <span className="text-red-500 text-sm">{filaErrors.evento}</span>
              )}
            </div>
            <div>
              <label className="block font-medium mb-2">Objetivo</label>
              <ObjetivoComponent
                value={fila.objetivo}
                onChange={(value) => actualizarFila('objetivo', value)}
              />
              {filaErrors?.objetivo && (
                <span className="text-red-500 text-sm">{filaErrors.objetivo}</span>
              )}
            </div>
            <div>
              <label className="block font-medium mb-2">Estado</label>
              <EstadoComponent estado={fila.estado} />
              {filaErrors?.estado && (
                <span className="text-red-500 text-sm">{filaErrors.estado}</span>
              )}
            </div>
            <div>
              <label className="block font-medium mb-2">Costo Total</label>
              <CurrencyInput
                value={fila.costoTotal}
                onChange={(valor: number | undefined) => actualizarFila('costoTotal', valor ?? 0)}
              />
              {filaErrors?.costoTotal && (
                <span className="text-red-500 text-sm">{filaErrors.costoTotal}</span>
              )}
            </div>
            <div>
              <label className="block font-medium mb-2">Aporte UMES</label>
              <AporteUmesComponent
                aportes={fila.aporteUMES}
                onChangeAportes={(aportes) => actualizarFila('aporteUMES', aportes)}
              />
              {filaErrors?.aporteUMES && (
                <span className="text-red-500 text-sm">{filaErrors.aporteUMES}</span>
              )}
            </div>
            <div>
              <label className="block font-medium mb-2">Aporte Otros</label>
              <AporteOtrasFuentesComponent
                aportes={fila.aporteOtros}
                onChangeAportes={(aportes) => actualizarFila('aporteOtros', aportes)}
              />
              {filaErrors?.aporteOtros && (
                <span className="text-red-500 text-sm">{filaErrors.aporteOtros}</span>
              )}
            </div>
            <div>
              <label className="block font-medium mb-2">Tipo de Compra</label>
              <TipoDeCompraComponent
                selectedTipo={fila.tipoCompra}
                onSelectTipo={(tipos: string | null) => actualizarFila('tipoCompra', tipos)}
              />
              {filaErrors?.tipoCompra && (
                <span className="text-red-500 text-sm">{filaErrors.tipoCompra}</span>
              )}
            </div>
            <div>
              <label className="block font-medium mb-2">Detalle de Costos</label>
              <DetalleComponent
                file={fila.detalle}
                onFileChange={(file) => actualizarFila('detalle', file)}
              />
              {!fila.detalle && (
                <span className="text-yellow-500 text-sm">Detalle de costos no agregado.</span>
              )}
              {filaErrors?.detalle && (
                <span className="text-red-500 text-sm">{filaErrors.detalle}</span>
              )}
            </div>
            <div>
              <label className="block font-medium mb-2">Campus</label>
              <CampusSelector
                selectedCampusId={fila.campusId}
                onSelectCampus={(campusId) => actualizarFila('campusId', campusId)}
              />
              {filaErrors?.campusId && (
                <span className="text-red-500 text-sm">{filaErrors.campusId}</span>
              )}
            </div>
            <div>
              <label className="block font-medium mb-2">Responsables</label>
              <ResponsablesComponent
                responsablePlanificacion={fila.responsablePlanificacion}
                responsableEjecucion={fila.responsableEjecucion}
                responsableSeguimiento={fila.responsableSeguimiento}
                onChangeResponsablePlanificacion={(value: string) => actualizarFila('responsablePlanificacion', value)}
                onChangeResponsableEjecucion={(value: string) => actualizarFila('responsableEjecucion', value)}
                onChangeResponsableSeguimiento={(value: string) => actualizarFila('responsableSeguimiento', value)}
              />
              {filaErrors?.responsablePlanificacion && (
                <span className="text-red-500 text-sm">{filaErrors.responsablePlanificacion}</span>
              )}
              {filaErrors?.responsableEjecucion && (
                <span className="text-red-500 text-sm">{filaErrors.responsableEjecucion}</span>
              )}
              {filaErrors?.responsableSeguimiento && (
                <span className="text-red-500 text-sm">{filaErrors.responsableSeguimiento}</span>
              )}
            </div>
            <div>
              <label className="block font-medium mb-2">Recursos</label>
              <RecursosSelectorComponent
                selectedRecursos={fila.recursos}
                onSelectRecursos={(recursos) => actualizarFila('recursos', recursos)}
              />
              {filaErrors?.recursos && (
                <span className="text-red-500 text-sm">{filaErrors.recursos}</span>
              )}
            </div>
            <div>
              <label className="block font-medium mb-2">Indicador de Logro</label>
              <IndicadorLogroComponent
                value={fila.indicadorLogro}
                onChange={(value: string) => actualizarFila('indicadorLogro', value)}
              />
              {filaErrors?.indicadorLogro && (
                <span className="text-red-500 text-sm">{filaErrors.indicadorLogro}</span>
              )}
            </div>
            <div>
              <label className="block font-medium mb-2">Detalle del Proceso</label>
              <DetalleProcesoComponent
                file={fila.detalleProceso}
                onFileChange={(file) => actualizarFila('detalleProceso', file)}
              />
              {!fila.detalleProceso && (
                <span className="text-yellow-500 text-sm">Detalle del proceso no agregado.</span>
              )}
              {filaErrors?.detalleProceso && (
                <span className="text-red-500 text-sm">{filaErrors.detalleProceso}</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-center">
        <Button onClick={enviarActividad} className="px-8 py-2">Enviar Evento</Button>
      </div>

      {/* Modal de Errores */}
      {isErrorModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Errores en el Formulario</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside">
                {modalErrorList.map((error, index) => (
                  <li key={index} className="mb-2">
                    <strong>{error.column}:</strong> {error.message}
                  </li>
                ))}
              </ul>
            </CardContent>
            <div className="p-4 flex justify-end">
              <Button onClick={() => setIsErrorModalOpen(false)}>Cerrar</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal de Confirmación */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Confirmar Envío</CardTitle>
            </CardHeader>
            <CardContent>
              <p>¿Estás seguro de que deseas enviar la actividad sin el detalle de costos?</p>
            </CardContent>
            <div className="p-4 flex justify-end space-x-4">
              <Button variant="outline" onClick={() => setIsConfirmModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={confirmarEnvioSinDetalle}>
                Enviar
              </Button>
            </div>
          </Card>
        </div>
      )}

      {poaId && facultyId && userId ? (
        <EventsCorrectionsComponent
          name="Revisión de eventos"
          isActive={false}
          poaId={poaId}
          facultyId={facultyId}
          isEditable={false}
          userId={userId}
        />
      ) : (
        <div>Cargando datos de la tabla de eventos...</div>
      )}
    </div>
  )
}
