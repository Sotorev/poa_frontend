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
import { AreaObjectiveStrategicProposalSchema } from "./schema.AreaObjectiveStrategic"
import { AreaObjectiveStrategicProposal } from "./type.AreaObjectiveStrategic"

interface ProposeAreaObjectiveStrategicProps {
    isOpen: boolean
    onClose: () => void
    onPropose: (data: AreaObjectiveStrategicProposal) => Promise<void>
}

export function ProposeAreaObjectiveStrategicDialog({
    isOpen,
    onClose,
    onPropose
}: ProposeAreaObjectiveStrategicProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<AreaObjectiveStrategicProposal>({
        resolver: zodResolver(AreaObjectiveStrategicProposalSchema),
        defaultValues: {
            name: "",
            strategicObjective: "",
            reasonForChange: ""
        }
    })

    const handleSubmit = async (data: AreaObjectiveStrategicProposal) => {
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
                            name="name"
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
                            name="strategicObjective"
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

                        <FormField
                            control={form.control}
                            name="reasonForChange"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Razón del cambio</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ingrese la razón del cambio" {...field} />
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
