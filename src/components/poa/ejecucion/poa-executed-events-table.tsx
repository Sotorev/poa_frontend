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
  onRestore: (eventId: number, eventDateIds: number[]) => void
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
              {/** TODO: Nombre del evento y tooltip con el numero de fechas por iniciar */}
              <TableCell className="font-medium text-gray-900 flex items-center gap-2">
                <TooltipProvider>
                  {executedEvent.eventDates.some(date => date.statusId === 1) ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2"> 
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <p>{executedEvent.name}</p>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {executedEvent.eventDates.filter(date => date.statusId === 1).length} <p>Fecha(s) por iniciar</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <p>{executedEvent.name}</p>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Ya se han iniciado todas las fechas relacionadas con el evento</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </TooltipProvider>
              </TableCell>
              {/** TODO: Fechas de ejecución */}
              <TableCell>
                <div className="space-y-2">
                  {executedEvent.eventDates.map((date) => (
                    date.statusId === 2 ? <div key={date.eventDateId} className="text-sm text-gray-600 font-medium">
                      {formatDate(date.executionStartDate)}
                    </div> : null
                  ))}
                </div>
              </TableCell>
              {/** TODO: Botón de ver detalles */}
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
              {/** TODO: Botón de editar evento y restaurar a no ejecutado */}
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
                    {/** Si alguna fecha tiene statusId 3 entonces deshabilitar el botón */}
                    {executedEvent.eventDates.some(date => date.statusId === 3) ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              disabled
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>No se puede restaurar a no ejecutado porque alguna fecha ya tiene evidencia</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onRestore(executedEvent.eventId, executedEvent.eventDates.map(date => date.statusId === 2 ? date.eventDateId : null).filter(id => id !== null))}
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
                    )}
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

