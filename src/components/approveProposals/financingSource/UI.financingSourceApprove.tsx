"use client"

import { useState } from "react"
import { useAreaObjectiveStrategicApproval } from './useFinancingSourceProposals'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckIcon, XIcon, ArrowUpDown, Loader2, SaveIcon } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function FinancingSourceApprove() {
    const {
        proposals,
        loading,
        error,
        sortColumn,
        sortDirection,
        toggleSort,
        handleApproval,
        handleUpdateProposal,
        handleChangeStatus
    } = useAreaObjectiveStrategicApproval()

    const [editedProposals, setEditedProposals] = useState<Record<number, { name: string; strategicObjective: string }>>({})

    // Filtrar propuestas por estado
    const pendingProposals = proposals.filter(proposal => proposal.status === 'Pendiente')
    const approvedProposals = proposals.filter(proposal => proposal.status === 'Aprobado')
    const rejectedProposals = proposals.filter(proposal => proposal.status === 'Rechazado')

    const handleInputChange = (id: number, field: 'name' | 'strategicObjective', value: string) => {
        setEditedProposals(prev => ({
            ...prev,
            [id]: {
                ...prev[id] || { 
                    name: proposals.find(p => p.strategicAreaId === id)?.name || '',
                    strategicObjective: proposals.find(p => p.strategicAreaId === id)?.strategicObjective || ''
                },
                [field]: value
            }
        }))
    }

    const handleSaveChanges = (id: number) => {
        if (editedProposals[id]) {
            handleUpdateProposal(id, editedProposals[id].name, editedProposals[id].strategicObjective)
            
            // Limpiar el estado de edición para esta propuesta
            setEditedProposals(prev => {
                const newState = { ...prev }
                delete newState[id]
                return newState
            })
        }
    }

    const renderProposalsTable = (proposalsList: typeof proposals) => {
        if (loading) {
            return (
                <div className="flex justify-center p-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )
        }

        if (proposalsList.length === 0) {
            return (
                <div className="text-center py-8 text-muted-foreground">
                    No hay propuestas en esta categoría
                </div>
            )
        }

        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead 
                            className="cursor-pointer"
                            onClick={() => toggleSort('name')}
                        >
                            <div className="flex items-center">
                                Área Estratégica
                                <ArrowUpDown className={`ml-2 h-4 w-4 ${sortColumn === 'name' ? 'opacity-100' : 'opacity-40'}`} />
                            </div>
                        </TableHead>
                        <TableHead 
                            className="cursor-pointer"
                            onClick={() => toggleSort('strategicObjective')}
                        >
                            <div className="flex items-center">
                                Objetivo Estratégico
                                <ArrowUpDown className={`ml-2 h-4 w-4 ${sortColumn === 'strategicObjective' ? 'opacity-100' : 'opacity-40'}`} />
                            </div>
                        </TableHead>
                        <TableHead>Propuesto por</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {proposalsList.map((proposal) => {
                        const isEdited = editedProposals[proposal.strategicAreaId] !== undefined
                        const areaValue = isEdited ? editedProposals[proposal.strategicAreaId].name : proposal.name
                        const objectiveValue = isEdited ? editedProposals[proposal.strategicAreaId].strategicObjective : proposal.strategicObjective
                        const proposedByName = proposal.user ? `${proposal.user.firstName} ${proposal.user.lastName}` : 'Usuario desconocido'
                        
                        return (
                            <TableRow key={proposal.strategicAreaId}>
                                <TableCell className="font-medium">
                                    <Input 
                                        value={areaValue} 
                                        onChange={(e) => handleInputChange(proposal.strategicAreaId, 'name', e.target.value)}
                                        className={isEdited ? "border-primary" : "border-transparent"}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input 
                                        value={objectiveValue} 
                                        onChange={(e) => handleInputChange(proposal.strategicAreaId, 'strategicObjective', e.target.value)}
                                        className={isEdited ? "border-primary" : "border-transparent"}
                                    />
                                </TableCell>
                                <TableCell>{proposedByName}</TableCell>
                                <TableCell>{new Date(proposal.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                    {proposal.status === 'Pendiente' ? (
                                        <div className="flex justify-end space-x-2">
                                            {isEdited && (
                                                <Button
                                                    variant="outline" 
                                                    size="sm"
                                                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                                    onClick={() => handleSaveChanges(proposal.strategicAreaId)}
                                                >
                                                    <SaveIcon className="h-4 w-4 mr-1" />
                                                    Guardar
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline" 
                                                size="sm"
                                                className="text-green-600 border-green-600 hover:bg-green-50"
                                                onClick={() => handleApproval(proposal.strategicAreaId, true)}
                                            >
                                                <CheckIcon className="h-4 w-4 mr-1" />
                                                Aprobar
                                            </Button>
                                            <Button
                                                variant="outline" 
                                                size="sm"
                                                className="text-red-600 border-red-600 hover:bg-red-50"
                                                onClick={() => handleApproval(proposal.strategicAreaId, false)}
                                            >
                                                <XIcon className="h-4 w-4 mr-1" />
                                                Rechazar
                                            </Button>
                                        </div>
                                    ) : proposal.status === 'Aprobado' ? (
                                        <div className="flex justify-end space-x-2">
                                            {isEdited && (
                                                <Button
                                                    variant="outline" 
                                                    size="sm"
                                                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                                    onClick={() => handleSaveChanges(proposal.strategicAreaId)}
                                                >
                                                    <SaveIcon className="h-4 w-4 mr-1" />
                                                    Guardar
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline" 
                                                size="sm"
                                                className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                                                onClick={() => handleChangeStatus(proposal.strategicAreaId, 'Pendiente')}
                                            >
                                                Mover a Pendiente
                                            </Button>
                                            <Button
                                                variant="outline" 
                                                size="sm"
                                                className="text-red-600 border-red-600 hover:bg-red-50"
                                                onClick={() => handleChangeStatus(proposal.strategicAreaId, 'Rechazado')}
                                            >
                                                Rechazar
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex justify-end space-x-2">
                                            {isEdited && (
                                                <Button
                                                    variant="outline" 
                                                    size="sm"
                                                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                                    onClick={() => handleSaveChanges(proposal.strategicAreaId)}
                                                >
                                                    <SaveIcon className="h-4 w-4 mr-1" />
                                                    Guardar
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline" 
                                                size="sm"
                                                className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                                                onClick={() => handleChangeStatus(proposal.strategicAreaId, 'Pendiente')}
                                            >
                                                Mover a Pendiente
                                            </Button>
                                            <Button
                                                variant="outline" 
                                                size="sm"
                                                className="text-green-600 border-green-600 hover:bg-green-50"
                                                onClick={() => handleChangeStatus(proposal.strategicAreaId, 'Aprobado')}
                                            >
                                                Aprobar
                                            </Button>
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        )
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Propuestas de Áreas y Objetivos Estratégicos</CardTitle>
            </CardHeader>
            <CardContent>
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Tabs defaultValue="Pendiente" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                        <TabsTrigger value="Pendiente" className="data-[state=active]:bg-yellow-100 data-[state=active]:text-yellow-800">
                            Pendientes ({pendingProposals.length})
                        </TabsTrigger>
                        <TabsTrigger value="Aprobado" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800">
                            Aprobadas ({approvedProposals.length})
                        </TabsTrigger>
                        <TabsTrigger value="Rechazado" className="data-[state=active]:bg-red-100 data-[state=active]:text-red-800">
                            Rechazadas ({rejectedProposals.length})
                        </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="Pendiente">
                        {renderProposalsTable(pendingProposals)}
                    </TabsContent>
                    
                    <TabsContent value="Aprobado">
                        {renderProposalsTable(approvedProposals)}
                    </TabsContent>
                    
                    <TabsContent value="Rechazado">
                        {renderProposalsTable(rejectedProposals)}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
