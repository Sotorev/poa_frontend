// src/components/poa/components/PlanificacionFormComponent.tsx

'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from 'react-toastify'
import { z } from 'zod'

import { ObjetivosEstrategicosSelectorComponent } from './fields/objetivos-estrategicos-selector'
import { EstrategiasSelectorComponent } from './fields/estrategias-selector'
import { IntervencionesSelectorComponent } from './fields/intervenciones-selector'
import { OdsSelector } from './fields/ods-selector'
import { ActividadProyectoSelector } from './fields/actividad-proyecto-selector'
import TipoDeCompraComponent from './fields/tipo-de-compra'
import { RecursosSelectorComponent } from './fields/recursos-selector'
import { DetalleComponent } from './fields/detalle'
import { DetalleProcesoComponent } from './fields/detalle-proceso'
import { AreaEstrategicaComponent } from './fields/area-estrategica'
import { EventoComponent } from './fields/evento'
import { ObjetivoComponent } from './fields/objetivo'
import { EstadoComponent } from './fields/estado'
import { ResponsablesComponent } from './fields/responsables'
import { IndicadorLogroComponent } from './fields/indicador-logro'
import { CampusSelector } from './fields/campus-selector'
import EventsCorrectionsComponent from '../sections/events-viewer/EventsCorrectionsComponent'
import { filaPlanificacionSchema } from '@/schemas/filaPlanificacionSchema'
import { useCurrentUser } from '@/hooks/use-current-user'

import { StrategicArea } from '@/types/StrategicArea'
import { StrategicObjective, StrategicObjectiveSchema } from '@/schemas/strategicObjectiveSchema'
import { OtherFinancingSourceComponent } from './fields/other-financing-source'
import { UMESFinancingComponent } from './fields/umes-financing-source'
import { Label } from '@radix-ui/react-dropdown-menu'

import { Strategy } from '@/types/Strategy'
import { Intervention } from '@/types/Intervention'
import { ODS } from '@/types/ods'
import { Resource } from '@/types/Resource'
import { Campus } from '@/types/Campus'
import { PurchaseType } from '@/types/PurchaseType'
import { downloadFile } from '@/utils/downloadFile' // Importar la función de utilidad
import { PlanningEvent } from '@/types/interfaces'
import { strategicAreasSchema } from '@/schemas/strategicAreaSchema'

type FilaPlanificacionForm = z.infer<typeof filaPlanificacionSchema>

interface DatePair {
  start: Date;
  end: Date;
}

interface Contribution {
  financingSourceId: number
  percentage: number
  amount: number
}

interface FilaPlanificacion extends FilaPlanificacionForm {
  id: string
  estado: 'planificado' | 'aprobado' | 'rechazado'
  comentarioDecano: string
  detalleProceso: File | null
  fechas: DatePair[]
  fechaProyecto: DatePair
  entityId: number | null
}

interface FilaError {
  [key: string]: string
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
    processDocument: "Documento de Proceso",
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
    detalleProceso: null,
    comentarioDecano: '',
    fechas: [{ start: new Date(), end: new Date() }],
    fechaProyecto: { start: new Date(), end: new Date() },
    campusId: '',
    entityId: null,
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

