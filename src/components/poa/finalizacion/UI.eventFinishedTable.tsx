"use client"

import React, { useState, useMemo } from "react"
import type { EventFinishedResponse, EventFinishedDateResponse } from "./type.eventFinished"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Search, Download, Edit, RotateCcw, FileText, Eye, Loader2, CalendarIcon, Calendar as CalendarIcon2, Info, ChevronLeft, ChevronRight, ServerCog } from "lucide-react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface EventFinishedTableProps {
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  dateFilter: { startDate?: string; endDate?: string };
  finishedEvents: EventFinishedResponse[];
  setSearchTerm: (term: string) => void;
  setDateFilter: (filter: { startDate?: string; endDate?: string }) => void;
  selectEventForEdit: (event: EventFinishedResponse) => void;
  restoreEventEvidence: (eventId: number, eventDateId: number[]) => void;
  showEvidences: number | null;
  setShowEvidences: (eventId: number | null) => void;
  handleDownload: (evidenceId: number, fileName: string) => void;
  popoverSticky: boolean;
  togglePopoverSticky: () => void;
  getPendingDatesCount: (event: EventFinishedResponse) => number;
}

export const EventFinishedTable: React.FC<EventFinishedTableProps> = ({
  isLoading,
  error,
  searchTerm,
  dateFilter,
  finishedEvents,
  setSearchTerm,
  setDateFilter,
  selectEventForEdit,
  restoreEventEvidence,
  showEvidences,
  setShowEvidences,
  handleDownload,
  popoverSticky,
  togglePopoverSticky,
  getPendingDatesCount,
}) => {
  // Estado para controlar la descarga en progreso
  const [downloadingId, setDownloadingId] = useState<number | null>(null)
  const [startDateOpen, setStartDateOpen] = useState(false)
  const [executionEndDateOpen, setexecutionEndDateOpen] = useState(false)
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null)

  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Manejar la descarga con indicador de carga
  const handleDownloadWithLoading = async (evidenceId: number, fileName: string) => {
    setDownloadingId(evidenceId)
    try {
      await handleDownload(evidenceId, fileName)
    } finally {
      setDownloadingId(null)
    }
  }

  // Función para formatear la fecha para mostrar
  const formatDateDisplay = (dateString: string | undefined) => {
    if (!dateString) return "Seleccionar fecha"

    // Usar parseISO para interpretar correctamente la fecha ISO
    const date = parseISO(dateString)
    return format(date, "dd/MM/yyyy", { locale: es })
  }

  // Función para alternar la expansión de un evento
  const toggleEventExpand = (eventId: number) => {
    setExpandedEvent(expandedEvent === eventId ? null : eventId)
    // Si cerramos el evento, también cerramos cualquier popover abierto
    if (expandedEvent === eventId) {
      setShowEvidences(null)
    }
  }

  // Cálculos para la paginación
  const totalPages = Math.ceil(finishedEvents.length / itemsPerPage)

  // Obtener eventos paginados
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return finishedEvents.slice(startIndex, endIndex)
  }, [finishedEvents, currentPage, itemsPerPage])

  // Función para ir a la página anterior
  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1))
    setExpandedEvent(null) // Cerrar cualquier evento expandido al cambiar de página
  }

  // Función para ir a la página siguiente
  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages))
    setExpandedEvent(null) // Cerrar cualquier evento expandido al cambiar de página
  }

  // Componente para mostrar el popover con las evidencias
  const EvidencePopover = ({ event, dateId }: { event: EventFinishedResponse; dateId: number }) => {
    const dateInfo = event.dates.find((d) => d.eventDateId === dateId)

    if (!dateInfo) return null

    return (
      <PopoverContent className="w-72 p-4 shadow-lg border border-gray-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium text-sm">Evidencias</h4>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation()
              togglePopoverSticky()
            }}
          >
            {popoverSticky ? <span className="text-xs">✕</span> : <span className="text-xs">📌</span>}
          </Button>
        </div>

        {dateInfo.evidenceFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <FileText className="h-10 w-10 text-muted-foreground mb-2 opacity-50" />
            <p className="text-muted-foreground text-sm">No hay evidencias disponibles</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
            {dateInfo.evidenceFiles.map((file) => (
              <div key={file.evidenceId} className="flex justify-between items-center p-2 rounded-md hover:bg-gray-50">
                <div className="flex items-center gap-2 truncate">
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm truncate">{file.fileName}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDownloadWithLoading(file.evidenceId, file.fileName)
                  }}
                  disabled={downloadingId === file.evidenceId}
                >
                  {downloadingId === file.evidenceId ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    )
  }

  // Renderizar la fila de fechas expandida para un evento
  const renderExpandedDates = (event: EventFinishedResponse) => {
    return (
      <tr
        key={`expanded-${event.eventId}`}
        className="bg-gray-50/70"
      >
        <td colSpan={3} className="py-4 px-6">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Fechas de finalización:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {event.dates.map((date) => (
                <div
                  key={date.eventDateId}
                  className="p-3 bg-white rounded-md border border-gray-200 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <CalendarIcon2 className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-primary">Planificada</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Inicio: {formatDateDisplay(date.startDate)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Fin: {formatDateDisplay(date.endDate)}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CalendarIcon2 className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-primary">Ejecutada</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Inicio: {formatDateDisplay(date.executionStartDate)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Fin: {formatDateDisplay(date.executionEndDate)}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs bg-gray-100"
                    >
                      {date.evidenceFiles.length} {date.evidenceFiles.length === 1 ? 'archivo' : 'archivos'}
                    </Badge>
                  </div>

                  {date.evidenceFiles.length > 0 && (
                    <div className="mt-3 space-y-2 max-h-[150px] overflow-y-auto">
                      {date.evidenceFiles.map((file) => (
                        <div
                          key={file.evidenceId}
                          className="flex justify-between items-center p-2 rounded-md text-sm border border-gray-100 hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{file.fileName}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 flex-shrink-0"
                            onClick={() => handleDownloadWithLoading(file.evidenceId, file.fileName)}
                            disabled={downloadingId === file.evidenceId}
                          >
                            {downloadingId === file.evidenceId ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Download className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </td>
      </tr>
    )
  }

  // Componente para mostrar el indicador de estado de las fechas
  const StatusIndicator = ({ event }: { event: EventFinishedResponse }) => {
    const pendingCount = getPendingDatesCount(event);
    const isComplete = pendingCount === 0;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "w-3 h-3 rounded-full inline-block mr-2",
                isComplete ? "bg-green-500" : "bg-yellow-500"
              )}
            />
          </TooltipTrigger>
          <TooltipContent>
            {isComplete
              ? "Ya sean agregado las evidencias necesarias"
              : `Es necesario agregar ${pendingCount} evidencia(s)`
            }
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="bg-gray-50 rounded-lg">
      {/* Filtros */}
      <div className="px-6 pb-4 flex flex-row gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-primary text-bold">
            <span className="text-sm">Buscar por nombre</span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              className="pl-10 justify-start text-left font-normal border-gray-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar evento por nombre..."
            />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1 text-primary text-bold">
            <span className="text-sm">Buscar desde</span>
          </div>
          <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !dateFilter.startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFilter.startDate ? formatDateDisplay(dateFilter.startDate) : "Seleccionar fecha"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">              <Calendar
                mode="single"
                locale={es}
                selected={dateFilter.startDate ? parseISO(dateFilter.startDate) : undefined}
                defaultMonth={dateFilter.startDate ? parseISO(dateFilter.startDate) : undefined}
                onSelect={(date) => {
                  setDateFilter({
                    ...dateFilter,
                    startDate: date ? date.toISOString() : undefined,
                  })
                  setStartDateOpen(false)
                }}
                initialFocus
                captionLayout="dropdown-buttons"
                fromYear={new Date().getFullYear() - 5}
                toYear={new Date().getFullYear() + 5}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="justify-end">
          <div className="flex items-center gap-2 mb-1 text-primary text-bold">
            <span className="text-sm">Buscar hasta</span>
          </div>
          <Popover open={executionEndDateOpen} onOpenChange={setexecutionEndDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !dateFilter.endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFilter.endDate ? formatDateDisplay(dateFilter.endDate) : "Seleccionar fecha"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">              <Calendar
                mode="single"
                locale={es}
                selected={dateFilter.endDate ? parseISO(dateFilter.endDate) : undefined}
                defaultMonth={dateFilter.endDate ? parseISO(dateFilter.endDate) : dateFilter.startDate ? parseISO(dateFilter.startDate) : undefined}
                onSelect={(date) => {
                  setDateFilter({
                    ...dateFilter,
                    endDate: date ? date.toISOString() : undefined,
                  })
                  setexecutionEndDateOpen(false)
                }}
                initialFocus
                captionLayout="dropdown-buttons"
                fromYear={new Date().getFullYear() - 5}
                toYear={new Date().getFullYear() + 5}
                disabled={(date) => {
                  // Deshabilitar fechas anteriores a la fecha de inicio
                  if (dateFilter.startDate) {
                    return date < parseISO(dateFilter.startDate)
                  }
                  return false
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Tabla */}
      <div className="px-6 pb-6">
        <div className="w-full overflow-hidden border border-gray-200 rounded-md">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-6 text-left font-medium text-gray-600 border-b">Nombre del Evento</th>
                <th className="py-3 px-6 text-left font-medium text-gray-600 border-b">Fechas de finalización</th>
                <th className="py-3 px-6 text-right font-medium text-gray-600 border-b">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center">
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-6 w-6 text-muted-foreground animate-spin mr-2" />
                      <span>Cargando eventos...</span>
                    </div>
                  </td>
                </tr>
              ) : finishedEvents.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="h-12 w-12 text-muted-foreground mb-2 opacity-50" />
                      <p className="text-muted-foreground">No se encontraron eventos finalizados</p>
                    </div>
                  </td>
                </tr>
              ) : (
                // Modificamos el mapeo para mostrar solo los eventos de la página actual
                paginatedEvents.map((event: EventFinishedResponse) => {
                  const isExpanded = expandedEvent === event.eventId;
                  return (
                    <React.Fragment key={event.eventId}>
                      <tr
                        className={cn(
                          "border-b cursor-pointer hover:bg-gray-50/80",
                          isExpanded && "bg-gray-50/50 border-gray-300"
                        )}
                        onClick={() => toggleEventExpand(event.eventId)}
                      >
                        <td className="py-4 px-6 font-medium">
                          <div className="flex items-center">
                            <StatusIndicator event={event} />
                            {event.name}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            {event.dates.map(date => (
                              <span key={date.eventDateId} className="mr-1 text-sm">{formatDateDisplay(date.executionEndDate)}</span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-600/10"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-9 w-9 p-0 rounded-md border border-[#006837] text-[#006837] hover:bg-[#e6f4ee]"
                              onClick={(e) => {
                                e.stopPropagation(); // Evitar que se expanda la fila
                                selectEventForEdit(event);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-9 w-9 p-0 rounded-md border border-gray-300 hover:border-gray-400"
                              onClick={(e) => {
                                e.stopPropagation(); // Evitar que se expanda la fila
                                if (window.confirm("¿Está seguro de restaurar este evento?")) {
                                  restoreEventEvidence(event.eventId, event.dates.map(date => date.eventDateId));
                                  console.log(event.dates.map(date => date.eventDateId));
                                }
                              }}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && renderExpandedDates(event)}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {finishedEvents.length > 0 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500">
              Mostrando {Math.min(finishedEvents.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(currentPage * itemsPerPage, finishedEvents.length)} de {finishedEvents.length} eventos
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="h-8 px-3"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="ml-1">Anterior</span>
              </Button>
              <div className="text-sm font-medium">
                Página {currentPage} de {totalPages || 1}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage >= totalPages}
                className="h-8 px-3"
              >
                <span className="mr-1">Siguiente</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md flex items-center gap-2">
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>
    </div>
  )
}

