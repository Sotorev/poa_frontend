"use client"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

// Components
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

// Types
import { proposeAreaObjectiveStrategicSchema } from "./schema.AreaObjectiveStrategic"
import { ProposeAreaObjectiveStrategic } from "./type.AreaObjectiveStrategic"

interface ProposeAreaObjectiveStrategicProps {
    isOpen: boolean
    onClose: () => void
    onPropose: (data: ProposeAreaObjectiveStrategic) => Promise<void>
}

export function ProposeAreaObjectiveStrategicDialog({
    isOpen,
    onClose,
    onPropose
}: ProposeAreaObjectiveStrategicProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<ProposeAreaObjectiveStrategic>({
        resolver: zodResolver(proposeAreaObjectiveStrategicSchema),
        defaultValues: {
            nameArea: "",
            nameObjective: ""
        }
    })

    const handleSubmit = async (data: ProposeAreaObjectiveStrategic) => {
        try {
            setIsSubmitting(true)
            await onPropose(data)
            form.reset()
            onClose()
        } catch (error) {
            console.error("Error al proponer:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Proponer Nuevo Objetivo Estratégico</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="nameArea"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Área Estratégica</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ingrese el área estratégica" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="nameObjective"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Objetivo Estratégico</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ingrese el objetivo estratégico" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Proponiendo..." : "Proponer"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
