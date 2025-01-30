// src/components/poa/ejecucion/poa-executed-events-table.tsx

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
import { ResponseExecutedEvent } from "@/types/eventExecution.type";

type PoaExecutedEventsTableProps = {
  executedEvents: ResponseExecutedEvent[];
  onEdit: (event: ResponseExecutedEvent) => void
};

export function PoaExecutedEventsTable({ executedEvents, onEdit }: PoaExecutedEventsTableProps) {
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre del Evento</TableHead>
            <TableHead>Fechas de Ejecución</TableHead>
            <TableHead>Gastos Reales</TableHead>
            <TableHead>Archivos</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {executedEvents?.map((executedEvent) => (
            <TableRow key={executedEvent.eventId}>
              <TableCell>{executedEvent.name}</TableCell>
              <TableCell>{executedEvent.eventExecutionDates?.[0]?.startDate}</TableCell>
              <TableCell>{executedEvent.eventExecutionFinancings?.[0]?.amount}</TableCell>
              <TableCell>{executedEvent.eventExecutionFiles?.length || 0} archivo(s)</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(executedEvent)}
                >
                  Editar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}

