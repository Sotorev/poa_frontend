import { createContext, useContext } from "react";
import { Control, FieldArrayWithId, UseFieldArrayAppend, UseFieldArrayRemove, UseFormGetValues, UseFormRegister, UseFormSetValue, UseFormWatch, useForm, useFieldArray, UseFormHandleSubmit, UseFormReset } from "react-hook-form"

// Types
import { FullEventRequest } from "./eventPlanningForm.schema";

interface EventPlanningFormContextProps {
    fieldsInterventions: FieldArrayWithId<FullEventRequest, "interventions">[];
    appendIntervention: UseFieldArrayAppend<FullEventRequest>
    removeIntervention: UseFieldArrayRemove
    fieldsODS: FieldArrayWithId<FullEventRequest, "ods">[];
    appendODS: UseFieldArrayAppend<FullEventRequest>
    removeODS: UseFieldArrayRemove
    getValues: UseFormGetValues<FullEventRequest>
    watch: UseFormWatch<FullEventRequest>
    register: UseFormRegister<FullEventRequest>
    setValue: UseFormSetValue<FullEventRequest>
    control: Control<FullEventRequest>
    handleSubmit: UseFormHandleSubmit<FullEventRequest>
    reset: UseFormReset<FullEventRequest>
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
    getValues: notImplemented("getValues"),
    watch: notImplemented("watch"),
    register: notImplemented("register"),
    setValue: notImplemented("setValue"),
    control: {} as Control<FullEventRequest>,
    handleSubmit: notImplemented("handleSubmit"),
    reset: notImplemented("reset")
})

export const EventPlanningFormProvider: React.FC<{ 
    children: React.ReactNode;
    onSubmit: (data: FullEventRequest) => void;
}> = ({ children, onSubmit }) => {
    const { register, handleSubmit, reset, getValues, watch, control, setValue } = useForm<FullEventRequest>()
    const { append: appendIntervention, remove: removeIntervention, fields: fieldsInterventions } = useFieldArray<FullEventRequest, 'interventions'>({
        control,
        name: 'interventions'
    })
    const { append: appendODS, remove: removeODS, fields: fieldsODS } = useFieldArray<FullEventRequest, 'ods'>({
        control,
        name: 'ods'
    })

    handleSubmit(onSubmit)

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
                fieldsODS
            }}
        >
            {children}
        </EventPlanningFormContext.Provider>
    )
}