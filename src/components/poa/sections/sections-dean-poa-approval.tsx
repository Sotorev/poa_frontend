'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useCurrentUser } from "@/hooks/use-current-user"

interface SectionProps {
  name: string
  isActive: boolean
  poaId: number
  facultyId: number
  onStatusChange?: () => void // Nueva prop opcional
}

export function PoaApproval({ name, isActive, poaId, facultyId, onStatusChange }: SectionProps) {
  const [open, setOpen] = useState(false)
  const [openCancel, setOpenCancel] = useState(false)
  const user = useCurrentUser();

  const handleConfirm = async (status: string) => {
    // Obtener la fecha actual en formato ISO
    const currentDate = new Date().toISOString();

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/poas/${poaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },

        body: JSON.stringify({
          status: status,
          fechaCierre: currentDate, // Enviar la fecha actual
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el estado del POA.');
      }

      console.log(`POA con ID ${poaId} de la facultad ${facultyId} enviado con estado ${status} y fecha ${currentDate}`);
      setOpen(false);
      setOpenCancel(false);

      if (onStatusChange) {
        onStatusChange();
      }

    } catch (error: any) {
      console.error("Error al actualizar el POA:", error);
      alert("Ocurrió un error al actualizar el POA.");
    }
  };

  return (
    <div id={name} className={`mb-6 ${isActive ? 'ring-2 ring-green-400' : ''}`}>
      <div className="flex justify-center space-x-4">
        {/* Botón para finalizar y enviar */}
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger asChild>
            <Button className="bg-green-700 hover:bg-green-800 text-white">
              Finalizar y enviar POA
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar envío</AlertDialogTitle>
              <AlertDialogDescription>
                Se enviará el POA a revisión. ¿Estás seguro de que deseas continuar?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-800">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleConfirm("Cerrado")}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Botón para cancelar y reabrir */}
        <AlertDialog open={openCancel} onOpenChange={setOpenCancel}>
          <AlertDialogTrigger asChild>
            <Button className="bg-red-700 hover:bg-red-800 text-white">
              Cancelar y reabrir POA
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar cancelación</AlertDialogTitle>
              <AlertDialogDescription>
                Se reabrirá el POA. ¿Estás seguro de que deseas continuar?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-800">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleConfirm("Abierto")}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
