'use client'

import { useState, useEffect, useContext } from 'react'
import { Plus } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { PoaEventTrackingForm } from "@/components/poa/ejecucion/poa-event-tracking-form"

// Types
import { ApiEvent } from '@/types/interfaces'
import { EventExecution, FormValues, RequestEventExecution, UpdateEventExecutedPayload, ResponseExecutedEvent } from '@/types/eventExecution.type'

// Imports for charge data
import { getFullEvents, getPoaByFacultyAndYear } from '@/services/apiService'
import { useCurrentUser } from '@/hooks/use-current-user'
import { getFacultyByUserId } from '@/services/faculty/currentFaculty'
import { postEventExecuted, getEventExecutedByPoa, revertEventExecuted, updateEventExecuted } from '@/services/poa/eventExecuted'
import { PoaExecutedEventsTable } from '@/components/poa/ejecucion/poa-executed-events-table'

// Contexts
import { PoaContext } from '@/contexts/PoaContext'

/**
 * @component PoaTrackingPage
 * @description
 * Página que muestra y gestiona el seguimiento de eventos ejecutados del POA.
 * Permite visualizar, crear y editar eventos que han sido ejecutados.
 * Los eventos se filtran por estado, mostrando eventos activos (statusId: 1) y ejecutados (statusId: 2).
 * 
 * @features
 * - Carga automática de la facultad del usuario actual
 * - Carga del POA correspondiente al año actual
 * - Carga de eventos filtrados por estado
 * - Creación de nuevos eventos ejecutados
 * - Edición de eventos existentes
 * - Visualización en tabla con información detallada
 * - Gestión de archivos adjuntos por evento
 * 
 * @state
 * - events: Lista de eventos activos
 * - executedEvents: Lista de eventos ejecutados
 * - isDialogOpen: Control de visibilidad del diálogo de edición
 * - editingEvent: Evento actual en edición
 * - facultyId: ID de la facultad del usuario
 * - poa: Datos del POA actual
 * 
 * @requires
 * - Usuario autenticado
 * - Permisos de facultad
 * - Acceso a API de POA
 */
