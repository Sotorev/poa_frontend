"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EventFinishedTable } from "./UI.eventFinishedTable"
import { EventFinishedForm } from "./UI.eventFinishedForm"
import { useEventFinishedView } from "@/components/poa/finalizacion/useEventFinished"
import type { EventFinishedRequest, EventFinishedResponse } from "@/components/poa/finalizacion/type.eventFinished"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import DownloadExecutedEventButton from "@/components/poa/ejecucion/DownloadExecutedEventButton"

export function EventFinishedView() {
  const {
    availableEvents,
    finishedEvents,
    isLoading,
    isDialogOpen,
    selectedEvent,
    currentStep,
    form,
    errors,
    isValid,
    handleEventSelect,
    handleStepChange,
    handleSubmit,
    handleEdit,
    handleRestore,
    handleOpenDialog,
    handleCloseDialog,
  } = useEventFinishedView()

  const [viewingEvent, setViewingEvent] = useState<EventFinishedResponse | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  // Crear adaptador para el tipo de onSubmit
  const handleFormSubmit = (data: EventFinishedRequest) => {
    console.log("data", data)
    console.log("estoy en el handleFormSubmit en el view")
    handleSubmit(data);
  };

  // Manejar la visualización de detalles
  const handleViewDetails = (event: EventFinishedResponse) => {
    setViewingEvent(event)
    setIsDetailsOpen(true)
  }

  return (
    <div className="container mx-auto py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold">Eventos Finalizados</h1>
        <Button onClick={handleOpenDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Finalizar Evento
        </Button>
      </div>

      <EventFinishedTable
        events={finishedEvents}
        onEdit={handleEdit}
        onRestore={handleRestore}
        onView={handleViewDetails}
      />

      {/* Diálogo para agregar/editar evento finalizado */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseDialog()
        }}
      >
        <DialogContent className="max-w-[95vw] w-full sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] p-4 sm:p-6 md:p-8 overflow-y-auto max-h-[90vh]">
          <DialogHeader className="space-y-2 sm:space-y-3">
            <DialogTitle className="text-lg sm:text-xl md:text-2xl">
              {form.getValues("eventId") ? "Editar Evento Finalizado" : "Finalizar Evento"}
            </DialogTitle>
          </DialogHeader>

          <EventFinishedForm
            form={form}
            errors={errors}
            isValid={isValid}
            onSubmit={handleFormSubmit}
            selectedEvent={selectedEvent}
            handleEventSelect={handleEventSelect}
            isLoading={isLoading}
            currentStep={currentStep}
            onStepChange={handleStepChange}
            onEventSelect={handleEventSelect}
            availableEvents={availableEvents}
          />
        </DialogContent>
      </Dialog>

      {/* Diálogo para ver detalles del evento */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px] h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="bg-primary text-primary-foreground p-4 sticky top-0 z-10">
            <DialogTitle className="text-xl font-semibold">Detalles del Evento Finalizado</DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[calc(90vh-4rem)] px-4 py-0 pb-4">
            {viewingEvent && (
              <div className="space-y-4 p-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">{viewingEvent.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Fecha de Finalización</p>
                        <p className="font-medium">
                          {viewingEvent.completionDate.map((date) => new Date(date.endDate).toLocaleDateString("es-GT", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })).join(", ")}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Documentos de Prueba</p>
                      <div className="space-y-2">
                        {viewingEvent.evidenceDocuments.map((doc) => (
                          <div
                            key={doc.documentId}
                            className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                          >
                            <span className="text-sm font-medium">{doc.fileName}</span>
                            <DownloadExecutedEventButton name={doc.fileName} path={`/files/${doc.fileId}/download`} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}

