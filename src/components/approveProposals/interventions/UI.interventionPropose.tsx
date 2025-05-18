"use client"
import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

// Components
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search } from "lucide-react"

// Types
import { InterventionProposalSchema } from "./schema.intervention"
import { InterventionProposal } from "./type.intervention"
import { Strategy } from "@/types/Strategy"

interface ProposeInterventionProps {
    isOpen: boolean
    onClose: () => void
    onPropose: (data: InterventionProposal) => Promise<void>
    strategies: Strategy[]
}

export function ProposeInterventionDialog({
    isOpen,
    onClose,
    onPropose,
    strategies
}: ProposeInterventionProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    
    const form = useForm<InterventionProposal>({
        resolver: zodResolver(InterventionProposalSchema),
        defaultValues: {
            name: "",
            strategyId: 0,
            reasonForChange: ""
        }
    })

    const handleSubmit = async (data: InterventionProposal) => {
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

    const filteredStrategies = strategies.filter(strategy => 
        strategy.description.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Proponer Nueva Intervención</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="strategyId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Estrategia</FormLabel>
                                    <Select 
                                        onValueChange={(value) => field.onChange(parseInt(value))}
                                        defaultValue={field.value ? field.value.toString() : undefined}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar área estratégica" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <div className="flex items-center px-3 pb-2">
                                                <Search className="mr-2 h-4 w-4 shrink-0 text-gray-500" />
                                                <Input
                                                    placeholder="Buscar área..."
                                                    className="h-8 w-full bg-transparent focus:outline-none focus:ring-0 focus:border-primary border-primary"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                            </div>
                                            <ScrollArea className="h-[200px]">
                                                {filteredStrategies.map((strategy) => (
                                                    <SelectItem 
                                                        key={strategy.strategyId} 
                                                        value={strategy.strategyId.toString()}
                                                        className="flex items-center cursor-pointer hover:bg-primary/10"
                                                    >
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 w-6 h-6 rounded bg-primary text-white font-bold flex items-center justify-center mr-2">
                                                                {strategy.strategyId}
                                                            </div>
                                                            <span>{strategy.description}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </ScrollArea>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre de la Intervención</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ingrese el nombre de la intervención" {...field} />
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
                                        <Input placeholder="Ingrese la justificación" {...field} />
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
