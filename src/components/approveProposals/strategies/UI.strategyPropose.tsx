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
import { StrategyProposalSchema } from "./schema.strategy"
import { StrategyProposal } from "./type.strategy"
import { StrategicArea } from "@/types/StrategicArea"

interface ProposeStrategyProps {
    isOpen: boolean
    onClose: () => void
    onPropose: (data: StrategyProposal) => Promise<void>
    strategicAreas: StrategicArea[]
}

export function ProposeStrategyDialog({
    isOpen,
    onClose,
    onPropose,
    strategicAreas
}: ProposeStrategyProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    
    const form = useForm<StrategyProposal>({
        resolver: zodResolver(StrategyProposalSchema),
        defaultValues: {
            description: "",
            strategicAreaId: 0,
            reasonForChange: ""
        }
    })

    const handleSubmit = async (data: StrategyProposal) => {
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

    const filteredAreas = strategicAreas.filter(area => 
        area.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Proponer Nueva Estrategia</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="strategicAreaId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Área Estratégica</FormLabel>
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
                                                {filteredAreas.map((area) => (
                                                    <SelectItem 
                                                        key={area.strategicAreaId} 
                                                        value={area.strategicAreaId.toString()}
                                                        className="flex items-center cursor-pointer hover:bg-primary/10"
                                                    >
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 w-6 h-6 rounded bg-primary text-white font-bold flex items-center justify-center mr-2">
                                                                {area.strategicAreaId}
                                                            </div>
                                                            <span>{area.name}</span>
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
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción de la Estrategia</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ingrese la descripción de la estrategia" {...field} />
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
