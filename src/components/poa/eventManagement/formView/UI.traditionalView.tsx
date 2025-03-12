// src/components/poa/eventManagement/formView/formulario-planificacion.tsx

'use client'


// Libraries
import React, { useState, useEffect, useContext } from 'react'

// Components
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import EventsCorrectionsComponent from '../../sections/events-viewer/EventsCorrectionsComponent'

// Charge data
import { useCurrentUser } from '@/hooks/use-current-user'
import { getInterventions, getODS, getStrategicAreas, getStrategicObjectives, getStrategies, getResources, getCampuses, getPurchaseTypes, getPoaByFacultyAndYear, downloadFileAux } from './service.eventPlanningForm'
import { downloadFile } from '@/utils/downloadFile'

// Types
import { PlanningEvent, FilaPlanificacion, FilaError, ResponseFullEvent } from './type.eventPlanningForm'
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
import { filaPlanificacionSchema, FullEventRequest, UpdateEventRequest } from './schema.eventPlanningForm'
import { StrategicObjective, StrategicObjectiveSchema } from '@/schemas/strategicObjectiveSchema'
import { get } from 'http'
import { EventPlanningForm } from './UI.eventPlanningForm'

// Hooks
import { useToast } from '@/hooks/use-toast'
import { EventPlanningFormProvider } from './context.eventPlanningForm'

// Context
import { EventContext } from '../context.event'
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
  const { 
    setIsOpen,
    user,
    facultyId,
    setFacultyId,
    poaId,
    setPoaId,
    handleEditEvent } = useContext(EventContext)


  // unused
  const [strategicAreas, setStrategicAreas] = useState<StrategicArea[]>([])
  const [strategicObjectives, setStrategicObjectives] = useState<StrategicObjective[]>([])
  const [objetivoToAreaMap, setObjetivoToAreaMap] = useState<{ [key: string]: string }>({})

  const { toast } = useToast()

  // Estado para almacenar el evento que se está editando


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
    const fetchFacultyAndPoa = async () => {
      if (!user?.userId) {
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

        const responsePoa = await getPoaByFacultyAndYear(fetchedFacultyId, currentYear - 1, user?.token);
        const fetchedPoaId = responsePoa.poaId;

        setPoaId(fetchedPoaId);
      } catch (err) {
      }
    }

    fetchFacultyAndPoa()
  }, [user?.userId, user?.token])





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

  return (
    <div className="container mx-auto p-4">
      <EventPlanningFormProvider  >
        <EventPlanningForm
          addStrategicObjective={addStrategicObjective}
        />
      </EventPlanningFormProvider>

      <div className="flex justify-center">
        <Button onClick={() => { setIsOpen(true) }} className="px-8 my-2 mb-6">Agregar Evento</Button>
      </div>





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
