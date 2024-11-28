// src/components/poa/sections/approvalStatus.tsx

'use client'

import { Card } from "@/components/ui/card"
import { ChevronDown, ChevronUp, CheckCircle2, Clock, Send } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useState } from 'react'

interface ApprovalStatusProps {
  name: string
  isActive?: boolean
}

/**
 * Componente que muestra el estado de aprobación de un proceso.
 * Permite minimizar o expandir la vista de los estados de aprobación.
 * 
 * @param name Nombre del proceso de aprobación.
 * @param isActive Indica si el estado está activo.
 */
export default function ApprovalStatus({ name, isActive }: ApprovalStatusProps) {
  const [isMinimized, setIsMinimized] = useState(false)

  // Datos de ejemplo - estos deberían venir de tu API
  const approvalStatuses = [
    {
      role: "Decano",
      status: "Enviado",
      icon: Send,
      date: "15/11/2023"
    },
    {
      role: "Director Académico",
      status: "En revisión",
      icon: Clock,
      date: "16/11/2023"
    },
    {
      role: "Coordinador de Facultad",
      status: "En revisión",
      icon: Clock,
      date: "Pendiente"
    },
    {
      role: "Director de Planificación",
      status: "Aprobado",
      icon: CheckCircle2,
      date: "20/11/2023"
    },
    {
      role: "Rector",
      status: "Aprobado",
      icon: CheckCircle2,
      date: "22/11/2023"
    }
  ]

  return (
    <div id={name} className="mb-6">
      <Card className={`overflow-hidden ${isActive ? 'ring-2 ring-green-400' : ''}`}>
        <div className="p-4 bg-green-50 flex flex-wrap justify-between items-center">
          <h2 className="text-xl font-semibold text-primary mb-2 sm:mb-0">{name}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-primary hover:text-primary hover:bg-green-100"
            aria-label={isMinimized ? "Expandir estados de aprobación" : "Minimizar estados de aprobación"}
          >
            {isMinimized ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>

        {!isMinimized && (
          <div className="p-6 bg-white">
            <div className="relative">
              {/* Línea horizontal de conexión */}
              <div className="absolute top-[27px] left-0 w-full h-0.5 bg-gray-200" />

              {/* Estados */}
              <div className="relative flex justify-between">
                {approvalStatuses.map((item, index) => {
                  const Icon = item.icon
                  return (
                    <div key={index} className="flex flex-col items-center text-center w-40">
                      {/* Indicador de estado */}
                      <div className={`z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 ${item.status === 'Aprobado'
                          ? 'border-green-100 bg-green-50'
                          : item.status === 'En revisión'
                            ? 'border-yellow-100 bg-yellow-50'
                            : 'border-blue-100 bg-blue-50'
                        }`}>
                        <Icon className={`h-6 w-6 ${item.status === 'Aprobado'
                            ? 'text-green-600'
                            : item.status === 'En revisión'
                              ? 'text-yellow-600'
                              : 'text-blue-600'
                          }`} />
                      </div>

                      {/* Información del estado */}
                      <div className="mt-4 space-y-2">
                        <h3 className="text-sm font-semibold">{item.role}</h3>
                        <div className="flex flex-col items-center gap-1">
                          <span className={`px-2 py-1 rounded-full text-xs ${item.status === 'Aprobado'
                              ? 'bg-green-100 text-green-800'
                              : item.status === 'En revisión'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                            {item.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {item.date}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}