  const [estrategias, setEstrategias] = useState<Strategy[]>([])
  const [intervenciones, setIntervenciones] = useState<Intervention[]>([])
  const [odsList, setOdsList] = useState<ODS[]>([])
  const [recursos, setRecursos] = useState<Resource[]>([])
  const [campuses, setCampuses] = useState<Campus[]>([])
  const [purchaseTypes, setPurchaseTypes] = useState<PurchaseType[]>([])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        if (!process.env.NEXT_PUBLIC_API_URL) {
          throw new Error("NEXT_PUBLIC_API_URL no está definido en las variables de entorno.")
        }

        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        }

        // Fetch Strategic Areas
        const responseAreas = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/strategicareas`, { headers });
        if (!responseAreas.ok) throw new Error(`Error al obtener áreas estratégicas: ${responseAreas.statusText}`);
        const dataAreas = await responseAreas.json();
        const parsedAreas = strategicAreasSchema.parse(dataAreas);
        const activeAreas = parsedAreas.filter((area) => !area.isDeleted);
        setStrategicAreas(activeAreas);

        // Fetch Strategic Objectives
        const responseObjectives = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/strategicobjectives`, { headers });
        if (!responseObjectives.ok) throw new Error(`Error al obtener objetivos estratégicos: ${responseObjectives.statusText}`);
        const dataObjectives = await responseObjectives.json();
        const parsedObjectives = dataObjectives.map((obj: any) => StrategicObjectiveSchema.parse(obj)).filter((obj: StrategicObjective) => !obj.isDeleted);
        setStrategicObjectives(parsedObjectives);

        const map: { [key: string]: string } = {};
        parsedObjectives.forEach((obj: StrategicObjective) => {
          const areaMatched = activeAreas.find(area => area.strategicAreaId === obj.strategicAreaId);
          if (areaMatched) {
            map[obj.strategicObjectiveId.toString()] = areaMatched.name;
          } else {
            console.warn(`No se encontró Área Estratégica para el Objetivo Estratégico ID: ${obj.strategicObjectiveId}`);
          }
        });
        setObjetivoToAreaMap(map);

        // Fetch Estrategias
        const responseEstrategias = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/strategies`, { headers });
        if (!responseEstrategias.ok) throw new Error(`Error al obtener estrategias: ${responseEstrategias.statusText}`);
        const dataEstrategias = await responseEstrategias.json();
        setEstrategias(dataEstrategias);

        // Fetch Intervenciones
        const responseIntervenciones = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/interventions`, { headers });
        if (!responseIntervenciones.ok) throw new Error(`Error al obtener intervenciones: ${responseIntervenciones.statusText}`);
        const dataIntervenciones = await responseIntervenciones.json();
        setIntervenciones(dataIntervenciones);

        // Fetch ODS
        const responseODS = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ods`, { headers });
        if (!responseODS.ok) throw new Error(`Error al obtener ODS: ${responseODS.statusText}`);
        const dataODS = await responseODS.json();
        setOdsList(dataODS);

        // Fetch Recursos
        const responseRecursos = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/institutionalResources`, { headers });
        if (!responseRecursos.ok) throw new Error(`Error al obtener recursos: ${responseRecursos.statusText}`);
        const dataRecursos = await responseRecursos.json();
        setRecursos(dataRecursos);

        // Fetch Campuses
        const responseCampuses = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/campus/`, { headers });
        if (!responseCampuses.ok) throw new Error(`Error al obtener campuses: ${responseCampuses.statusText}`);
        const dataCampuses = await responseCampuses.json();
        setCampuses(dataCampuses);

        // Fetch Purchase Types
        const responsePurchaseTypes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/purchasetypes`, { headers });
        if (!responsePurchaseTypes.ok) throw new Error(`Error al obtener tipos de compra: ${responsePurchaseTypes.statusText}`);
        const dataPurchaseTypes = await responsePurchaseTypes.json();
        setPurchaseTypes(dataPurchaseTypes);

      } catch (err) {
        if (err instanceof z.ZodError) {
          setError("Error en la validación de datos.")
          console.error(err.errors)
        } else {
          setError((err as Error).message)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?.token])

  useEffect(() => {
    const fetchFacultyAndPoa = async () => {
      if (!userId) {
        setErrorPoa("Usuario no autenticado.")
        return
      }
      try {
        if (!process.env.NEXT_PUBLIC_API_URL) {
          throw new Error("La URL de la API no está definida.")
        }

        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        }

        // Fetch User Data
        const responseUser = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`, { headers });
        if (!responseUser.ok) throw new Error(`Error al obtener datos del usuario: ${responseUser.statusText}`);
        const dataUser = await responseUser.json();
        const fetchedFacultyId = dataUser.facultyId;
        setFacultyId(fetchedFacultyId);

        const currentYear = new Date().getFullYear();

        // Fetch POA
        setLoadingPoa(true);
        const responsePoa = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/poas/${fetchedFacultyId}/${currentYear}`, { headers });
        if (!responsePoa.ok) throw new Error(`Error al obtener poaId: ${responsePoa.statusText}`);
        const dataPoa = await responsePoa.json();
        const fetchedPoaId = dataPoa.poaId;
        setPoaId(fetchedPoaId);
      } catch (err) {
        setErrorPoa((err as Error).message);
        console.error(err);
      } finally {
        setLoadingPoa(false);
      }
    }

    fetchFacultyAndPoa()
  }, [userId, user?.token])

  // Función auxiliar para descargar y convertir archivos a objetos File
  const descargarArchivo = async (url: string, nombreArchivo: string): Promise<File | null> => {
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      if (!response.ok) {
        console.error(`Error al descargar el archivo desde ${url}: ${response.statusText}`);
        return null;
      }
      const blob = await response.blob();
      // Inferir el tipo de archivo desde el blob
      const tipo = blob.type || 'application/octet-stream';
      return new File([blob], nombreArchivo, { type: tipo });
    } catch (error) {
      console.error(`Error al descargar el archivo desde ${url}:`, error);
      return null;
    }
  };

  // Función para manejar la edición de un evento
  const handleEditEvent = async (event: PlanningEvent) => {
    try {
      // Mapeo de datos existente
      const areaEstrategicaObj = strategicAreas.find(area => area.name === event.areaEstrategica);
      const areaEstrategicaId = areaEstrategicaObj ? areaEstrategicaObj.name : '';

      const objetivoEstrategicoObj = strategicObjectives.find(obj => obj.description === event.objetivoEstrategico);
      const objetivoEstrategicoId = objetivoEstrategicoObj ? objetivoEstrategicoObj.strategicObjectiveId.toString() : '';

      const estrategiasIds = estrategias
        .filter(strategy => event.estrategias.includes(strategy.description))
        .map(strategy => strategy.strategyId.toString());

      const intervencionIds = intervenciones
        .filter(intervention => event.intervencion.includes(intervention.name))
        .map(intervention => intervention.interventionId.toString());

      const odsIds = odsList
        .filter(ods => event.ods.includes(ods.name))
        .map(ods => ods.odsId.toString());

      const recursosIds = recursos
        .filter(resource => event.recursos.includes(resource.name))
        .map(resource => resource.resourceId.toString());

      const campusObj = campuses.find(campus => campus.name === event.campus);
      const campusId = campusObj ? campusObj.campusId.toString() : '';

      const tipoCompraObj = purchaseTypes.find(pt => pt.name === event.tipoCompra);
      const tipoCompraId = tipoCompraObj ? tipoCompraObj.purchaseTypeId.toString() : '';

      const aporteUMES = event.aporteUMES ? [{
        financingSourceId: 1, // Asumiendo que el ID 1 es UMES
        percentage: (event.aporteUMES / event.costoTotal) * 100,
        amount: event.aporteUMES,
      }] : [];

      const aporteOtros = event.aporteOtros ? [{
        financingSourceId: 2, // Ajusta este ID según corresponda
        percentage: (event.aporteOtros / event.costoTotal) * 100,
        amount: event.aporteOtros,
      }] : [];

      const fechas = event.fechas.map(interval => ({
        start: new Date(interval.inicio),
        end: new Date(interval.fin),
      }));

      const newFila: FilaPlanificacion = {
        ...initialFila, // Reset to initialFila to avoid carrying over any existing data
        id: Date.now().toString(),
        areaEstrategica: areaEstrategicaId,
        objetivoEstrategico: objetivoEstrategicoId,
        estrategias: estrategiasIds,
        intervencion: intervencionIds,
        ods: odsIds,
        tipoEvento: event.tipoEvento,
        evento: event.evento,
        objetivo: event.objetivo,
        estado: 'planificado',
        costoTotal: event.costoTotal,
        aporteUMES: aporteUMES,
        aporteOtros: aporteOtros,
        tipoCompra: tipoCompraId,
        detalle: null, // Inicialmente nulo; se actualizará más adelante
        responsablePlanificacion: event.responsables.principal,
        responsableEjecucion: event.responsables.ejecucion,
        responsableSeguimiento: event.responsables.seguimiento,
        recursos: recursosIds,
        indicadorLogro: event.indicadorLogro,
        detalleProceso: null, // Inicialmente nulo; se actualizará más adelante
        fechas: fechas,
        fechaProyecto: fechas[0], // Asumiendo que el primer intervalo es para proyectos
        campusId: campusId,
        entityId: Number(event.id),
      };

      // Set the fila state
      setFila(newFila);
      toast.info("Evento cargado para edición.");

      // **Actualizar los estados de deshabilitación**
      setIsEstrategiasDisabled(!newFila.objetivoEstrategico);
      setIsIntervencionesDisabled(newFila.estrategias.length === 0);

      // URLs para descargar los archivos
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!baseUrl) {
        console.error("URL de la API no definida.");
        return;
      }

      const urlDetalleProceso = `${baseUrl}/api/fullevent/downloadProcessDocument/${event.id}`;
      const urlDetalle = `${baseUrl}/api/fullevent/downloadCostDetailDocument/${event.id}`;

      // Descargar los archivos
      const [archivoDetalleProceso, archivoDetalle] = await Promise.all([
        descargarArchivo(urlDetalleProceso, `detalle-proceso-${event.id}`),
        descargarArchivo(urlDetalle, `detalle-${event.id}`)
      ]);

      // Actualizar la fila con los archivos descargados
      setFila(prevFila => ({
        ...prevFila,
        detalleProceso: archivoDetalleProceso || null,
        detalle: archivoDetalle || null,
      }));

      if (archivoDetalleProceso || archivoDetalle) {
        toast.success("Archivos cargados correctamente.");
      } else {
        toast.warn("No se pudieron cargar algunos archivos.");
      }

    } catch (error) {
      console.error("Error en handleEditEvent:", error);
      toast.error("Ocurrió un error al editar el evento.")
    }
  };

  // Función para actualizar los campos de la fila
  const actualizarFila = (campo: keyof FilaPlanificacion, valor: any | null) => {
    setFila(prevFila => {
      const updatedFila = { ...prevFila, [campo]: valor }

      if (campo === 'tipoEvento') {
        if (valor === 'actividad') {
          updatedFila.fechaProyecto = { start: new Date(), end: new Date() } // Resetear fechaProyecto
        } else {
          updatedFila.fechas = [{ start: new Date(), end: new Date() }] // Resetear fechas
        }
      }

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

      if (campo === 'aporteOtros' || campo === 'aporteUMES') {
        const totalAporte = [...updatedFila.aporteUMES, ...updatedFila.aporteOtros].reduce((acc, aporte) => acc + aporte.amount, 0)
        updatedFila.costoTotal = totalAporte
        // Calculate the percentage for each contribution and round to two decimals
        const updatedAporteUMES = updatedFila.aporteUMES.map(aporte => ({
          ...aporte,
          percentage: totalAporte > 0 ? parseFloat(((aporte.amount / totalAporte) * 100).toFixed(2)) : 0,
        }))
        const updatedAporteOtros = updatedFila.aporteOtros.map(aporte => ({
          ...aporte,
          percentage: totalAporte > 0 ? parseFloat(((aporte.amount / totalAporte) * 100).toFixed(2)) : 0,
        }))
        updatedFila.aporteUMES = updatedAporteUMES
        updatedFila.aporteOtros = updatedAporteOtros
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

      // Determine if it's a creation (POST) or an update (PUT)
      const url = fila.entityId
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/fullevent/${fila.entityId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/fullEvent`

      const method = fila.entityId ? 'PUT' : 'POST'

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
        dates:
          fila.tipoEvento === 'actividad'
            ? fila.fechas.map((pair) => ({
                startDate: pair.start.toISOString().split('T')[0],
                endDate: pair.end.toISOString().split('T')[0],
              }))
            : [
                {
                  startDate: fila.fechaProyecto.start.toISOString().split('T')[0],
                  endDate: fila.fechaProyecto.end.toISOString().split('T')[0],
                },
              ],
        financings: [
          ...fila.aporteUMES.map(aporte => ({
            financingSourceId: aporte.financingSourceId,
            percentage: aporte.percentage,
            amount: aporte.amount,
          })),
          ...fila.aporteOtros.map(aporte => ({
            financingSourceId: aporte.financingSourceId,
            percentage: aporte.percentage,
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
        resources: fila.recursos.map((recurso: string) => ({
          resourceId: parseInt(recurso, 10),
        })),
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

      const response = await fetch(url, {
        method: method,
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

      toast.success(fila.entityId ? "Actividad actualizada exitosamente." : "Actividad enviada exitosamente.")

      setFila(prevFila => ({ 
        ...prevFila, 
        estado: 'aprobado', 
        entityId: result.eventId || prevFila.entityId 
      }))

      setFilaErrors({})

      // Restablecer el formulario a sus valores iniciales si es un nuevo registro
      if (!fila.entityId) {
        setFila(initialFila)
        setIsEstrategiasDisabled(true)
        setIsIntervencionesDisabled(true)
      }

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
            <Card>
              <CardHeader>
                <CardTitle>Información del evento</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2">
                <div>
                  <label className="block font-medium mb-2">Tipo de Evento</label>
                  <ActividadProyectoSelector
                    selectedOption={fila.tipoEvento}
                    onSelectOption={(tipo) => actualizarFila('tipoEvento', tipo)}
                    fechas={fila.fechas}
                    onChangeFechas={(fechas) => actualizarFila('fechas', fechas)}
                    fechaProyecto={fila.fechaProyecto}
                    onChangeFechaProyecto={(fecha) => actualizarFila('fechaProyecto', fecha)}
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
                  <label className="block font-medium my-2">Objetivo</label>
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
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Financiamiento del evento</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-x-6">
                <div>
                  <Label className="block font-medium mb-2">Costo total (GTQ) <br /><b>{fila.costoTotal.toFixed(2)}</b></Label>
                  {filaErrors?.costoTotal && (
                    <span className="text-red-500 text-sm">{filaErrors.costoTotal}</span>
                  )}
                </div>
                <div>
                  {/* Espacio vacío para alineación */}
                </div>
                <div>
                  <label className="block font-medium mb-2">Aporte de UMES</label>
                  <UMESFinancingComponent
                    contributions={fila.aporteUMES}
                    onChangeContributions={(aportes) => actualizarFila('aporteUMES', aportes)}
                    totalCost={fila.costoTotal}
                  />
                  {filaErrors?.aporteUMES && (
                    <span className="text-red-500 text-sm">{filaErrors.aporteUMES}</span>
                  )}
                </div>
                <div>
                  <label className="block font-medium mb-2">Aporte de otros</label>
                  <OtherFinancingSourceComponent
                    contributions={fila.aporteOtros}
                    onChangeContributions={(aportes) => actualizarFila('aporteOtros', aportes)}
                    totalCost={fila.costoTotal}
                  />
                  {filaErrors?.aporteOtros && (
                    <span className="text-red-500 text-sm">{filaErrors.aporteOtros}</span>
                  )}
                </div>
                <div>
                  <label className="block font-medium mb-2">Tipo de compra</label>
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
                  {fila.entityId && fila.detalle && (
                    <div className="flex items-center space-x-2 mt-2">
                      <span
                        className="cursor-pointer text-blue-600 hover:underline"
                        onClick={() => downloadFile(fila.entityId!, 'downloadCostDetailDocument')}
                      >
                        Descargar Detalle de Costos
                      </span>
                    </div>
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
              </CardContent>
            </Card>
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
              {fila.entityId && fila.detalleProceso && (
                <div className="flex items-center space-x-2 mt-2">
                  <span
                    className="cursor-pointer text-blue-600 hover:underline"
                    onClick={() => downloadFile(fila.entityId!, 'downloadProcessDocument')}
                  >
                    Descargar Detalle del Proceso
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-center">
        <Button onClick={enviarActividad} className="px-8 my-2 mb-6">Enviar Evento</Button>
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
          onEditEvent={handleEditEvent} // Pasamos la función aquí
        />
      ) : (
        <div>Cargando datos de la tabla de eventos...</div>
      )}
    </div>
  )
}
