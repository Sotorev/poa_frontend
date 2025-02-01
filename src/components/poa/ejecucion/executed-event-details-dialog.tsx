"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { X } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ResponseExecutedEvent } from "@/types/eventExecution.type"
import { getFinancingSources } from "@/services/apiService"
import { useCurrentUser } from "@/hooks/use-current-user"
import DownloadExecutedEventButton from "./DownloadExecutedEventButton"

interface ExecutedEventDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  event: ResponseExecutedEvent
}

const ExecutedEventDetailsDialog: React.FC<ExecutedEventDetailsDialogProps> = ({ isOpen, onClose, event }) => {
  const [financing, setFinancing] = React.useState<{
    otherFinancing: any[]
    umesFinancing: any[]
  }>({
    otherFinancing: [],
    umesFinancing: [],
  })
  const user = useCurrentUser()

  React.useEffect(() => {
    const loadFinancing = async () => {
      try {
        const financing = await getFinancingSources(user?.token || "")

        const umesFinancing = financing.filter(
          (source) => [1, 4, 5, 7].includes(source.financingSourceId) && !source.isDeleted,
        )

        const otherFinancing = financing.filter(
          (source) => [2, 3, 6].includes(source.financingSourceId) && !source.isDeleted,
        )

        setFinancing({ otherFinancing, umesFinancing })
      } catch (err) {
        console.error(err)
      }
    }
    loadFinancing()
  }, [user])

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("es-GT", {
      style: "currency",
      currency: "GTQ",
    }).format(amount)
  }

  const getUmesFinancings = () => {
    return event.eventExecutionFinancings.filter((financing) => [1, 4, 5, 7].includes(financing.financingSourceId))
  }

  const getOtherFinancings = () => {
    return event.eventExecutionFinancings.filter((financing) => [2, 3, 6].includes(financing.financingSourceId))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="bg-[#014A2D] text-white p-4 sticky top-0 z-10">
          <DialogTitle className="text-xl font-semibold">Detalles Financieros</DialogTitle>
        </DialogHeader>
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 z-20"
        >
          <X className="h-4 w-4 text-white" />
          <span className="sr-only">Cerrar</span>
        </button>

        <ScrollArea className="h-[calc(90vh-4rem)] px-4 py-0 pb-4">
          <div className="space-y-2">
            <Card className="border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Aporte UMES</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {getUmesFinancings().map((aporte) => (
                  <div
                    key={aporte.eventExecutionFinancingId}
                    className="flex items-center justify-between rounded-md bg-muted/60 p-2 text-sm transition-colors hover:bg-muted"
                  >
                    <span className="font-medium text-muted-foreground">
                      {financing.umesFinancing.find((source) => source.financingSourceId === aporte.financingSourceId)
                        ?.name || "Desconocido"}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{formatCurrency(aporte.amount)}</span>
                      <span className="rounded-full bg-[#014A2D]/10 px-2 py-0.5 text-xs font-medium text-[#014A2D]">
                        {aporte.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Aporte Otros</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {getOtherFinancings().map((aporte) => (
                  <div
                    key={aporte.eventExecutionFinancingId}
                    className="flex items-center justify-between rounded-md bg-muted/60 p-2 text-sm transition-colors hover:bg-muted"
                  >
                    <span className="font-medium text-muted-foreground">
                      {financing.otherFinancing.find((source) => source.financingSourceId === aporte.financingSourceId)
                        ?.name || "Desconocido"}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{formatCurrency(aporte.amount)}</span>
                      <span className="rounded-full bg-[#014A2D]/10 px-2 py-0.5 text-xs font-medium text-[#014A2D]">
                        {aporte.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border">
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Archivos del Evento</h3>
                    <div className="space-y-2">
                      {event.eventExecutionFiles?.map((file) => (
                        <div key={file.fileId}>
                          <h4 className="text-md font-medium mb-1">{file.fileName}</h4>
                          <DownloadExecutedEventButton
                            name={file.fileName}
                            path={`/files/${file.fileId}/download`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default ExecutedEventDetailsDialog

