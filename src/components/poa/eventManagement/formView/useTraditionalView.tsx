// src/components/poa/eventManagement/formView/useTraditionalView.tsx

'use client'

// Libraries
import React, { useState, useContext, useMemo } from 'react'

// Charge data
import { useCurrentUser } from '@/hooks/use-current-user'
import { downloadFile } from '@/utils/downloadFile'

// Types
import { PlanningEvent, FilaPlanificacion, FilaError, ResponseFullEvent } from './eventPlanningForm.type'
import { StrategicArea } from '@/types/StrategicArea'
import { Strategy } from '@/types/Strategy'
import { StrategicObjective } from '@/types/StrategicObjective'

// Schemas
import { strategicAreasSchema } from '@/schemas/strategicAreaSchema'
import { filaPlanificacionSchema, FullEventRequest } from './eventPlanningForm.schema'
import { StrategicObjectiveSchema } from '@/schemas/strategicObjectiveSchema'
import { get } from 'http'
import { EventPlanningForm } from './eventPlanningForm'
import { useForm } from 'react-hook-form'
import { EventContext } from './event.context'

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

    // function forms
    const { register, handleSubmit, reset, watch, control } = useForm<FullEventRequest>()

    return {
        isOpen,
        setIsOpen,
        watch,
        register,
        control,
        handleSubmit,
        reset,
        selectedStrategicArea,
        selectedStrategicObjective,
        setSelectedStrategicObjective,
        selectedStrategies,
        setSelectedStrategies,
    }
}