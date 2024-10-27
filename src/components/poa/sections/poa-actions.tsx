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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { CheckCircle, XCircle, AlertCircle, MessageCircle, RotateCcw } from "lucide-react"

export function PoaActions() {
  const [openApprove, setOpenApprove] = useState(false)
  const [openReject, setOpenReject] = useState(false)
  const [openCorrections, setOpenCorrections] = useState(false)
  const [openReturn, setOpenReturn] = useState(false)
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)

  const handleConfirm = (action: string) => {
    console.log(`POA ${action}`)
    setOpenApprove(false)
    setOpenReject(false)
    setOpenCorrections(false)
    setOpenReturn(false)
  }

  const handleOpenComments = () => {
    setIsCommentsOpen(true)
    console.log("Abriendo componente de comentarios")
  }

  return (
    <TooltipProvider>
      <div className="flex flex-wrap justify-center bg-gray-100 p-8">
        <div className="flex flex-row flex-wrap justify-center gap-4 p-4">
          <AlertDialog open={openApprove} onOpenChange={setOpenApprove}>
            <AlertDialogTrigger asChild>
              <Button className="w-40 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out flex items-center justify-center">
                <CheckCircle className="mr-2 h-5 w-5" />
                Aprobar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar aprobación</AlertDialogTitle>
                <AlertDialogDescription>
                  ¿Estás seguro de que deseas aprobar este POA?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-800">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleConfirm('aprobado')}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  Confirmar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog open={openReject} onOpenChange={setOpenReject}>
            <AlertDialogTrigger asChild>
              <Button className="w-40 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out flex items-center justify-center">
                <XCircle className="mr-2 h-5 w-5" />
                Rechazar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar rechazo</AlertDialogTitle>
                <AlertDialogDescription>
                  ¿Estás seguro de que deseas rechazar este POA?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-800">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleConfirm('rechazado')}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  Confirmar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog open={openCorrections} onOpenChange={setOpenCorrections}>
            <AlertDialogTrigger asChild>
              <Button className="w-40 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out flex items-center justify-center">
                <AlertCircle className="mr-2 h-5 w-5" />
                Corregir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar solicitud de correcciones</AlertDialogTitle>
                <AlertDialogDescription>
                  ¿Estás seguro de que deseas solicitar correcciones para este POA?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-800">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleConfirm('enviado a correcciones')}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  Confirmar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <AlertDialog open={openReturn} onOpenChange={setOpenReturn}>
                  <AlertDialogTrigger asChild>
                    <Button 
                      className="w-12 h-12 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-full transition duration-300 ease-in-out flex items-center justify-center" 
                      aria-label="Regresar a revisión"
                    >
                      <RotateCcw className="h-6 w-6" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar regreso a revisión</AlertDialogTitle>
                      <AlertDialogDescription>
                        ¿Estás seguro de que deseas regresar este POA a revisión?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-800">
                        No
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleConfirm('regresado a revisión')}
                        className="bg-gray-500 hover:bg-gray-600 text-white"
                      >
                        Sí, regresar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Regresar a revisión</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleOpenComments}
                className="w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full transition duration-300 ease-in-out flex items-center justify-center"
                aria-label="Abrir comentarios"
              >
                <MessageCircle className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Abrir comentarios</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {isCommentsOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Comentarios</h2>
              <p>Aquí iría el componente de comentarios</p>
              <Button onClick={() => setIsCommentsOpen(false)} className="mt-4">
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}