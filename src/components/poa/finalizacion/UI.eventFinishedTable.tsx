"use client"

import { Eye, Pencil, RotateCcw } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useEffect, useState } from "react"
import type { EventFinished, EventFinishedTableProps } from "@/components/poa/finalizacion/type.eventFinished"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export function EventFinishedTable({ events, onEdit, onRestore, onView }: EventFinishedTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredEvents, setFilteredEvents] = useState<EventFinished[]>(events)

  // Filtrar eventos cuando cambia el término de búsqueda o la lista de eventos
  const handleSearch = (term: string) => {
    setSearchTerm(term)
    if (!term.trim()) {
      setFilteredEvents(events)
      return
    }

    const filtered = events.filter((event) => event.name.toLowerCase().includes(term.toLowerCase()))
    setFilteredEvents(filtered)
  }

  // Actualizar eventos filtrados cuando cambia la lista de eventos
  useEffect(() => {
    setFilteredEvents(events)
  }, [events])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-GT", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-center mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar eventos finalizados..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-base font-semibold text-primary">Nombre del Evento</TableHead>
                <TableHead className="text-base font-semibold text-primary">Fecha de Finalización</TableHead>
                <TableHead className="text-base font-semibold text-primary">Documentos</TableHead>
                <TableHead className="text-right text-base font-semibold text-primary">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    No se encontraron eventos finalizados
                  </TableCell>
                </TableRow>
              ) : (
                filteredEvents.map((event) => (
                  <TableRow key={event.eventId}>
                    <TableCell className="font-medium text-foreground">{event.name}</TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-muted-foreground">
                        {formatDate(event.completionDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">{event.testDocuments.length} documento(s)</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onView(event)}
                          className="shrink-0 hover:bg-primary/10"
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
                                onClick={() => onEdit(event)}
                                className="border-primary text-primary hover:bg-primary/10 hover:text-primary transition-colors"
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
                                onClick={() => onRestore(event.eventId)}
                                className="border-primary text-primary hover:bg-primary/10 hover:text-primary transition-colors"
                              >
                                <RotateCcw className="h-4 w-4" />
                                <span className="sr-only">Restaurar a en ejecución</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Restaurar a en ejecución</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

