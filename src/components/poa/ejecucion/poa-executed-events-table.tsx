'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { es } from "date-fns/locale"

type ExecutedEvent = {
  id: string;
  name: string;
  executionDate: Date;
  actualExpenses: number;
};

type PoaExecutedEventsTableProps = {
  events: ExecutedEvent[];
  onEdit: (eventId: string) => void;
};

export function PoaExecutedEventsTable({ events, onEdit }: PoaExecutedEventsTableProps) {
  return (
    <div className="mt-8 overflow-x-auto">
      <h3 className="text-xl font-semibold mb-4">Eventos Ejecutados</h3>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre del Evento</TableHead>
              <TableHead>Fecha de Ejecución</TableHead>
              <TableHead>Gastos Reales</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events?.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="whitespace-nowrap">{event.name}</TableCell>
                <TableCell className="whitespace-nowrap">{format(event.executionDate, "dd/MM/yyyy", { locale: es })}</TableCell>
                <TableCell className="whitespace-nowrap">Q{event.actualExpenses.toFixed(2)}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => onEdit(event.id)}>
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

