// src/components/poa/eventManagement/formView/formulario-planificacion.tsx

'use client'


// Libraries
import React, { useState, useEffect } from 'react'

// Components
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import EventsCorrectionsComponent from '../../sections/events-viewer/EventsCorrectionsComponent'

// Charge data
import { useCurrentUser } from '@/hooks/use-current-user'
import { getInterventions, getODS, getStrategicAreas, getStrategicObjectives, getStrategies, getResources, getCampuses, getPurchaseTypes, getPoaByFacultyAndYear, downloadFileAux } from './eventPlanningForm.service'
import { downloadFile } from '@/utils/downloadFile'

// Types
import { PlanningEvent, FilaPlanificacion, FilaError, ResponseFullEvent } from './eventPlanningForm.type'
import { PurchaseType } from '@/types/PurchaseType'
import { Strategy } from '@/types/Strategy'
import { Intervention } from '@/types/Intervention'
import { ODS } from '@/types/ods'
import { Resource } from '@/types/Resource'
import { Campus } from '@/types/Campus'
import { FinancingSource } from '@/types/FinancingSource'
import { StrategicArea } from '@/types/StrategicArea'

// Schemas
import { strategicAreasSchema } from '@/schemas/strategicAreaSchema'
import { filaPlanificacionSchema, FullEventRequest } from './eventPlanningForm.schema'
import { StrategicObjective, StrategicObjectiveSchema } from '@/schemas/strategicObjectiveSchema'
import { get } from 'http'
import { EventPlanningForm } from './eventPlanningForm'

// Hooks
import { useToast } from '@/hooks/use-toast'
import { useTraditionalView } from './useTraditionalView'

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
    costDetails: "Detalle de Costos",
    campusId: "Campus",
    responsablePlanificacion: "Responsable de Planificación",
    responsableEjecucion: "Responsable de Ejecución",
    responsableSeguimiento: "Responsable de Seguimiento",
    recursos: "Recursos",
    indicadorLogro: "Indicador de Logro",
    fechas: "Fechas",
    files: "Detalle del Proceso",
    comentarioDecano: "Comentario Decano",
    processDocument: "Documento de Proceso",
  }
  return columnMap[field] || field
}

