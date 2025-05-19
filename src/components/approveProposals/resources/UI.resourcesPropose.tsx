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
import { ResourcesProposalSchema } from "./schema.resources"
import { ResourcesProposal } from "./type.resources"

interface ProposeResourcesProps {
    isOpen: boolean
    onClose: () => void
    onPropose: (data: ResourcesProposal) => Promise<void>
}

export function ProposeResourcesDialog({
    isOpen,
    onClose,
    onPropose
}: ProposeResourcesProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<ResourcesProposal>({
        resolver: zodResolver(ResourcesProposalSchema),
        defaultValues: {
            name: "",
            reasonForChange: ""
        }
    })

    const handleSubmit = async (data: ResourcesProposal) => {
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
                    <DialogTitle>Proponer Nuevo Recurso</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Recurso</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ingrese el recurso" {...field} />
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
                                    <FormLabel>Justificación</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ingrese la razón por la cual se propone el recurso" {...field} />
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
