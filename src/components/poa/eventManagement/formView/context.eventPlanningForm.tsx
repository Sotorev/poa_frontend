"use client"
import { createContext, useContext, useEffect, useRef, useState } from "react"

// Hooks
import {
    type Control,
    type FieldArrayWithId,
    type UseFieldArrayAppend,
    type UseFieldArrayRemove,
    type UseFormGetValues,
    type UseFormRegister,
    type UseFormSetValue,
    type UseFormWatch,
    useForm,
    useFieldArray,
    type UseFormHandleSubmit,
    type UseFormReset,
    type UseFieldArrayUpdate,
    type UseFieldArrayReplace,
} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useToast } from "@/hooks/use-toast"

// Types
import { type FullEventRequest, fullEventSchema } from "./schema.eventPlanningForm"
import { createEvent, updateEvent } from "./service.eventPlanningForm"
import type { ResponseFullEvent, ValidationErrors } from "./type.eventPlanningForm"
import { EventContext } from "../context.event"

interface EventPlanningFormContextProps {
    fieldsInterventions: FieldArrayWithId<FullEventRequest, "interventions">[]
    appendIntervention: UseFieldArrayAppend<FullEventRequest>
    removeIntervention: UseFieldArrayRemove
    fieldsODS: FieldArrayWithId<FullEventRequest, "ods">[]
    appendODS: UseFieldArrayAppend<FullEventRequest>
    removeODS: UseFieldArrayRemove
    fieldsDates: FieldArrayWithId<FullEventRequest, "dates">[]
    appendDate: UseFieldArrayAppend<FullEventRequest>
    updateDate: UseFieldArrayUpdate<FullEventRequest>
    removeDate: UseFieldArrayRemove
    replaceDates: UseFieldArrayReplace<FullEventRequest>
    appendResponible: UseFieldArrayAppend<FullEventRequest>
    updateResponsible: UseFieldArrayUpdate<FullEventRequest>
    removeResponsible: UseFieldArrayRemove
    fieldsResponsibles: FieldArrayWithId<FullEventRequest, "responsibles">[]
    appendFinancing: UseFieldArrayAppend<FullEventRequest>
    removeFinancing: UseFieldArrayRemove
    updateFinancing: UseFieldArrayUpdate<FullEventRequest>
    fieldsFinancings: FieldArrayWithId<FullEventRequest, "financings">[]
    appendResource: UseFieldArrayAppend<FullEventRequest>
    removeResource: UseFieldArrayRemove
    fieldsResources: FieldArrayWithId<FullEventRequest, "resources">[]
    getValues: UseFormGetValues<FullEventRequest>
    watch: UseFormWatch<FullEventRequest>
    register: UseFormRegister<FullEventRequest>
    setValue: UseFormSetValue<FullEventRequest>
    control: Control<FullEventRequest>
    handleSubmit: UseFormHandleSubmit<FullEventRequest>
    reset: UseFormReset<FullEventRequest>
    submitEvent: (data: FullEventRequest, token: string) => Promise<any>
    updateExistingEvent: (eventId: number, data: Partial<FullEventRequest>, token: string) => Promise<any>
    errors: any
    isSubmitting: boolean
    setIsSubmitting: (isSubmitting: boolean) => void
    validateForm: () => ValidationErrors
    formErrors: ValidationErrors
    setFormErrors: (errors: ValidationErrors) => void
    showValidationErrors: boolean
    setShowValidationErrors: (showValidationErrors: boolean) => void
    handleFormSubmit: (
        poaId?: number
    ) => Promise<void>
    activeTab: string
    setActiveTab: (tab: string) => void
    phases: { number: number, name: string, hasError: boolean }[]
    handlePhaseClick: (phase: number) => void
    getCurrentPhase: (tab: string) => number
    scrollContainerRef: React.RefObject<HTMLDivElement>
}

