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
import { CheckCircle, XCircle, AlertCircle, RotateCcw, MessageCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCurrentUser } from "@/hooks/use-current-user"

interface SectionProps {
  name: string
  isActive: boolean
  poaId: number
}

export function PoaActions({ name, isActive, poaId }: SectionProps) {
  const user = useCurrentUser();
  const { toast } = useToast(); // Mover la llamada al hook dentro del componente

  //ESTADO DE APROBACION
  const [openApprove, setOpenApprove] = useState(false)
  const [openReject, setOpenReject] = useState(false)
  const [openCorrections, setOpenCorrections] = useState(false)
  const [openReturn, setOpenReturn] = useState(false)
  const [showComments, setShowComments] = useState(false)

  const handleOpenComments = () => {
    setShowComments(true)
  }

  const buttonClass = "w-64 h-12 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out flex items-center justify-center"

  const handleConfirm = async (approvalStatusId: number, action: string) => {
    ////ESTADO DE APROBACION
    setOpenApprove(false)
    setOpenReject(false)
    setOpenCorrections(false)
    setOpenReturn(false)

    // Obtener la fecha actual en formato ISO
    const currentDate = new Date().toISOString();

     // Determinar approvalStageId basado en el roleName del usuario
     let approvalStageId;
     if (user?.role.roleName === "Vicerrector académico") {
       approvalStageId = 2;
     } else if (user?.role.roleName === "Vicerrector administrativo") {
       approvalStageId = 3;
     } else {
        toast({
          title: "Error",
          description: `No tienes permisos para aprobar el POA.`,
          variant: "destructive",
        });
        return; 
     }

    try {
      const approvalResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/poaapprovals/poa-approval/${poaId}/stage/${approvalStageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          approverUserId: user?.userId,
          approverRoleId: user?.role.roleId,
          approvalStageId: approvalStageId,
          approvalStatusId: approvalStatusId,
          approvalDate: currentDate,
        }),
      });

      if (!approvalResponse.ok) {
        throw new Error('Error al actualizar la aprobación del POA.');
      }

      toast({
        title: ` POA ${action} con exito`,
        description: "Se actualizó el estado del POA correctamente.",
        variant: "success",
      });

    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo actualizar el estado del POA.`,
        variant: "destructive",
      });
    }
  };

  return (
    <div id={name} className= {`flex flex-wrap justify-center bg-gray-100 p-8 ${isActive ? 'ring-2 ring-green-400' : ''} `}>
      <div className="flex flex-row flex-wrap justify-center gap-4 p-4">
        <AlertDialog open={openApprove} onOpenChange={setOpenApprove}>
          <AlertDialogTrigger asChild>
            <Button className={`${buttonClass} bg-green-500 hover:bg-green-600`}>
              <CheckCircle className="mr-2 h-5 w-5" />
              Aprobar el POA
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
                onClick={() => handleConfirm(1, "aprobado")} // approvalStatusId = 1
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={openReject} onOpenChange={setOpenReject}>
          <AlertDialogTrigger asChild>
            <Button className={`${buttonClass} bg-red-500 hover:bg-red-600`}>
              <XCircle className="mr-2 h-5 w-5" />
              Rechazar el POA
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
                onClick={() => handleConfirm(2, "rechazado")} // approvalStatusId = 2
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={openCorrections} onOpenChange={setOpenCorrections}>
          <AlertDialogTrigger asChild>
            <Button className={`${buttonClass} bg-yellow-500 hover:bg-yellow-600`}>
              <AlertCircle className="mr-2 h-5 w-5" />
              Solicitar correcciones
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
                onClick={() => handleConfirm(3, "aprobado con correciones")} // approvalStatusId = 3
                className="bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={openReturn} onOpenChange={setOpenReturn}>
          <AlertDialogTrigger asChild>
            <Button className={`${buttonClass} bg-blue-500 hover:bg-blue-600`}>
              <RotateCcw className="mr-2 h-5 w-5" />
              Regresar a revisión
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
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleConfirm(4, "regresado a revisión")} // approvalStatusId = 4
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/*<Button
          onClick={handleOpenComments}
          className="w-12 h-12 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-full transition duration-300 ease-in-out flex items-center justify-center"
          aria-label="Abrir comentarios"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>*/}
      </div>

      {showComments && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Comentarios</h2>
            <p>Aquí iría el componente de comentarios.</p>
            <Button onClick={() => setShowComments(false)} className="mt-4">
              Cerrar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}