export function TraditionalView() {
  const user = useCurrentUser();

  // unused
  const [fila, setFila] = useState<FilaPlanificacion>()
  const [filaErrors, setFilaErrors] = useState<FilaError>({})
  const [facultyId, setFacultyId] = useState<number | null>(null)
  const [poaId, setPoaId] = useState<number | null>(null)
  const [loadingPoa, setLoadingPoa] = useState<boolean>(false)
  const [errorPoa, setErrorPoa] = useState<string | null>(null)

  const [objetivoToAreaMap, setObjetivoToAreaMap] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)



  const [eventRequest, setEventRequest] = useState<FullEventRequest>()
  const [financingSources, setFinancingSources] = useState<FinancingSource[]>([]);
  const [strategicAreas, setStrategicAreas] = useState<StrategicArea[]>([])
  const [strategicObjectives, setStrategicObjectives] = useState<StrategicObjective[]>([])
  const [isErrorModalOpen, setIsErrorModalOpen] = useState<boolean>(false)
  const [modalErrorList, setModalErrorList] = useState<{ column: string, message: string }[]>([])
  const [estrategias, setEstrategias] = useState<Strategy[]>([])
  const [intervenciones, setIntervenciones] = useState<Intervention[]>([])
  const [odsList, setOdsList] = useState<ODS[]>([])
  const [recursos, setRecursos] = useState<Resource[]>([])
  const [campuses, setCampuses] = useState<Campus[]>([])
  const [purchaseTypes, setPurchaseTypes] = useState<PurchaseType[]>([])

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false)

  const {
    isOpen,
    setIsOpen,
    fields,
    getValues,
    register,
    setValue,
    control,
    handleSubmit,
    reset,
    watch,
    append,
    remove,
    selectedStrategicArea,
    selectedStrategicObjective,
    setSelectedStrategicObjective,
    selectedStrategies,
    setSelectedStrategies,
  } = useTraditionalView()

  const { toast } = useToast()

  /**
 * Effect hook to fetch initial data required for the planning form
 * 
 * Fetches and sets the following data:
 * - Strategic Areas
 * - Strategic Objectives  
 * - Strategies
 * - Interventions
 * - ODS (Sustainable Development Goals)
 * - Resources
 * - Campuses
 * - Purchase Types
 * 
 * Also creates a mapping between Strategic Objectives and their corresponding Strategic Areas
 * for easier data relationship management.
 * 
 * @dependencies Requires user token for API authentication
 * @sideEffects 
 * - Updates multiple state variables with fetched data
 * - Creates and sets mapping between objectives and areas
 */
  useEffect(() => {
    setLoading(true)
    if (!user?.token) return

    /**
     * Fetches and initializes all necessary data for the planning form.
     * This function performs multiple API calls to retrieve different types of data:
     * - Strategic Areas
     * - Strategic Objectives
     * - Strategies
     * - Interventions
     * - ODS (Sustainable Development Goals)
     * - Resources
     * - Campuses
     * - Purchase Types
     * 
     * After fetching the data, it creates a mapping between Strategic Objectives and their
     * corresponding Strategic Areas for easier reference.
     * 
     * @async
     * @function fetchData
     * @throws {Error} Possible network errors during API calls
     * 
     * @example
     * await fetchData();
     * 
     * @remarks
     * - All API calls require a valid user token
     * - The function updates multiple state variables using their respective setters
     */
    const fetchData = async () => {

      // Load Data
      const responseStrategicAreas = await getStrategicAreas(user?.token);
      setStrategicAreas(responseStrategicAreas);

      const responseStrategicObjectives = await getStrategicObjectives(user?.token);
      setStrategicObjectives(responseStrategicObjectives);

      const responseEstrategias = await getStrategies(user?.token);
      setEstrategias(responseEstrategias);

      const responseIntervenciones = await getInterventions(user?.token);
      setIntervenciones(responseIntervenciones);

      const responseODS = await getODS(user?.token);
      setOdsList(responseODS);

      const responseRecursos = await getResources(user?.token);
      setRecursos(responseRecursos);

      const responseCampuses = await getCampuses(user?.token);
      setCampuses(responseCampuses);

      const responsePurchaseTypes = await getPurchaseTypes(user?.token);
      setPurchaseTypes(responsePurchaseTypes);

      // Map Objetivo Estratégico to Área Estratégica
      const map: { [key: string]: string } = {};
      responseStrategicObjectives.forEach((obj: StrategicObjective) => {
        const areaMatched = responseStrategicAreas.find(area => area.strategicAreaId === obj.strategicAreaId);
        if (areaMatched) {
          map[obj.strategicObjectiveId.toString()] = areaMatched.name;
        } else {

        }
      });
      setObjetivoToAreaMap(map);
    }

    fetchData()
  }, [user?.token])

  /**
   * Effect hook to fetch faculty and POA data for the current user.
   * 
   * Fetches faculty and POA data for the current user.
   * 
   * @dependencies Requires user ID and token
   * 
   * @sideEffects
   * - Updates facultyId state with fetched faculty ID
   * - Updates poaId state with fetched POA ID
   * - Sets loadingPoa state during fetch operation
   * - Sets errorPoa state when an error occurs
   * 
   */
  useEffect(() => {
    /**
     * Fetches faculty and POA data for the current user.
     * 
     * This asynchronous function performs two main operations:
     * 1. Retrieves user data to get the faculty ID
     * 2. Fetches POA (Plan Operativo Anual) data for the faculty from the previous year
     * 
     * @throws {Error} When API URL is not defined in environment variables
     * @throws {Error} When user data fetch fails
     * @throws {Error} When POA data fetch fails
     * 
     * @requires process.env.NEXT_PUBLIC_API_URL - API base URL
     * @requires userId - Current user ID
     * @requires user.token - Authentication token
     * 
     * @effects
     * - Sets facultyId state with fetched faculty ID
     * - Sets poaId state with fetched POA ID
     * - Sets loadingPoa state during fetch operation
     * - Sets errorPoa state when an error occurs
     */
    const fetchFacultyAndPoa = async () => {
      if (!user?.userId) {
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
        const responseUser = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user.userId}`, { headers });
        if (!responseUser.ok) throw new Error(`Error al obtener datos del usuario: ${responseUser.statusText}`);
        const dataUser = await responseUser.json();
        const fetchedFacultyId = dataUser.facultyId;
        setFacultyId(fetchedFacultyId);

        const currentYear = new Date().getFullYear();

        // Fetch POA
        setLoadingPoa(true);

        const responsePoa = await getPoaByFacultyAndYear(fetchedFacultyId, currentYear - 1, user?.token);
        const fetchedPoaId = responsePoa.poaId;

        setPoaId(fetchedPoaId);
      } catch (err) {
        setErrorPoa((err as Error).message);
        console.error(err);
      } finally {
        setLoadingPoa(false);
      }
    }

    fetchFacultyAndPoa()
  }, [user?.userId, user?.token])

  // Función para manejar la edición de un evento (Actualizar)
  const handleEditEvent = async (event: PlanningEvent) => {
    // try {
    //   // Mapeo de datos existente
    //   const areaEstrategicaObj = strategicAreas.find(area => area.name === event.areaEstrategica);
    //   const areaEstrategicaId = areaEstrategicaObj ? areaEstrategicaObj.name : '';

    //   const objetivoEstrategicoObj = strategicObjectives.find(obj => obj.description === event.objetivoEstrategico);
    //   const objetivoEstrategicoId = objetivoEstrategicoObj ? objetivoEstrategicoObj.strategicObjectiveId.toString() : '';

    //   const estrategiasIds = estrategias
    //     .filter(strategy => event.estrategias.includes(strategy.description))
    //     .map(strategy => strategy.strategyId.toString());

    //   const intervencionIds = intervenciones
    //     .filter(intervention => event.intervencion.includes(intervention.name))
    //     .map(intervention => intervention.interventionId.toString());

    //   const odsIds = odsList
    //     .filter(ods => event.ods.includes(ods.name))
    //     .map(ods => ods.odsId.toString());

    //   const recursosIds = recursos
    //     .filter(resource => event.recursos.includes(resource.name))
    //     .map(resource => resource.resourceId.toString());

    //   const campusObj = campuses.find(campus => campus.name === event.campus);
    //   const campusId = campusObj ? campusObj.campusId.toString() : '';

    //   const tipoCompraObj = purchaseTypes.find(pt => pt.name === event.tipoCompra);
    //   const tipoCompraId = tipoCompraObj ? tipoCompraObj.purchaseTypeId.toString() : '';

    //   // Cálculo de aportes financieros
    //   const aporteUMES = Array.isArray(event.aporteUMES) ? event.aporteUMES.map(aporte => ({
    //     financingSourceId: aporte.financingSourceId,
    //     percentage: aporte.percentage,
    //     amount: aporte.amount,
    //   })) : [];



    //   const aporteOtros = Array.isArray(event.aporteOtros) ? event.aporteOtros.map(aporte => ({
    //     financingSourceId: aporte.financingSourceId,
    //     percentage: aporte.percentage,
    //     amount: aporte.amount,
    //   })) : [];



    //   const fechas = event.fechas.map(interval => ({
    //     start: new Date(interval.inicio),
    //     end: new Date(interval.fin),
    //   }));



    //   // Set the fila state
    //   toast.info("Evento cargado para edición.");

    //   // **Actualizar los estados de deshabilitación**
    //   setIsEstrategiasDisabled(!objetivoEstrategico);
    //   setIsIntervencionesDisabled(estrategias.length === 0);

    //   // URLs para descargar los archivos
    //   const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    //   if (!baseUrl) {
    //     console.error("URL de la API no definida.");
    //     return;
    //   }

    //   // Download cost detail documents
    //   const costDetailDownloads = event.detalle.map(async (doc) => {
    //     const url = `/api/fullEvent/downloadEventCostDetailDocumentById/${doc.id}`;
    //     return downloadFileAux(url, doc.name, user?.token);
    //   });

    //   // Download process detail documents
    //   const processDetailDownloads = event.detalleProceso.map(async (doc) => {
    //     const url = `/api/fullEvent/downloadEventFileById/${doc.id}`;
    //     return downloadFileAux(url, doc.name, user?.token);
    //   });

    //   try {
    //     const [costDetailFiles, processFiles] = await Promise.all([
    //       Promise.all(costDetailDownloads),
    //       Promise.all(processDetailDownloads)
    //     ]);

    //     // Filter out any null values from failed downloads
    //     const validCostDetailFiles = costDetailFiles.filter((file): file is File => file !== null);
    //     const validProcessFiles = processFiles.filter((file): file is File => file !== null);

    //     if (validCostDetailFiles.length > 0 || validProcessFiles.length > 0) {
    //       toast.success("Archivos cargados correctamente.");
    //     } else {
    //       toast.warn("No se pudieron cargar algunos archivos.");
    //     }
    //   } catch (error) {
    //     toast.error("Error al cargar los archivos del evento.");
    //   }

    // } catch (error) {
    //   toast.error("Ocurrió un error al editar el evento.")
    // }
  };

  // Función para actualizar los campos de la fila (Actualizar)
  const updateField = (field: keyof FilaPlanificacion, value: any | null) => {

    const updatedFila = { [field]: value }

    if (field === 'tipoEvento') {
      if (value === 'actividad') {
        updatedFila.fechaProyecto = { start: new Date(), end: new Date() } // Resetear fechaProyecto
      } else {
        updatedFila.fechas = [{ start: new Date(), end: new Date() }] // Resetear fechas
      }
    }

    if (field === 'objetivoEstrategico') {
      updatedFila.areaEstrategica = objetivoToAreaMap[value] || ''
      // Resetear estrategias e intervenciones si el objetivo estratégico cambia
      if (!value) {
        updatedFila.estrategias = []
        updatedFila.intervencion = []
      }
    }


    // if (campo === 'aporteOtros' || campo === 'aporteUMES') {
    //   const totalAporte vencionesDisabled((value as string[]).length === 0)= [...updatedFila.aporteUMES, ...updatedFila.aporteOtros].reduce((acc, aporte) => acc + aporte.amount, 0)
    //   updatedFila.costoTotal = totalAporte
    //   // Calculate the percentage for each contribution and round to two decimals
    //   const updatedAporteUMES = updatedFila.aporteUMES.map(aporte => ({
    //     ...aporte,
    //     percentage: totalAporte > 0 ? parseFloat(((aporte.amount / totalAporte) * 100).toFixed(2)) : 0,
    //   }))
    //   const updatedAporteOtros = updatedFila.aporteOtros.map(aporte => ({
    //     ...aporte,
    //     percentage: totalAporte > 0 ? parseFloat(((aporte.amount / totalAporte) * 100).toFixed(2)) : 0,
    //   }))
    //   updatedFila.aporteUMES = updatedAporteUMES
    //   updatedFila.aporteOtros = updatedAporteOtros
    // }
    return updatedFila

  }

  // Añadir un nuevo objetivo estratégico (Actualizar)
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
    toast({
      title: "Agregado",
      description: "Nuevo objetivo estratégico agregado.",
      variant: "success",
    });
  }

  const enviarActividad = async () => {
    if (loadingPoa) {
      toast(
        {
          title: "Cargando",
          description: "Aún se está obteniendo el poaId. Por favor, espera un momento.",
        }
      )
      return
    }

    if (errorPoa) {
      toast({
        title: "Error",
        description: `No se puede enviar la actividad debido a un error: ${errorPoa}`,
        variant: "destructive",
      })
      return
    }

    if (!poaId) {
      toast({
        title: "Error",
        description: "No se puede enviar la actividad sin un poaId.",
        variant: "destructive",
      })
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
      toast({
        title: "Error",
        description: "Hay errores en el formulario. Por favor, revisa los campos.",
        variant: "destructive",
      })
      console.error("Error de validación:", validation.error.errors)
      return
    }

    if (!fila?.costDetailDocuments) {
      setIsConfirmModalOpen(true)
      return
    }

    await enviarAlBackend()
  }

  const enviarAlBackend = async () => {
    // try {
    //   if (!process.env.NEXT_PUBLIC_API_URL) {
    //     throw new Error("La URL de la API no está definida.")
    //   }

    //   // Determine if it's a creation (POST) or an update (PUT)
    //   const url = fila.entityId
    //     ? `${process.env.NEXT_PUBLIC_API_URL}/api/fullevent/${fila.entityId}`
    //     : `${process.env.NEXT_PUBLIC_API_URL}/api/fullEvent`

    //   const method = fila.entityId ? 'PUT' : 'POST'

    //   const eventData = {
    //     name: fila.evento.trim(),
    //     type: fila.tipoEvento === 'actividad' ? 'Actividad' : 'Proyecto',
    //     poaId: poaId,
    //     statusId: 1,
    //     completionPercentage: 0,
    //     campusId: parseInt(fila.campusId, 10),
    //     objective: fila.objetivo.trim(),
    //     eventNature: 'Planificado',
    //     isDelayed: false,
    //     achievementIndicator: fila.indicadorLogro.trim(),
    //     purchaseTypeId: parseInt(fila.tipoCompra, 10),
    //     totalCost: fila.costoTotal,
    //     dates:
    //       fila.tipoEvento === 'actividad'
    //         ? fila.fechas.map((pair) => ({
    //           startDate: pair.start.toISOString().split('T')[0],
    //           endDate: pair.end.toISOString().split('T')[0],
    //         }))
    //         : [
    //           {
    //             startDate: fila.fechaProyecto.start.toISOString().split('T')[0],
    //             endDate: fila.fechaProyecto.end.toISOString().split('T')[0],
    //           },
    //         ],
    //     financings: [
    //       ...fila.aporteUMES.map(aporte => ({
    //         financingSourceId: aporte.financingSourceId,
    //         percentage: aporte.percentage,
    //         amount: aporte.amount,
    //       })),
    //       ...fila.aporteOtros.map(aporte => ({
    //         financingSourceId: aporte.financingSourceId,
    //         percentage: aporte.percentage,
    //         amount: aporte.amount,
    //       })),
    //     ],
    //     approvals: [],
    //     responsibles: [
    //       {
    //         responsibleRole: 'Principal',
    //         name: fila.responsablePlanificacion.trim(),
    //       },
    //       {
    //         responsibleRole: 'Ejecución',
    //         name: fila.responsableEjecucion.trim(),
    //       },
    //       {
    //         responsibleRole: 'Seguimiento',
    //         name: fila.responsableSeguimiento.trim(),
    //       },
    //     ],
    //     interventions: fila.intervencion.map(id => parseInt(id, 10)).filter(id => !isNaN(id)),
    //     ods: fila.ods.map(id => parseInt(id, 10)).filter(id => !isNaN(id)),
    //     resources: fila.recursos.map((recurso: string) => ({
    //       resourceId: parseInt(recurso, 10),
    //     })),
    //     userId: userId,
    //   }

    //   console.log("Datos a enviar:", eventData)

    //   const formData = new FormData()
    //   formData.append('data', JSON.stringify(eventData))

    //   if (fila.costDetailDocuments) {
    //     fila.costDetailDocuments.forEach((file: File) => {
    //       formData.append('costDetailDocuments', file);
    //     });
    //   }

    //   if (fila.processDocuments) {
    //     fila.processDocuments.forEach((file: File) => {
    //       formData.append('processDocuments', file);
    //     });
    //   }

    //   const response = await fetch(url, {
    //     method: method,
    //     headers: {
    //       'Authorization': `Bearer ${user?.token}`
    //     },
    //     body: formData,
    //   })

    //   if (!response.ok) {
    //     const errorData = await response.json()
    //     throw new Error(`Error al enviar la actividad: ${errorData.message || response.statusText}`)
    //   }

    //   const result = await response.json()
    //   console.log(`Actividad enviada exitosamente:`, result)

    //   toast.success(fila.entityId ? "Actividad actualizada exitosamente." : "Actividad enviada exitosamente.")

    //   setFila(prevFila => ({
    //     ...prevFila,
    //     estado: 'aprobado',
    //     entityId: result.eventId || prevFila.entityId
    //   }))

    //   setFilaErrors({})

    //   // Restablecer el formulario a sus valores iniciales si es un nuevo registro
    //   if (!fila.entityId) {
    //     setFila(initialFila)
    //     setIsEstrategiasDisabled(true)
    //     setIsIntervencionesDisabled(true)
    //   }

    // } catch (err) {
    //   console.error(err)
    //   toast.error(`Error al enviar la actividad: ${(err as Error).message}`)
    // }
  }

  const confirmarEnvioSinDetalle = async () => {
    await enviarAlBackend()
    setIsConfirmModalOpen(false)
  }

  // if (loading || loadingPoa) return <div className="flex justify-center items-center h-screen">Cargando datos...</div>
  // if (error) return <div className="text-red-500 text-center">Error: {error}</div>
  // if (errorPoa) return <div className="text-red-500 text-center">Error al obtener poaId: {errorPoa}</div>

  // const strategicObjective = strategicObjectives.find(
  //   (obj) => obj.strategicObjectiveId.toString() === fila.objetivoEstrategico
  // )

  // const strategicObjectiveId = strategicObjective
  //   ? strategicObjective.strategicObjectiveId
  //   : 0

  return (
    <div className="container mx-auto p-4">
      <EventPlanningForm
        isOpen={isOpen}
        onClose={() => { setIsOpen(false) }}
        event={undefined}
        updateField={(field, value) => updateField(field as keyof FilaPlanificacion, value)}
        addStrategicObjective={addStrategicObjective}
        financingSources={financingSources}
        fields={fields}
        watch={watch}
        getValues={getValues}
        register={register}
        setValue={setValue}
        append={append}
        remove={remove}
        selectedStrategicArea={selectedStrategicArea}
        selectedStrategicObjective={selectedStrategicObjective}
        setSelectedStrategicObjective={setSelectedStrategicObjective}
        selectedStrategies={selectedStrategies}
        setSelectedStrategies={setSelectedStrategies}
        control={control}
      />

      <div className="flex justify-center">
        <Button onClick={() => { setIsOpen(true) }} className="px-8 my-2 mb-6">Agregar Evento</Button>
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

      {poaId && facultyId && user?.userId ? (
        <EventsCorrectionsComponent
          name="Revisión de eventos"
          isActive={false}
          poaId={poaId}
          facultyId={facultyId}
          isEditable={false}
          userId={user.userId}
          onEditEvent={handleEditEvent}
        />
      ) : (
        <div>Cargando datos de la tabla de eventos...</div>
      )}
    </div>
  )
}
