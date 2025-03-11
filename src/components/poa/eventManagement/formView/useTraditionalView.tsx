// src/components/poa/eventManagement/formView/useTraditionalView.tsx

'use client'

// Libraries
import { useState, useContext, useMemo } from 'react'

// Charge data
import { useCurrentUser } from '@/hooks/use-current-user'
import { downloadFile } from '@/utils/downloadFile'

// Types
import { PlanningEvent, FilaPlanificacion, FilaError, ResponseFullEvent } from './type.eventPlanningForm'
import { StrategicArea } from '@/types/StrategicArea'
import { Strategy } from '@/types/Strategy'
import { StrategicObjective } from '@/types/StrategicObjective'

// Schemas
import { strategicAreasSchema } from '@/schemas/strategicAreaSchema'
import { filaPlanificacionSchema, FullEventRequest } from './schema.eventPlanningForm'
import { StrategicObjectiveSchema } from '@/schemas/strategicObjectiveSchema'
import { get } from 'http'
import { EventPlanningForm } from './UI.eventPlanningForm'
import { EventContext } from '../context.event'

export function useTraditionalView() {
    const user = useCurrentUser();

    // Data API
    const [eventRequest, setEventRequest] = useState<FullEventRequest>()

    // Context+
    const { strategicAreas } = useContext(EventContext);

    // Selected data
    const [selectedStrategicObjective, setSelectedStrategicObjective] = useState<StrategicObjective>()
    const selectedStrategicArea = useMemo(() => { 
        return selectedStrategicObjective
          ? strategicAreas.find(area => area.strategicAreaId === selectedStrategicObjective.strategicAreaId)
          : undefined;
    }, [selectedStrategicObjective, strategicAreas])
    const [selectedStrategies, setSelectedStrategies] = useState<Strategy[]>()

    // Load, error, and close States
    const [loading, setLoading] = useState<boolean>(false)
    const [isOpen, setIsOpen] = useState<boolean>(false)

    // Functions
    const onSubmit = async (data: FullEventRequest) => {
        setEventRequest(data)
    }

    return {
        isOpen,
        setIsOpen,
        eventRequest,
        selectedStrategicArea,
        selectedStrategicObjective,
        setSelectedStrategicObjective,
        selectedStrategies,
        setSelectedStrategies,
        onSubmit
    }
}