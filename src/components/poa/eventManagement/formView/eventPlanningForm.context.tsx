"use client"
import { createContext, useEffect, useState } from "react";
import { Control, FieldArrayWithId, UseFieldArrayAppend, UseFieldArrayRemove, UseFormGetValues, UseFormRegister, UseFormSetValue, UseFormWatch, useForm, useFieldArray, UseFormHandleSubmit, UseFormReset, UseFieldArrayUpdate, UseFieldArrayReplace } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";

// Types
import { FullEventRequest, fullEventSchema } from "./eventPlanningForm.schema";
import { createEvent, updateEvent } from "./eventPlanningForm.service";
import { ResponseFullEvent } from "./eventPlanningForm.type";

// Interfaz de errores para el modal
export interface ValidationErrors {
    hasErrors: boolean;
    errorList: {
        field: string;
        message: string;
    }[];
}

interface EventPlanningFormContextProps {
    fieldsInterventions: FieldArrayWithId<FullEventRequest, "interventions">[];
    appendIntervention: UseFieldArrayAppend<FullEventRequest>
    removeIntervention: UseFieldArrayRemove
    fieldsODS: FieldArrayWithId<FullEventRequest, "ods">[];
    appendODS: UseFieldArrayAppend<FullEventRequest>
    removeODS: UseFieldArrayRemove
    fieldsDates: FieldArrayWithId<FullEventRequest, "dates">[];
    appendDate: UseFieldArrayAppend<FullEventRequest>
    updateDate: UseFieldArrayUpdate<FullEventRequest>
    removeDate: UseFieldArrayRemove
    replaceDates: UseFieldArrayReplace<FullEventRequest>
    appendResponible: UseFieldArrayAppend<FullEventRequest>
    updateResponsible: UseFieldArrayUpdate<FullEventRequest>
    removeResponsible: UseFieldArrayRemove
    fieldsResponsibles: FieldArrayWithId<FullEventRequest, "responsibles">[];
    appendFinancing: UseFieldArrayAppend<FullEventRequest>
    removeFinancing: UseFieldArrayRemove
    updateFinancing: UseFieldArrayUpdate<FullEventRequest>
    fieldsFinancings: FieldArrayWithId<FullEventRequest, "financings">[];
    appendResource: UseFieldArrayAppend<FullEventRequest>
    removeResource: UseFieldArrayRemove
    fieldsResources: FieldArrayWithId<FullEventRequest, "resources">[];
    getValues: UseFormGetValues<FullEventRequest>
    watch: UseFormWatch<FullEventRequest>
    register: UseFormRegister<FullEventRequest>
    setValue: UseFormSetValue<FullEventRequest>
    control: Control<FullEventRequest>
    handleSubmit: UseFormHandleSubmit<FullEventRequest>
    reset: UseFormReset<FullEventRequest>
    submitEvent: (data: FullEventRequest, token: string) => Promise<any>
    updateExistingEvent: (eventId: number, data: FullEventRequest, token: string) => Promise<any>
    errors: any
    isSubmitting: boolean
    setIsSubmitting: (isSubmitting: boolean) => void
    validateForm: () => ValidationErrors
    formErrors: ValidationErrors
    setFormErrors: (errors: ValidationErrors) => void
}

const notImplemented = (name: string) => {
    return (...args: any[]) => {
        throw new Error(`${name} has not been implemented. Did you forget to wrap your component in EventPlanningFormProvider?`)
    }
};

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
    setFormErrors: notImplemented("setFormErrors")
})

