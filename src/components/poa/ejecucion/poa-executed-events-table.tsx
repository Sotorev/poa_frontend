"use client"

import { Eye, Pencil, RotateCcw } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ResponseExecutedEvent } from "@/types/eventExecution.type"
import { useState } from "react"
import ExecutedEventDetailsDialog from "./executed-event-details-dialog"

type PoaExecutedEventsTableProps = {
  executedEvents: ResponseExecutedEvent[]
  onEdit: (event: ResponseExecutedEvent) => void
  onRestore: (eventId: number) => void
}

export function PoaExecutedEventsTable({ executedEvents, onEdit, onRestore }: PoaExecutedEventsTableProps) {
  const [selectedEvent, setSelectedEvent] = useState<ResponseExecutedEvent | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const handleViewDetails = (event: ResponseExecutedEvent) => {
    setSelectedEvent(event)
    setIsDetailsOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-GT", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-base font-semibold text-[#014A2D]">Nombre del Evento</TableHead>
            <TableHead className="text-base font-semibold text-[#014A2D]">Fechas de Ejecución</TableHead>
            <TableHead className="text-base font-semibold text-[#014A2D]">Gastos Reales</TableHead>
            <TableHead className="text-right text-base font-semibold text-[#014A2D]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.isArray(executedEvents) ? executedEvents.map((executedEvent) => (
            <TableRow key={executedEvent.eventId}>

              <TableCell className="font-medium text-gray-900 flex items-center gap-2">
                {executedEvent.eventDates.some(date => date.statusId === 1) ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Ya se han iniciado todas las fechas relacionadas con el evento</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  /** agregar un tooltip que diga Ya se han iniciado todas las fechas relacionadas con el evento */
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Ya se han iniciado todas las fechas relacionadas con el evento</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {executedEvent.name}
              </TableCell>
              <TableCell>
                <div className="space-y-2">
                  {executedEvent.eventDates.map((date) => (
                    date.statusId === 2 ? <div key={date.eventDateId} className="text-sm text-gray-600 font-medium">
                      {formatDate(date.executionStartDate)}
                    </div> : null
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(executedEvent)}
                    className="shrink-0 hover:bg-green-50"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver
                  </Button>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <TooltipProvider>
                  <div className="flex space-x-2 justify-end">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onEdit(executedEvent)}
                          className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Editar evento</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Editar evento</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onRestore(executedEvent.eventId)}
                          className="border-green-700 text-green-800 hover:bg-green-100 hover:text-green-900 transition-colors"
                        >
                          <RotateCcw className="h-4 w-4" />
                          <span className="sr-only">Restaurar a no ejecutado</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Restaurar a no ejecutado</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
              </TableCell>
            </TableRow>
          )) : null}
        </TableBody>
      </Table>

      {selectedEvent && (
        <ExecutedEventDetailsDialog
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          event={selectedEvent}
        />
      )}
    </>
  )
}

