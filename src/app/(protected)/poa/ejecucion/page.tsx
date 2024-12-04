'use client'

import { useState, useEffect, use } from 'react'
import { format } from "date-fns"
import { es } from "date-fns/locale"
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

// Imports for charge data
import { getFullEvents, getPoaByFacultyAndYear } from '@/services/apiService'
import { useCurrentUser } from '@/hooks/use-current-user'
import { getFacultyByUserId } from '@/services/faculty/currentFaculty'

// Datos de ejemplo - en una aplicación real, estos vendrían de una API o base de datos
const executedEventsExample = [
  {
    id: '1',
    name: 'Evento 1',
    executionDate: new Date(2023, 5, 15),
    actualExpenses: "1000.00",
    files: [new File([""], "documento1.pdf", { type: "application/pdf" })]
  },
  {
    id: '2',
    name: 'Evento 2',
    executionDate: new Date(2023, 6, 20),
    actualExpenses: "1500.00",
    files: [new File([""], "imagen1.jpg", { type: "image/jpeg" }), new File([""], "documento2.pdf", { type: "application/pdf" })]
  },
];

/**
 * Componente que gestiona y muestra los eventos ejecutados del POA (Plan Operativo Anual).
 * 
 * @component
 * @description
 * Este componente proporciona funcionalidad para ver, agregar y editar eventos ejecutados en el sistema POA.
 * Incluye una tabla de visualización de eventos y un diálogo de formulario para la gestión de eventos.
 * 
 * @características
 * - Muestra una tabla de eventos ejecutados con detalles como nombre, fecha de ejecución, gastos y archivos
 * - Permite agregar nuevos eventos a través de un formulario en diálogo
 * - Permite editar eventos existentes
 * - Se integra con la autenticación de usuarios
 * - Maneja archivos adjuntos
 * 
 * @estado
 * - events: Almacena la lista de eventos POA
 * - executedEvents: Mantiene los datos de eventos ejecutados
 * - isDialogOpen: Controla la visibilidad del diálogo del formulario de eventos
 * - editingEvent: Contiene los datos del evento que se está editando actualmente
 * 
 * @returns {JSX.Element} Un componente de página con una tabla de eventos ejecutados y controles de gestión
 */
export default function PoaTrackingPage() {
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [executedEvents, setExecutedEvents] = useState(executedEventsExample);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<typeof executedEvents[0] | undefined>();
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
   * Carga los eventos completos desde la API al montar el componente.
   */
  useEffect(() => {
    if (user === undefined || poa === undefined) return;

    console.log('POA:', poa);

    getFullEvents(user.token, poa.poaId)
      .then((events: ApiEvent[]) => {
        setEvents(events);
      });
  }, [user, poa]);

  const handleEdit = (event: typeof executedEvents[0]) => {
    setEditingEvent(event);
    setIsDialogOpen(true);
  };

  const handleSubmit = (data: { eventId: string; eventName: string; actualExpenses: string; executionDate: Date; files?: File[] }) => {
    const formattedData = {
      id: data.eventId || (events.length + 1).toString(),
      name: data.eventName,
      actualExpenses: data.actualExpenses,
      executionDate: data.executionDate,
      files: data.files || []
    };

    if (editingEvent) {
      // Actualizar evento existente
      setExecutedEvents(prevEvents =>
        prevEvents.map(event =>
          event.id === formattedData.id ? formattedData : event
        )
      );
    } else {
      // Agregar nuevo evento
      setExecutedEvents([...executedEventsExample, formattedData]);
    }
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
            {executedEvents.map((event) => (
              <TableRow key={event.id}>
                <TableCell>{event.name}</TableCell>
                <TableCell>{format(event.executionDate, "PPP", { locale: es })}</TableCell>
                <TableCell>Q{event.actualExpenses}</TableCell>
                <TableCell>{event.files?.length || 0} archivo(s)</TableCell>
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
          eventId: editingEvent.id,
          eventName: editingEvent.name,
          actualExpenses: editingEvent.actualExpenses,
          executionDate: editingEvent.executionDate,
          files: editingEvent.files
        } : undefined}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  )
}

