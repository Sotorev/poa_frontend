"use client"

import type React from "react"
import { useState } from "react"
import { useEventFinished } from "./useEventFinished"
import type { EventFinishedResponse, EventFinishedDateResponse } from "./type.eventFinished"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Search, Download, Edit, RotateCcw, FileText, ChevronDown, Loader2, CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

export const EventFinishedTable: React.FC = () => {
  const {
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
  } = useEventFinished()

  // Estado para controlar la descarga en progreso
  const [downloadingId, setDownloadingId] = useState<number | null>(null)
  const [startDateOpen, setStartDateOpen] = useState(false)
  const [endDateOpen, setEndDateOpen] = useState(false)

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
    return format(new Date(dateString), "dd/MM/yyyy", { locale: es })
  }

  // Componente para mostrar el popover con las evidencias
  const EvidencePopover = ({ event, dateId }: { event: EventFinishedResponse; dateId: number }) => {
    const dateInfo = event.dates.find((d) => d.eventExecutionDateId === dateId)

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

  return (
    <div className="bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center p-6">
        <h1 className="text-2xl font-bold">Eventos Finalizados</h1>
      </div>

      {/* Filtros */}
      <div className="px-6 pb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            className="pl-10 border-gray-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre..."
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Desde</span>
          </div>
          <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateFilter.startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFilter.startDate ? formatDateDisplay(dateFilter.startDate) : "Seleccionar fecha"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                locale={es}
                selected={dateFilter.startDate ? new Date(dateFilter.startDate) : undefined}
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

        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Hasta</span>
          </div>
          <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateFilter.endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFilter.endDate ? formatDateDisplay(dateFilter.endDate) : "Seleccionar fecha"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                locale={es}
                selected={dateFilter.endDate ? new Date(dateFilter.endDate) : undefined}
                onSelect={(date) => {
                  setDateFilter({
                    ...dateFilter,
                    endDate: date ? date.toISOString() : undefined,
                  })
                  setEndDateOpen(false)
                }}
                initialFocus
                captionLayout="dropdown-buttons"
                fromYear={new Date().getFullYear() - 5}
                toYear={new Date().getFullYear() + 5}
                disabled={(date) => {
                  // Deshabilitar fechas anteriores a la fecha de inicio
                  if (dateFilter.startDate) {
                    return date < new Date(dateFilter.startDate)
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
                <th className="py-3 px-6 text-left font-medium text-gray-600 border-b">Fechas de Ejecución</th>
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
                finishedEvents.map((event: EventFinishedResponse) =>
                  event.dates?.map((date: EventFinishedDateResponse, index) => (
                    <tr
                      key={`${event.eventId}-${date.eventExecutionDateId}`}
                      className={cn("border-b", index % 2 === 0 ? "bg-white" : "bg-gray-50")}
                    >
                      <td className="py-4 px-6 font-medium">{event.name}</td>
                      <td className="py-4 px-6">
                        <Popover
                          open={showEvidences === date.eventExecutionDateId || undefined}
                          onOpenChange={(open) => {
                            if (!popoverSticky || !open) {
                              setShowEvidences(open ? date.eventExecutionDateId : null)
                            }
                          }}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              className="p-0 h-auto font-normal text-left hover:bg-transparent hover:underline"
                              onClick={() => {
                                setShowEvidences(
                                  showEvidences === date.eventExecutionDateId ? null : date.eventExecutionDateId,
                                )
                              }}
                            >
                              <span>{formatDateDisplay(date.endDate)}</span>
                              <ChevronDown className="h-4 w-4 ml-1 inline-block" />
                            </Button>
                          </PopoverTrigger>
                          {showEvidences === date.eventExecutionDateId && (
                            <EvidencePopover event={event} dateId={date.eventExecutionDateId} />
                          )}
                        </Popover>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 w-9 p-0 rounded-md border border-[#006837] text-[#006837] hover:bg-[#e6f4ee]"
                            onClick={() => selectEventForEdit(event)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 w-9 p-0 rounded-md border border-gray-300 hover:border-gray-400"
                            onClick={() => {
                              if (window.confirm("¿Está seguro de restaurar este evento?")) {
                                restoreEventEvidence(event.eventId)
                              }
                            }}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )),
                )
              )}
            </tbody>
          </table>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md flex items-center gap-2">
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>
    </div>
  )
}

