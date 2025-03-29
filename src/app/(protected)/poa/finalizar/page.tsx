"use client"

import { EventFinishedTable } from "@/components/poa/finalizacion/UI.eventFinishedTable"
import { EventFinishedForm } from "@/components/poa/finalizacion/UI.eventFinishedForm"

export default function FinalizarPage() {
  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Eventos Finalizados</h1>
        <EventFinishedForm />
      </div>
      
      <EventFinishedTable />
    </div>
  )
}

