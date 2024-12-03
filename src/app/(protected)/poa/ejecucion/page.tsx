'use client'

import { useState } from 'react'
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

// Datos de ejemplo - en una aplicación real, estos vendrían de una API o base de datos
const executedEvents = [
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

export default function PoaTrackingPage() {
  const [events, setEvents] = useState(executedEvents);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<typeof executedEvents[0] | undefined>();

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
      setEvents(events.map(event => 
        event.id === formattedData.id ? formattedData : event
      ));
    } else {
      // Agregar nuevo evento
      setEvents([...events, formattedData]);
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
            {events.map((event) => (
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

