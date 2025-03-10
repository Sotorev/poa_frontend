"use client"
import { createContext, useEffect } from "react";
import { Control, FieldArrayWithId, UseFieldArrayAppend, UseFieldArrayRemove, UseFormGetValues, UseFormRegister, UseFormSetValue, UseFormWatch, useForm, useFieldArray, UseFormHandleSubmit, UseFormReset, UseFieldArrayUpdate, UseFieldArrayReplace } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";

// Types
import { FullEventRequest, fullEventSchema } from "./eventPlanningForm.schema";
import { createEvent, updateEvent } from "./eventPlanningForm.service";

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
    errors: {}
})

export const EventPlanningFormProvider: React.FC<{
    children: React.ReactNode;
    onSubmit: (data: FullEventRequest) => void;
}> = ({ children, onSubmit }) => {
    const { register, handleSubmit, reset, getValues, watch, control, setValue, formState: { errors } } = useForm<FullEventRequest>({
        resolver: zodResolver(fullEventSchema)
    });

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

    // Función para enviar un nuevo evento
    const submitEvent = async (data: FullEventRequest, token: string) => {
        try {
            return await createEvent(data, token);
        } catch (error) {
            console.error("Error al crear el evento:", error);
            throw error;
        }
    };

    // Función para actualizar un evento existente
    const updateExistingEvent = async (eventId: number, data: FullEventRequest, token: string) => {
        try {
            return await updateEvent(eventId, data, token);
        } catch (error) {
            console.error("Error al actualizar el evento:", error);
            throw error;
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
                errors
            }}
        >
            {children}
        </EventPlanningFormContext.Provider>
    )
}