const notImplemented = (name: string) => {
    return (...args: any[]) => {
        throw new Error(
            `${name} has not been implemented. Did you forget to wrap your component in EventPlanningFormProvider?`,
        )
    }
}

export const EventPlanningFormContext = createContext<EventPlanningFormContextProps>({
    fieldsInterventions: [],
    appendIntervention: notImplemented("append"),
    removeIntervention: notImplemented("remove"),
    fieldsODS: [],
    appendODS: notImplemented("append"),
    removeODS: notImplemented("remove"),
    fieldsDates: [],
    appendDate: notImplemented("append"),
    updateDate: notImplemented("update"),
    removeDate: notImplemented("remove"),
    replaceDates: notImplemented("remove"),
    appendResponible: notImplemented("append"),
    updateResponsible: notImplemented("update"),
    removeResponsible: notImplemented("remove"),
    fieldsResponsibles: [],
    appendFinancing: notImplemented("append"),
    removeFinancing: notImplemented("remove"),
    updateFinancing: notImplemented("update"),
    fieldsFinancings: [],
    appendResource: notImplemented("append"),
    removeResource: notImplemented("remove"),
    fieldsResources: [],
    getValues: notImplemented("getValues"),
    watch: notImplemented("watch"),
    register: notImplemented("register"),
    setValue: notImplemented("setValue"),
    control: {} as Control<FullEventRequest>,
    handleSubmit: notImplemented("handleSubmit"),
    reset: notImplemented("reset"),
    submitEvent: notImplemented("submitEvent"),
    updateExistingEvent: notImplemented("updateExistingEvent"),
    errors: {},
    isSubmitting: false,
    setIsSubmitting: notImplemented("setIsSubmitting"),
    validateForm: notImplemented("validateForm"),
    formErrors: { hasErrors: false, errorList: [] },
    setFormErrors: notImplemented("setFormErrors"),
    showValidationErrors: false,
    setShowValidationErrors: notImplemented("setShowValidationErrors"),
    handleFormSubmit: notImplemented("handleFormSubmit"),
    activeTab: "pei",
    setActiveTab: notImplemented("setActiveTab"),
    phases: [],
    handlePhaseClick: notImplemented("handlePhaseClick"),
    getCurrentPhase: notImplemented("getCurrentPhase"),
    scrollContainerRef: { current: null },
})

