"use client"

import { useEventFinished } from "@/components/poa/finalizacion/useEventFinished"
import { EventFinishedTable } from "@/components/poa/finalizacion/UI.eventFinishedTable"
import { EventFinishedForm } from "@/components/poa/finalizacion/UI.eventFinishedForm"

export default function FinalizarPage() {
  const eventFinishedState = useEventFinished()

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Eventos Finalizados</h1>
        <EventFinishedForm {...eventFinishedState} />
      </div>
      
      <EventFinishedTable 
        isLoading={eventFinishedState.isLoading}
        error={eventFinishedState.error}
        searchTerm={eventFinishedState.searchTerm}
        dateFilter={eventFinishedState.dateFilter}
        finishedEvents={eventFinishedState.finishedEvents}
        setSearchTerm={eventFinishedState.setSearchTerm}
        setDateFilter={eventFinishedState.setDateFilter}
        selectEventForEdit={eventFinishedState.selectEventForEdit}
        restoreEventEvidence={eventFinishedState.restoreEventEvidence}
        showEvidences={eventFinishedState.showEvidences}
        setShowEvidences={eventFinishedState.setShowEvidences}
        handleDownload={eventFinishedState.handleDownload}
        popoverSticky={eventFinishedState.popoverSticky}
        togglePopoverSticky={eventFinishedState.togglePopoverSticky}
        getPendingDatesCount={eventFinishedState.getPendingDatesCount}
      />
    </div>
  )
}