export default function PoaTrackingPage() {
  const [events, setEvents] = useState<EventExecution[]>([]);
  const [executedEvents, setExecutedEvents] = useState<ResponseExecutedEvent[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ResponseExecutedEvent>();
  const [facultyId, setFacultyId] = useState<any>();
  const [poa, setPoa] = useState<any>();
  const {selectedYear} = useContext(PoaContext)
  const user = useCurrentUser();

  /**
   * @description
   * Carga la facultad actual desde la API al montar el componente.
   */
  useEffect(() => {
    if (!user) return;

    getFacultyByUserId(user.userId, user.token)
      .then((facultyId) => {
        setFacultyId(facultyId);
      });
  }, [user]);

  /**
   * @description
   * Carga el POA actual desde la API al montar el componente.
   */
  useEffect(() => {
    if (user === undefined || facultyId === undefined) return;

    getPoaByFacultyAndYear(facultyId, selectedYear, user.token)
      .then((poa) => {
        setPoa(poa);
      });
  }, [user, facultyId, selectedYear]);


  /**
   * @description
   * Carga y gestiona los eventos desde la API cuando el componente se monta o cuando cambian user/poa.
   * 
   * Proceso:
   * 1. Obtiene eventos completos usando getFullEvents
   * 2. Transforma los eventos API al formato EventExecution
   * 3. Filtra eventos por:
   *    - Eventos activos (statusId: 1)
   *    - Eventos aprobados (approvalStatusId: 1)
   * 4. Si existe un POA, carga eventos ejecutados usando getEventExecutedByPoa
   * 
   * Estados actualizados:
   * - events: Almacena eventos activos filtrados
   * - executedEvents: Almacena eventos ya ejecutados
   * 
   * @dependencies user, poa
   */
  useEffect(() => {
    if (user === undefined || poa === undefined) return;

    getFullEvents(user.token, poa.poaId)
      .then((events: ApiEvent[]) => {
        const mappedEvents = events.map(event => ({
          eventId: event.eventId,
          name: event.name,
          objective: event.objective,
          campus: event.campus,
          responsibles: event.responsibles,
          totalCost: event.totalCost,
          dates: event.dates,
          financings: event.financings.map((f: any) => ({
            eventExecutionFinancingId: f.eventFinancingId, // default value
            eventId: f.eventId,
            amount: f.amount,
            percentage: f.percentage,
            financingSourceId: f.financingSourceId,
          })),
          costDetails: event.costDetails,
          statusId: event.dates.map(date => date.statusId),
          eventApprovals: event.eventApprovals,
          files: []

        } as EventExecution));

        setEvents(mappedEvents.filter(event =>
          (event.eventApprovals[0].approvalStatusId === 1 && !event.dates.some(date => date.statusId === 3 || date.statusId === 2))
        ));
      });

    if (poa?.poaId) {
      getEventExecutedByPoa(poa.poaId).then((executedEvents) => {
        setExecutedEvents(executedEvents);
      });
    }
  }, [user, poa]);

  const handleEdit = (event: ResponseExecutedEvent) => {
    event.eventDates = event.eventDates.filter(d => d.statusId !== 3);

    event.eventDates = event.eventDates.map(d => ({
      ...d,
      isEnabled : d.statusId === 2 ? true : false,
      executionStartDate: d.statusId === 2 ? d.executionStartDate : d.startDate
    }));

    setEditingEvent(event);

    setIsDialogOpen(true);
  };

  const handleSubmit = (data: FormValues) => {
    // Filtrar solo las fechas habilitadas
    const enabledDates = data.fechas.filter(fecha => fecha.isEnabled !== false);

    if (editingEvent) {
      const updatePayload = {
        eventId: parseInt(data.eventId, 10),
        eventDatesWithExecution: enabledDates.map(f => ({
          eventId: parseInt(data.eventId, 10),
          eventDateId: f.eventDateId,
          executionStartDate: f.executionStartDate || f.startDate
        })),
        eventExecutionFinancings: [
          ...data.aportesUmes.map(um => ({
            eventExecutionFinancingId: um.eventExecutionFinancingId,
            eventId: parseInt(data.eventId, 10),
            amount: um.amount,
            percentage: um.percentage,
            financingSourceId: um.financingSourceId
          })),
          ...data.aportesOtros.map(ot => ({
            eventExecutionFinancingId: ot.eventExecutionFinancingId,
            eventId: parseInt(data.eventId, 10),
            amount: ot.amount,
            percentage: ot.percentage,
            financingSourceId: ot.financingSourceId
          })),
        ],
      };
      updateEventExecuted(parseInt(data.eventId, 10), updatePayload, data.archivosGastos as File[])
        .then(() => {
          if (!poa) return
          getEventExecutedByPoa(poa.poaId).then((updatedExecutedEvents) => {
            setExecutedEvents(updatedExecutedEvents)
          })
        })
    } else {
      const requestPayload: RequestEventExecution = {
        eventId: parseInt(data.eventId, 10),
        eventDatesWithExecution: enabledDates.map(f => ({
          eventId: parseInt(data.eventId, 10),
          eventDateId: f.eventDateId,
          executionStartDate: f.executionStartDate || f.startDate,
        })),
        eventExecutionFinancings: [
          ...data.aportesUmes.map(um => ({
            eventExecutionFinancingId: um.eventExecutionFinancingId,
            eventId: parseInt(data.eventId, 10),
            amount: um.amount,
            percentage: um.percentage,
            financingSourceId: um.financingSourceId,
          })),
          ...data.aportesOtros.map(ot => ({
            eventExecutionFinancingId: ot.eventExecutionFinancingId,
            eventId: parseInt(data.eventId, 10),
            amount: ot.amount,
            percentage: ot.percentage,
            financingSourceId: ot.financingSourceId,
          })),
        ],
      };
      postEventExecuted(requestPayload, data.archivosGastos as File[])
        .then(() => {
          if (!poa) return
          getEventExecutedByPoa(poa.poaId).then((updatedExecutedEvents) => {
            setExecutedEvents(updatedExecutedEvents)
          })

          if (!user) return
          getFullEvents(user.token, poa.poaId)
            .then((events: ApiEvent[]) => {
              const mappedEvents = events.map(event => ({
                eventId: event.eventId,
                name: event.name,
                objective: event.objective,
                campus: event.campus,
                responsibles: event.responsibles,
                totalCost: event.totalCost,
                dates: event.dates,
                financings: event.financings.map((f: any) => ({
                  eventExecutionFinancingId: f.eventFinancingId, // default value
                  eventId: f.eventId,
                  amount: f.amount,
                  percentage: f.percentage,
                  financingSourceId: f.financingSourceId,
                })),
                costDetails: event.costDetails,
                statusId: event.dates.map(date => date.statusId),
                eventApprovals: event.eventApprovals,
                files: []
              } as EventExecution));

              setEvents(mappedEvents.filter(event =>
                (event.eventApprovals[0].approvalStatusId === 1 && !event.dates.some(date => date.statusId === 3 || date.statusId === 2))
              ));

              console.log("Eventos actualizados", events);
            });

        })
    }
    setEditingEvent(undefined);
    setIsDialogOpen(false);
  };

  const handleAddNew = () => {
    setEditingEvent(undefined);
    setIsDialogOpen(true);
  };

  const handleRestore = (eventId: number, eventDateIds: number[]) => {
    revertEventExecuted(eventId, eventDateIds )
      .then(() => {
        if (!poa) return
        getEventExecutedByPoa(poa.poaId).then((updatedExecutedEvents) => {
          setExecutedEvents(updatedExecutedEvents)
        })

        if (!user) return
        getFullEvents(user.token, poa.poaId)
          .then((events: ApiEvent[]) => {
            const mappedEvents = events.map(event => ({
              eventId: event.eventId,
              name: event.name,
              objective: event.objective,
              campus: event.campus,
              responsibles: event.responsibles,
              totalCost: event.totalCost,
              dates: event.dates,
              financings: event.financings.map((f: any) => ({
                eventExecutionFinancingId: f.eventFinancingId, // default value
                eventId: f.eventId,
                amount: f.amount,
                percentage: f.percentage,
                financingSourceId: f.financingSourceId,
              })),
              costDetails: event.costDetails,
              statusId: event.dates.map(date => date.statusId),
              eventApprovals: event.eventApprovals,
              files: []
            } as EventExecution));

            setEvents(mappedEvents.filter(event =>
              (event.statusId.includes(1) && event.eventApprovals[0].approvalStatusId === 1)
            ));
          });
      })
  }

  return (
    <div className="container mx-auto py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold">Eventos Ejecutados</h1>
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Marcar fecha de inicio de ejecución
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <PoaExecutedEventsTable executedEvents={executedEvents} onEdit={handleEdit} onRestore={handleRestore} />

      </div>

      <PoaEventTrackingForm
        events={events}
        onSubmit={handleSubmit}
        initialData={editingEvent ? {
          eventId: editingEvent.eventId.toString(),
          eventName: editingEvent.name,
          executionResponsible: editingEvent.eventResponsibles.find(r => r.responsibleRole === "Ejecución")?.name || "",
          campus: editingEvent.campus || "",
          aportesUmes: editingEvent.eventExecutionFinancings?.filter(f => [1, 4, 5, 7].includes(f.financingSourceId)).map(f => ({
            ...f,
            eventId: editingEvent.eventId
          })) || [],
          aportesOtros: editingEvent.eventExecutionFinancings?.filter(f => [2, 3, 6].includes(f.financingSourceId)).map(f => ({
            ...f,
            eventId: editingEvent.eventId
          })) || [],
          archivosGastos: editingEvent.eventExecutionFiles?.map(f => new File([], f.fileName)) || [],
          fechas: editingEvent.eventDates || []
        } : undefined}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  )
}