export const EventPlanningFormProvider: React.FC<{
    children: React.ReactNode
}> = ({ children }) => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formErrors, setFormErrors] = useState<ValidationErrors>({ hasErrors: false, errorList: [] })
    const [showValidationErrors, setShowValidationErrors] = useState(false)
    const { toast } = useToast()

    const { setIsOpen, user, eventEditing, setSelectedStrategicObjective, setSelectedStrategies, isPoaApproved } = useContext(EventContext)

    const {
        register,
        handleSubmit,
        reset,
        getValues,
        watch,
        control,
        setValue,
        formState: { errors },
    } = useForm<FullEventRequest>({
        resolver: zodResolver(fullEventSchema),
        values: eventEditing?.data,
    })

    // Nuevo: Función reset con registro de consola
    const resetWithLog = () => {
        setSelectedStrategicObjective(undefined)
        setSelectedStrategies(undefined)
        handlePhaseClick(1)
        
        // Set eventNature based on isPoaApproved
        const eventNature = isPoaApproved ? 'Extraordinario' : 'Planificado' as "Planificado" | "Extraordinario";
        
        // Valores iniciales vacíos para todos los arrays
        const emptyArrayValues = {
            interventions: [],
            ods: [],
            dates: [],
            responsibles: [],
            financings: [],
            resources: [],
            processDocuments: [],
            costDetailDocuments: [],
            eventNature: eventNature
        };
        
        // Resetear el formulario con valores por defecto vacíos para los arrays
        reset(emptyArrayValues);
    }

    // Efecto para cargar los datos del evento en el formulario cuando eventEditing cambia
    useEffect(() => {
        if (eventEditing?.data) {
            // Actualizar el formulario con los datos del evento
            reset(eventEditing.data);
            console.log('Formulario actualizado con datos del evento:', eventEditing.data);
        }
    }, [eventEditing, reset])

    // Efecto para establecer eventNature automáticamente basado en isPoaApproved
    useEffect(() => {
        // Solo establecer automáticamente si no estamos editando un evento existente
        if (!eventEditing) {
            const eventNature = isPoaApproved ? 'Extraordinario' : 'Planificado';
            setValue('eventNature', eventNature);
        }
    }, [isPoaApproved, setValue, eventEditing]);

    const phases = [
        {
            number: 1,
            name: "Plan Estratégico Institucional",
            hasError: formErrors.phaseErrors?.pei || false,
        },
        {
            number: 2,
            name: "Información del Evento",
            hasError: formErrors.phaseErrors?.info || false,
        },
        {
            number: 3,
            name: "Financiamiento del Evento",
            hasError: formErrors.phaseErrors?.finance || false,
        },
    ]

    // Get current phase based on active tab
    const getCurrentPhase = (tab: string) => {
        switch (tab) {
            case "pei":
                return 1
            case "info":
                return 2
            case "finance":
                return 3
            default:
                return 1
        }
    }

    const [activeTab, setActiveTab] = useState("pei")

    const handlePhaseClick = (phase: number) => {
        switch (phase) {
            case 1:
                setActiveTab("pei")
                break
            case 2:
                setActiveTab("info")
                break
            case 3:
                setActiveTab("finance")
                break
        }
    }

    const scrollContainerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
                top: 0,
                behavior: "smooth",
            })
        }
    }, [activeTab])

    // Field arrays
    const {
        append: appendIntervention,
        remove: removeIntervention,
        fields: fieldsInterventions,
    } = useFieldArray<FullEventRequest, "interventions">({
        control,
        name: "interventions",
    })

    const {
        append: appendODS,
        remove: removeODS,
        fields: fieldsODS,
    } = useFieldArray<FullEventRequest, "ods">({
        control,
        name: "ods",
    })

    const {
        append: appendDate,
        update: updateDate,
        remove: removeDate,
        replace: replaceDates,
        fields: fieldsDates,
    } = useFieldArray<FullEventRequest, "dates">({
        control,
        name: "dates",
    })

    const {
        append: appendResponible,
        remove: removeResponsible,
        update: updateResponsible,
        fields: fieldsResponsibles,
    } = useFieldArray<FullEventRequest, "responsibles">({
        control,
        name: "responsibles",
    })

    const {
        append: appendFinancing,
        remove: removeFinancing,
        update: updateFinancing,
        fields: fieldsFinancings,
    } = useFieldArray<FullEventRequest, "financings">({
        control,
        name: "financings",
    })

    const {
        append: appendResource,
        remove: removeResource,
        fields: fieldsResources,
    } = useFieldArray<FullEventRequest, "resources">({
        control,
        name: "resources",
    })

    // Función para validar el formulario antes de enviar
    const validateForm = (poaId?: number): ValidationErrors => {
        if (poaId) {
            setValue("poaId", poaId)
        }
        setValue("statusId", 1)
        setValue("completionPercentage", 0)
        setValue("userId", user?.userId || 0)
        setValue("isDelayed", false)

        // Get current form data to check if eventNature is set
        let formData = getValues()
        
        // Set eventNature automatically based on isPoaApproved if not already set
        if (!formData.eventNature) {
            const eventNature = isPoaApproved ? 'Extraordinario' : 'Planificado';
            setValue("eventNature", eventNature)
        }

        // Get updated form data after setting eventNature
        formData = getValues()

        // Usamos Zod para validar el formulario
        const validationResult = fullEventSchema.safeParse(formData)

        if (!validationResult.success) {
            // Si hay errores, los formateamos para el modal
            const errorList = validationResult.error.errors.map((err) => ({
                field: err.path.join("."),
                message: err.message,
            }))

            // Determinar qué fases tienen errores
            const peiFields = ["interventions", "ods"]
            const infoFields = [
                "name",
                "objective",
                "eventNature",
                "responsibles",
                "achievementIndicator",
                "type",
                "dates",
                "processDocuments",
            ]
            const financeFields = [
                "totalCost",
                "financings",
                "purchaseTypeId",
                "costDetailDocuments",
                "campusId",
                "resources",
            ]

            const phaseErrors = {
                pei: errorList.some((err) => peiFields.some((field) => err.field.startsWith(field))),
                info: errorList.some((err) => infoFields.some((field) => err.field.startsWith(field))),
                finance: errorList.some((err) => financeFields.some((field) => err.field.startsWith(field))),
            }

            // Modificar el return cuando hay errores:
            return {
                hasErrors: true,
                errorList,
                phaseErrors,
            }
        }

        return {
            hasErrors: false,
            errorList: [],
            phaseErrors: { pei: false, info: false, finance: false },
        }
    }

    // Función para enviar un nuevo evento
    const submitEvent = async (data: FullEventRequest, token: string) => {
        try {
            setIsSubmitting(true)
            const result = await createEvent(data, token)
            return result
        } catch (error) {
            throw error
        } finally {
            setIsSubmitting(false)
        }
    }

    // Función para actualizar un evento existente
    const updateExistingEvent = async (eventId: number, data: Partial<FullEventRequest>, token: string) => {
        try {
            setIsSubmitting(true)

            // Si estamos editando, necesitamos comparar los datos actuales con los originales
            if (eventEditing) {
                // Crear una copia profunda de los datos originales
                const originalData = eventEditing.data
                
                // Objeto para almacenar solo los datos que han cambiado
                const changedData: Partial<FullEventRequest> = {
                    // Propiedades mínimas necesarias para identificación
                    poaId: data.poaId || originalData.poaId,
                    userId: data.userId || originalData.userId
                }                            
                // Comparar y detectar campos que realmente han cambiado
                Object.entries(data).forEach(([key, value]) => {
                    const originalKey = key as keyof typeof originalData
                    // Para arrays necesitamos una comparación especial
                    if (Array.isArray(value) && Array.isArray(originalData[originalKey]) && key !== 'processDocuments' && key !== 'costDetailDocuments') {

                        // Si las longitudes son diferentes, ha cambiado
                        if (value.length !== (originalData[originalKey] as any[]).length) {
                            changedData[originalKey] = value as any
                        } 
                        // Si son objetos dentro de los arrays, comparamos más profundamente
                        else if (
                            key === 'interventions' ||
                            key === 'ods' ||
                            key === 'dates' ||
                            key === 'responsibles' ||
                            key === 'financings' ||
                            key === 'resources'
                        ) {
                            // Comparación más detallada para detectar cambios
                            const stringOriginal = JSON.stringify(originalData[originalKey])
                            const stringActual = JSON.stringify(value)
                            if (stringOriginal !== stringActual) {
                                changedData[originalKey] = value as any
                            }
                        }
                    }                    
                    // Para archivos, verificamos si hay nuevos o eliminados
                    else if ((key === 'processDocuments' || key === 'costDetailDocuments') && value) {
                        if (value && (value as any[]).length > 0) {
                            changedData[originalKey] = value as any
                        }
                    }
                    // Para campos simples, comparamos directamente
                    else if (JSON.stringify(value) !== JSON.stringify(originalData[originalKey])) {
                        changedData[originalKey] = value as any
                    }
                })
                
                // Enviar solo los datos que han cambiado
                return await updateEvent(eventId, changedData, token)
            }
            
            // Si no hay datos originales para comparar, enviamos todo
            return await updateEvent(eventId, data, token)
        } catch (error) {
            throw error
        } finally {
            setIsSubmitting(false)
        }
    }

    // Modificar la función handleFormSubmit
    const handleFormSubmit = async (
        poaId?: number,
    ) => {
        // Obtener el token del usuario desde el contexto de autenticación o de donde se guarde
        const token = user?.token

        if (!token) {
            // Mostrar error con toast
            toast({
                title: "Error",
                description: "No se ha podido obtener el token de autenticación",
                variant: "destructive",
            })
            return
        }

        if (!poaId) {
            toast({
                title: "Error",
                description: "No se ha podido obtener el ID del POA",
                variant: "destructive",
            })
            return
        }

        // Validar formulario usando Zod
        const validationResults = validateForm(poaId)
        if (validationResults.hasErrors) {
            setFormErrors(validationResults)
            // Activar la visualización del modal de errores
            setShowValidationErrors(true)

            // Cambiar a la pestaña con errores
            if (validationResults.phaseErrors?.pei) {
                setActiveTab("pei")
            } else if (validationResults.phaseErrors?.info) {
                setActiveTab("info")
            } else if (validationResults.phaseErrors?.finance) {
                setActiveTab("finance")
            }

            return
        } else {
            // Asegurarse de que no se muestre el modal de errores
            setShowValidationErrors(false)
        }

        try {
            setIsSubmitting(true)
            const formData = getValues()      

            // Asegurarse de que el poaId esté establecido
            formData.poaId = poaId

            const userId = user?.userId

            if (userId) {
                formData.userId = userId
            }

            // Verificar si estamos editando un evento existente
            const eventId = eventEditing ? eventEditing.eventId : undefined
            
            if (eventId) {
                // Actualizar evento existente
                const result = await updateExistingEvent(eventId, formData, token)

                // Verificar si el resultado contiene un mensaje personalizado
                if (result && typeof result === 'object' && 'message' in result && result.message === "No se detectaron cambios") {
                    // Mensaje informativo para el usuario
                    toast({
                        title: "Información",
                        description: "No se detectaron cambios en el evento",
                        variant: "default",
                    })
                } else {
                    // Mensaje de éxito para actualización normal
                    const eventTypeText = formData.eventNature === 'Extraordinario' ? 'extraordinario' : 'planificado';
                    toast({
                        title: "Éxito",
                        description: `Evento ${eventTypeText} actualizado exitosamente`,
                        variant: "success",
                    })
                }
            } else {
                // Crear nuevo evento
                await submitEvent(formData, token)

                // Mensaje de éxito para creación
                const eventTypeText = formData.eventNature === 'Extraordinario' ? 'extraordinario' : 'planificado';
                toast({
                    title: "Éxito",
                    description: `Evento ${eventTypeText} creado exitosamente`,
                    variant: "success",
                })
            }

            // Cerrar el modal
            setIsOpen(false)

        } catch (error) {
            // Mostrar error con toast
            toast({
                title: "Error",
                description: `Error: ${(error as Error).message}`,
                variant: "destructive",
            })

            throw error
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <EventPlanningFormContext.Provider
            value={{
                register,
                handleSubmit,
                reset: resetWithLog,
                getValues,
                watch,
                control,
                setValue,
                appendIntervention,
                removeIntervention,
                fieldsInterventions,
                appendODS,
                removeODS,
                fieldsODS,
                appendDate,
                updateDate,
                removeDate,
                replaceDates,
                fieldsDates,
                appendResponible,
                updateResponsible,
                removeResponsible,
                fieldsResponsibles,
                appendFinancing,
                removeFinancing,
                updateFinancing,
                fieldsFinancings,
                appendResource,
                removeResource,
                fieldsResources,
                submitEvent,
                updateExistingEvent,
                errors,
                isSubmitting,
                setIsSubmitting,
                validateForm,
                formErrors,
                setFormErrors,
                handleFormSubmit,
                showValidationErrors,
                setShowValidationErrors,
                activeTab,
                setActiveTab,
                phases,
                handlePhaseClick,
                getCurrentPhase,
                scrollContainerRef,
            }}
        >
            {children}
        </EventPlanningFormContext.Provider>
    )
}