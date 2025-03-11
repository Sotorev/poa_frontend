"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ValidationErrors } from "./type.eventPlanningForm"
import { AlertCircle } from "lucide-react"

interface ValidationErrorsModalProps {
  isOpen: boolean
  onClose: () => void
  errors: ValidationErrors
}

export function ValidationErrorsModal({ isOpen, onClose, errors }: ValidationErrorsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md z-[100]">
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Errores de Validación
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] py-4">
          <div className="space-y-4">
            <p className="text-gray-700">Por favor, corrija los siguientes errores antes de continuar:</p>
            <ul className="list-disc pl-5 space-y-2">
              {errors.errorList.map((error, index) => (
                <li key={index} className="text-destructive">
                  {error.message}
                </li>
              ))}
            </ul>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button onClick={() => onClose()}>Entendido</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

