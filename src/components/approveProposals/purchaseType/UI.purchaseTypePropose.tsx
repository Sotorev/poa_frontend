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
import { PurchaseTypeProposalSchema } from "./schema.purchaseType"
import { PurchaseTypeProposal } from "./type.purchaseType"

interface ProposePurchaseTypeProps {
    isOpen: boolean
    onClose: () => void
    onPropose: (data: PurchaseTypeProposal) => Promise<void>
}

export function ProposePurchaseTypeDialog({
    isOpen,
    onClose,
    onPropose
}: ProposePurchaseTypeProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<PurchaseTypeProposal>({
        resolver: zodResolver(PurchaseTypeProposalSchema),
        defaultValues: {
            name: "",
            reasonForChange: ""
        }
    })

    const handleSubmit = async (data: PurchaseTypeProposal) => {
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
                    <DialogTitle>Proponer Nuevo Tipo de Compra</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de Compra</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ingrese el tipo de compra" {...field} />
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
                                        <Input placeholder="Ingrese la razón por la cual se propone el tipo de compra" {...field} />
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