export const EventPlanningFormProvider: React.FC<{
    children: React.ReactNode;
    onSubmit: (data: FullEventRequest) => void;
    event?: FullEventRequest;
}> = ({ children, onSubmit, event }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState<ValidationErrors>({ hasErrors: false, errorList: [] });

    const { register, handleSubmit, reset, getValues, watch, control, setValue, formState: { errors } } = useForm<FullEventRequest>({
        resolver: zodResolver(fullEventSchema),
        defaultValues: event
    });

    // Efecto para cargar valores iniciales del evento si se proporciona
    useEffect(() => {
        if (event) {
            reset(event);
        }
    }, [event, reset]);

    // Field arrays
    const { append: appendIntervention, remove: removeIntervention, fields: fieldsInterventions } = useFieldArray<FullEventRequest, 'interventions'>({
        control,
        name: 'interventions'
    })

    const { append: appendODS, remove: removeODS, fields: fieldsODS } = useFieldArray<FullEventRequest, 'ods'>({
        control,
        name: 'ods'
    })

    const { append: appendDate, update: updateDate, remove: removeDate, replace: replaceDates, fields: fieldsDates } = useFieldArray<FullEventRequest, 'dates'>({
        control,
        name: 'dates'
    })

    const { append: appendResponible, remove: removeResponsible, update: updateResponsible, fields: fieldsResponsibles } = useFieldArray<FullEventRequest, 'responsibles'>({
        control,
        name: 'responsibles'
    })

    const { append: appendFinancing, remove: removeFinancing, update: updateFinancing, fields: fieldsFinancings } = useFieldArray<FullEventRequest, 'financings'>({
        control,
        name: 'financings'
    })

    const { append: appendResource, remove: removeResource, fields: fieldsResources } = useFieldArray<FullEventRequest, 'resources'>({
        control,
        name: 'resources'
    })

    // Función para validar el formulario antes de enviar
    const validateForm = (): ValidationErrors => {
        const errorList: { field: string; message: string }[] = [];
        const formData = getValues();

        // Validar campos obligatorios
        if (!formData.name || formData.name.trim() === '') {
            errorList.push({ field: 'name', message: 'El nombre del evento es obligatorio' });
        }

        if (!formData.objective || formData.objective.trim() === '') {
            errorList.push({ field: 'objective', message: 'El objetivo es obligatorio' });
        }

        if (!formData.achievementIndicator || formData.achievementIndicator.trim() === '') {
            errorList.push({ field: 'achievementIndicator', message: 'El indicador de logro es obligatorio' });
        }

        if (!formData.dates || formData.dates.length === 0) {
            errorList.push({ field: 'dates', message: 'Debe agregar al menos una fecha' });
        }

        if (formData.type === 'Proyecto' && (!formData.dates || formData.dates.length !== 1)) {
            errorList.push({ field: 'dates', message: 'Los proyectos deben tener exactamente una fecha' });
        }

        if (!formData.responsibles || formData.responsibles.length === 0) {
            errorList.push({ field: 'responsibles', message: 'Debe agregar al menos un responsable' });
        }

        if (!formData.totalCost || formData.totalCost <= 0) {
            errorList.push({ field: 'totalCost', message: 'El costo total debe ser mayor que cero' });
        }

        if (!formData.purchaseTypeId) {
            errorList.push({ field: 'purchaseTypeId', message: 'Debe seleccionar un tipo de compra' });
        }

        if (!formData.campusId) {
            errorList.push({ field: 'campusId', message: 'Debe seleccionar un campus' });
        }

        if (!formData.interventions || formData.interventions.length === 0) {
            errorList.push({ field: 'interventions', message: 'Debe seleccionar al menos una intervención' });
        }

        if (!formData.ods || formData.ods.length === 0) {
            errorList.push({ field: 'ods', message: 'Debe seleccionar al menos un ODS' });
        }

        if (!formData.resources || formData.resources.length === 0) {
            errorList.push({ field: 'resources', message: 'Debe seleccionar al menos un recurso' });
        }

        return {
            hasErrors: errorList.length > 0,
            errorList
        };
    };

    // Función para enviar un nuevo evento
    const submitEvent = async (data: FullEventRequest, token: string) => {
        try {
            setIsSubmitting(true);
            const result = await createEvent(data, token);
            return result;
        } catch (error) {
            console.error("Error al crear el evento:", error);
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    // Función para actualizar un evento existente
    const updateExistingEvent = async (eventId: number, data: FullEventRequest, token: string) => {
        try {
            setIsSubmitting(true);
            const result = await updateEvent(eventId, data, token);
            return result;
        } catch (error) {
            console.error("Error al actualizar el evento:", error);
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <EventPlanningFormContext.Provider
            value={{
                register,
                handleSubmit,
                reset,
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
                setFormErrors
            }}
        >
            {children}
        </EventPlanningFormContext.Provider>
    )
}