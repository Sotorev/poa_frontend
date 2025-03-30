"use client"

import { useEventFinished } from "@/components/poa/finalizacion/useEventFinished"
import { EventFinishedTable } from "@/components/poa/finalizacion/UI.eventFinishedTable"
import { EventFinishedForm } from "@/components/poa/finalizacion/UI.eventFinishedForm"

export default function FinalizarPage() {
  const eventFinishedState = useEventFinished()
  
  // Extraer las propiedades necesarias para el formulario
  const formProps = {
    isLoading: eventFinishedState.isLoading,
    error: eventFinishedState.error,
    currentStep: eventFinishedState.currentStep,
    formSearchTerm: eventFinishedState.formSearchTerm,
    selectedEvent: eventFinishedState.selectedEvent,
    selectedFinishedEvent: eventFinishedState.selectedFinishedEvent,
    selectedDates: eventFinishedState.selectedDates,
    evidenceFiles: eventFinishedState.evidenceFiles,
    downloadedFiles: eventFinishedState.downloadedFiles,
    isEditing: eventFinishedState.isEditing,
    currentDateId: eventFinishedState.currentDateId,
    executedEvents: eventFinishedState.executedEvents,
    selectEventForEvidence: eventFinishedState.selectEventForEvidence,
    selectDateForEvidence: eventFinishedState.selectDateForEvidence,
    updateDateEndDate: eventFinishedState.updateDateEndDate,
    addFilesToDate: eventFinishedState.addFilesToDate,
    goToPreviousStep: eventFinishedState.goToPreviousStep,
    goToNextDate: eventFinishedState.goToNextDate,
    setFormSearchTerm: eventFinishedState.setFormSearchTerm,
    resetForm: eventFinishedState.resetForm,
    createForm: eventFinishedState.createForm,
    updateForm: eventFinishedState.updateForm,
    onSubmit: eventFinishedState.onSubmit,
    isFormOpen: eventFinishedState.isFormOpen,
    setIsFormOpen: eventFinishedState.setIsFormOpen,
    openCreateForm: eventFinishedState.openCreateForm
  }
  
  // Extraer las propiedades necesarias para la tabla
  const tableProps = {
    isLoading: eventFinishedState.isLoading,
    error: eventFinishedState.error,
    searchTerm: eventFinishedState.searchTerm,
    dateFilter: eventFinishedState.dateFilter,
    finishedEvents: eventFinishedState.finishedEvents,
    setSearchTerm: eventFinishedState.setSearchTerm,
    setDateFilter: eventFinishedState.setDateFilter,
    selectEventForEdit: eventFinishedState.selectEventForEdit,
    restoreEventEvidence: eventFinishedState.restoreEventEvidence,
    showEvidences: eventFinishedState.showEvidences,
    setShowEvidences: eventFinishedState.setShowEvidences,
    handleDownload: eventFinishedState.handleDownload,
    popoverSticky: eventFinishedState.popoverSticky,
    togglePopoverSticky: eventFinishedState.togglePopoverSticky,
    getPendingDatesCount: eventFinishedState.getPendingDatesCount
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="px-6 text-2xl font-bold">Gestión de Eventos Finalizados</h1>
        <EventFinishedForm {...formProps} />
      </div>
      
      <EventFinishedTable {...tableProps} />
    </div>
  )
}

