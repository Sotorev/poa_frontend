import { createContext, useContext } from "react";
import { Control, FieldArrayWithId, UseFieldArrayAppend, UseFieldArrayRemove, UseFormGetValues, UseFormRegister, UseFormSetValue, UseFormWatch, useForm, useFieldArray, UseFormHandleSubmit, UseFormReset } from "react-hook-form"

// Types
import { FullEventRequest } from "./eventPlanningForm.schema";

interface EventPlanningFormContextProps {
    fields: FieldArrayWithId<FullEventRequest, "interventions">[];
    getValues: UseFormGetValues<FullEventRequest>
    watch: UseFormWatch<FullEventRequest>
    register: UseFormRegister<FullEventRequest>
    setValue: UseFormSetValue<FullEventRequest>
    append: UseFieldArrayAppend<FullEventRequest>
    remove: UseFieldArrayRemove
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
    fields: [],
    getValues: notImplemented("getValues"),
    watch: notImplemented("watch"),
    register: notImplemented("register"),
    setValue: notImplemented("setValue"),
    append: notImplemented("append"),
    remove: notImplemented("remove"),
    control: {} as Control<FullEventRequest>,
    handleSubmit: notImplemented("handleSubmit"),
    reset: notImplemented("reset")
})

export const EventPlanningFormProvider: React.FC<{ 
    children: React.ReactNode;
    onSubmit: (data: FullEventRequest) => void;
}> = ({ children, onSubmit }) => {
    const { register, handleSubmit, reset, getValues, watch, control, setValue } = useForm<FullEventRequest>()
    const { append, remove, fields } = useFieldArray<FullEventRequest, 'interventions'>({
        control,
        name: 'interventions'
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
                append,
                remove,
                fields
            }}
        >
            {children}
        </EventPlanningFormContext.Provider>
    )
}