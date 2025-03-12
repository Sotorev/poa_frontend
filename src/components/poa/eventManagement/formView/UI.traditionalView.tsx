// src/components/poa/eventManagement/formView/UI.traditionalView.tsx

'use client'

// Libraries
import React, { useContext } from 'react'

// Components
import { Button } from "@/components/ui/button"

// Custom components
import EventsCorrectionsComponent from '../../sections/events-viewer/EventsCorrectionsComponent'
import { EventPlanningForm } from './UI.eventPlanningForm'

// Hooks
import { EventPlanningFormProvider } from './context.eventPlanningForm'

// Context
import { EventContext } from '../context.event'

export function TraditionalView() {
  const {
    setIsOpen
  } = useContext(EventContext)


  return (
    <div className="container mx-auto p-4">
      <EventPlanningFormProvider  >
        <EventPlanningForm />
      </EventPlanningFormProvider>

      <div className="flex justify-center">
        <Button onClick={() => { setIsOpen(true) }} className="px-8 my-2 mb-6">Agregar Evento</Button>
      </div>
      <EventsCorrectionsComponent
        name="Revisión de eventos"
        isActive={false}
        isEditable={false}
      />
    </div>
  )
}
