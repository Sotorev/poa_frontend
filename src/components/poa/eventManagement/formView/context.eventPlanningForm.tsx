"use client"
import { createContext, useEffect, useState } from "react";
import { Control, FieldArrayWithId, UseFieldArrayAppend, UseFieldArrayRemove, UseFormGetValues, UseFormRegister, UseFormSetValue, UseFormWatch, useForm, useFieldArray, UseFormHandleSubmit, UseFormReset, UseFieldArrayUpdate, UseFieldArrayReplace } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";
import { useCurrentUser } from "@/hooks/use-current-user";
// Types
import { FullEventRequest, fullEventSchema } from "./schema.eventPlanningForm";
import { createEvent, updateEvent } from "./service.eventPlanningForm";
import { ResponseFullEvent } from "./eventPlanningForm.type";
import { useToast } from "@/hooks/use-toast";

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
    showValidationErrors: boolean
    setShowValidationErrors: (showValidationErrors: boolean) => void
    handleFormSubmit: (poaId?: number, onSuccess?: (result: ResponseFullEvent) => void, onClose?: () => void) => Promise<void>
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
    setFormErrors: notImplemented("setFormErrors"),
    showValidationErrors: false,
    setShowValidationErrors: notImplemented("setShowValidationErrors"),
    handleFormSubmit: notImplemented("handleFormSubmit")
})

export const EventPlanningFormProvider: React.FC<{
    children: React.ReactNode;
    onSubmit: (data: FullEventRequest) => void;
    event?: FullEventRequest;
}> = ({ children, onSubmit, event }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState<ValidationErrors>({ hasErrors: false, errorList: [] });
    const [showValidationErrors, setShowValidationErrors] = useState(false);
    const user = useCurrentUser();
    const { toast } = useToast();

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
    const validateForm = (poaId?: number): ValidationErrors => {
        if (poaId) {
            setValue("poaId", poaId);
        }
        setValue("statusId", 1);
        setValue("completionPercentage", 0);
        setValue("eventNature", "Planificado");
        setValue("userId", user?.userId || 0);
        setValue("isDelayed", false);

        const formData = getValues();

        // Usamos Zod para validar el formulario
        const validationResult = fullEventSchema.safeParse(formData);

        if (!validationResult.success) {
            // Si hay errores, los formateamos para el modal
            const errorList = validationResult.error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));

            return {
                hasErrors: true,
                errorList
            };
        }

        return {
            hasErrors: false,
            errorList: []
        };
    };

    // Función para enviar un nuevo evento
    const submitEvent = async (data: FullEventRequest, token: string) => {
        try {
            setIsSubmitting(true);
            const result = await createEvent(data, token);
            return result;
        } catch (error) {
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
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    // Función para manejar el envío del formulario
    const handleFormSubmit = async (poaId?: number, onSuccess?: (result: ResponseFullEvent) => void, onClose?: () => void) => {
        // Obtener el token del usuario desde el contexto de autenticación o de donde se guarde
        const token = user?.token;

        if (!token) {
            // Mostrar error con toast
            toast({
                title: "Error",
                description: "No se ha podido obtener el token de autenticación",
                variant: "destructive"
            });
            return;
        }

        if (!poaId) {
            toast({
                title: "Error",
                description: "No se ha podido obtener el ID del POA",
                variant: "destructive"
            });
            return;
        }

        // Validar formulario usando Zod
        const validationResults = validateForm(poaId);
        if (validationResults.hasErrors) {
            setFormErrors(validationResults);
            // Activar la visualización del modal de errores
            setShowValidationErrors(true);
            return;
        } else {
            // Asegurarse de que no se muestre el modal de errores
            setShowValidationErrors(false);
        }

        try {
            setIsSubmitting(true);
            const formData = getValues();

            // Asegurarse de que el poaId esté establecido
            formData.poaId = poaId;

            const userId = user?.userId;

            if (userId) {
                formData.userId = userId;
            }

            let result;

            // Verificar si estamos editando un evento existente
            // Aquí accedemos a event.eventId si existe, o undefined si no
            const eventId = event && 'eventId' in event ? (event as any).eventId : undefined;

            if (eventId) {
                // Actualizar evento existente
                result = await updateExistingEvent(eventId, formData, token);
                
                // Mensaje de éxito para actualización
                toast({
                    title: "Éxito",
                    description: "Evento actualizado exitosamente",
                    variant: "success"
                });
            } else {
                // Crear nuevo evento
                result = await submitEvent(formData, token);
                
                // Mensaje de éxito para creación
                toast({
                    title: "Éxito",
                    description: "Evento creado exitosamente",
                    variant: "success"
                });
            }

            // Callback para notificar al componente padre
            if (onSuccess && result) {
                onSuccess(result);
            }

            // Cerrar el modal si se proporciona un callback
            if (onClose) {
                onClose();
            }

        } catch (error) {
          
            
            // Mostrar error con toast
            toast({
                title: "Error",
                description: `Error: ${(error as Error).message}`,
                variant: "destructive"
            });
            
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
                setFormErrors,
                handleFormSubmit,
                showValidationErrors,
                setShowValidationErrors
            }}
        >
            {children}
        </EventPlanningFormContext.Provider>
    )
}