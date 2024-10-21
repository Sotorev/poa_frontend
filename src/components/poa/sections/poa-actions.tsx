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
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"


interface SectionProps {
  name: string
  isActive: boolean
  poaId: number
  facultyId: number
  userId : number
  rolId : number
}


export default function PoaActions({ name, isActive, poaId, facultyId, userId, rolId  }: SectionProps) {
  const [openApprove, setOpenApprove] = useState(false)
  const [openReject, setOpenReject] = useState(false)
  const [openCorrections, setOpenCorrections] = useState(false)

  const handleConfirm = (action: string) => {
    console.log(`POA ${action}`)
    setOpenApprove(false)
    setOpenReject(false)
    setOpenCorrections(false)
  }

  return (
    <div className="flex flex-wrap justify-center bg-gray-100 p-8">
      <div className="flex flex-row justify-center gap-4 p-4">
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
        </div>
    </div>
  )
}