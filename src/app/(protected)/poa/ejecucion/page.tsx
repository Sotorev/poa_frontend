'use client'

import { useState, useEffect, use } from 'react'
import { Plus } from 'lucide-react'

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PoaEventTrackingForm } from "@/components/poa/ejecucion/poa-event-tracking-form"

// Types
import { ApiEvent } from '@/types/interfaces'
import { EventExecution, FormValues, RequestEventExecution } from '@/types/eventExecution.type'

// Imports for charge data
import { getFullEvents, getPoaByFacultyAndYear } from '@/services/apiService'
import { useCurrentUser } from '@/hooks/use-current-user'
import { getFacultyByUserId } from '@/services/faculty/currentFaculty'
import { eventExecuted } from '@/services/poa/eventExecuted'

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
  const [executedEvents, setExecutedEvents] = useState<EventExecution[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventExecution>();
  const [facultyId, setFacultyId] = useState<any>();
  const [poa, setPoa] = useState<any>();
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

    getPoaByFacultyAndYear(facultyId, new Date().getFullYear(), user.token)
      .then((poa) => {
        setPoa(poa);
      });
  }, [user, facultyId]);


  /**
   * @description
   * Carga los eventos desde la API al montar el componente.
   * Los eventos se filtran por su statusId:
   * - statusId 1: Eventos activos (pendientes de ejecución)
   * - statusId 2: Eventos ejecutados
   * Los resultados filtrados se almacenan en los estados 'events' y 'executedEvents' respectivamente.
   * Los eventos se transforman al tipo EventExecution.
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
          financings: event.financings,
          costDetails: event.costDetails,
          statusId: event.statusId,
          eventApprovals: event.eventApprovals,
          files: [] // Initialize as empty File array since ApiFiles can't be directly converted
        } as EventExecution));

        setEvents(mappedEvents.filter(event => 
          (event.statusId === 1 && event.eventApprovals[0].approvalStatusId === 1)
        ));
        setExecutedEvents(mappedEvents.filter(event => 
          event.statusId === 2
        ));
      });
  }, [user, poa]);

  const handleEdit = (event: EventExecution) => {
    setEditingEvent(event);
    setIsDialogOpen(true);
  };

  const handleSubmit = (data: FormValues) => {
    console.log(data);
    const formattedData = {
      id: data.eventId || (executedEvents.length + 1).toString(),
      name: data.eventName,
      executionResponsible: data.executionResponsible,
      campus: data.campus,
      aportesUmes: data.aportesUmes,
      aportesOtros: data.aportesOtros,
      archivosGastos: data.archivosGastos,
      fechas: data.fechas
    };

    const requestPayload: RequestEventExecution = {
      eventId: parseInt(data.eventId, 10),
      eventExecutionDates: data.fechas.map(f => ({
        eventId: parseInt(data.eventId, 10),
        startDate: f.fecha,
        endDate: f.fecha,
      })),
      eventExecutionFinancings: [
        ...data.aportesUmes.map((um) => ({
          eventId: parseInt(data.eventId, 10),
          amount: um.amount,
          percentage: um.percentage,
          financingSourceId: um.financingSourceId,
        })),
        ...data.aportesOtros.map((ot) => ({
          eventId: parseInt(data.eventId, 10),
          amount: ot.amount,
          percentage: ot.percentage,
          financingSourceId: ot.financingSourceId,
        })),
      ],
    }

    eventExecuted(requestPayload, data.archivosGastos as File[])

    setEditingEvent(undefined);
    setIsDialogOpen(false);
  };

  const handleAddNew = () => {
    setEditingEvent(undefined);
    setIsDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold">Eventos Ejecutados</h1>
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Evento
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre del Evento</TableHead>
              <TableHead>Fecha de Ejecución</TableHead>
              <TableHead>Gastos Reales</TableHead>
              <TableHead>Archivos</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {executedEvents?.map((event) => (
              <TableRow key={event.eventId}>
                <TableCell>{event.name}</TableCell>
                {/* <TableCell>{format(event.executionDate, "PPP", { locale: es })}</TableCell>
                <TableCell>Q{event.actualExpenses}</TableCell> */}
                <TableCell>{event.costDetails?.length || 0} archivo(s)</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(event)}
                  >
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <PoaEventTrackingForm
        events={events}
        onSubmit={handleSubmit}
        initialData={editingEvent ? {
          eventId: `${editingEvent.eventId}`,
          eventName: editingEvent.name,
          executionResponsible: "",
          campus: "",
          aportesUmes: [{ eventId: editingEvent.eventId, amount: 0, percentage: 0, financingSourceId: 0 }],
          aportesOtros: [{ eventId: editingEvent.eventId, amount: 0, percentage: 0, financingSourceId: 0 }],
          archivosGastos: [],
          fechas: [{ fecha: "" }]
        } : undefined}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  )
}