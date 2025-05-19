"use client"

import { useState, useEffect, useContext } from "react"
import { useResourcesProposals } from './useResourcesProposals'
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
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { CheckIcon, XIcon, ArrowUpDown, Loader2, SaveIcon, Search, ChevronLeft, ChevronRight, PlusCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProposeResourcesDialog } from "./UI.resourcesPropose"
import { PoaContext } from "@/contexts/PoaContext"

export function ResourcesApprove() {
    const {
        proposals,
        allProposals,
        proposalsByStatus,
        loading,
        error,
        sortColumn,
        sortDirection,
        toggleSort,
        handleApproval,
        handleUpdateProposal,
        handleChangeStatus,
        handleAddResource,
        isProposeResourceDialogOpen,
        setIsProposeResourceDialogOpen,
        searchTerm,
        handleSearch,
        currentPage,
        itemsPerPage,
        totalPages,
        goToNextPage,
        goToPreviousPage,
        goToPage,
        changeItemsPerPage,
        totalItems,
        activeTab,
        setActiveTabState,
        pendingCount,
        approvedCount,
        rejectedCount
    } = useResourcesProposals()

    const [editedProposals, setEditedProposals] = useState<Record<number, { name: string }>>({})
    const [searchInput, setSearchInput] = useState('')
    
    // Ya no necesitamos filtrar las propuestas por estado aquí porque el hook ya lo hace
    
    // Efecto para actualizar la búsqueda después de un breve retraso
    useEffect(() => {
        const timer = setTimeout(() => {
            handleSearch(searchInput)
        }, 300)
        
        return () => clearTimeout(timer)
    }, [searchInput])

    const handleInputChange = (id: number, field: 'name', value: string) => {
        setEditedProposals(prev => ({
            ...prev,
            [id]: {
                ...prev[id] || {
                    name: proposals.find(p => p.resourceId === id)?.name || ''
                },
                [field]: value
            }
        }))
    }

    const handleSaveChanges = (id: number) => {
        if (editedProposals[id]) {
            handleUpdateProposal(id, editedProposals[id].name)

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
                                Nombre del Recurso
                                <ArrowUpDown className={`ml-2 h-4 w-4 ${sortColumn === 'name' ? 'opacity-100' : 'opacity-40'}`} />
                            </div>
                        </TableHead>
                        <TableHead>Justificación</TableHead>
                        <TableHead>Propuesto por</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {proposalsList.map((proposal) => {
                        const isEdited = editedProposals[proposal.resourceId] !== undefined
                        const nameValue = isEdited ? editedProposals[proposal.resourceId].name : proposal.name
                        const proposedByName = proposal.user ? `${proposal.user.firstName} ${proposal.user.lastName}` : 'Usuario desconocido'

                        return (
                            <TableRow key={proposal.resourceId}>
                                <TableCell className="font-medium">
                                    <Input
                                        value={nameValue}
                                        onChange={(e) => handleInputChange(proposal.resourceId, 'name', e.target.value)}
                                        className={isEdited ? "border-primary" : "border-transparent"}
                                    />
                                </TableCell>
                                <TableCell>{proposal.reasonForChange || 'N/A'}</TableCell>
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
                                                    onClick={() => handleSaveChanges(proposal.resourceId)}
                                                >
                                                    <SaveIcon className="h-4 w-4 mr-1" />
                                                    Guardar
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-green-600 border-green-600 hover:bg-green-50"
                                                onClick={() => handleApproval(proposal.resourceId, proposal.reasonForChange, true)}
                                            >
                                                <CheckIcon className="h-4 w-4 mr-1" />
                                                Aprobar
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-red-600 border-red-600 hover:bg-red-50"
                                                onClick={() => handleApproval(proposal.resourceId, proposal.reasonForChange, false)}
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
                                                    onClick={() => handleSaveChanges(proposal.resourceId)}
                                                >
                                                    <SaveIcon className="h-4 w-4 mr-1" />
                                                    Guardar
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                                                onClick={() => handleChangeStatus(proposal.resourceId, proposal.reasonForChange, 'Pendiente')}
                                            >
                                                Mover a Pendiente
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-red-600 border-red-600 hover:bg-red-50"
                                                onClick={() => handleChangeStatus(proposal.resourceId, proposal.reasonForChange, 'Rechazado')}
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
                                                    onClick={() => handleSaveChanges(proposal.resourceId)}
                                                >
                                                    <SaveIcon className="h-4 w-4 mr-1" />
                                                    Guardar
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                                                onClick={() => handleChangeStatus(proposal.resourceId, proposal.reasonForChange, 'Pendiente')}
                                            >
                                                Mover a Pendiente
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-green-600 border-green-600 hover:bg-green-50"
                                                onClick={() => handleChangeStatus(proposal.resourceId, proposal.reasonForChange, 'Aprobado')}
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

    // Renderizar controles de paginación
    const renderPagination = () => {
        return (
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                        Mostrar
                    </span>
                    <Select
                        value={String(itemsPerPage)}
                        onValueChange={(value) => changeItemsPerPage(Number(value))}
                    >
                        <SelectTrigger className="h-8 w-16">
                            <SelectValue placeholder="5" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">
                        por página
                    </span>
                </div>
                
                <div className="text-sm text-muted-foreground">
                    Mostrando {totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} resultados
                </div>
                
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0"
                    >
                        <span className="sr-only">Página anterior</span>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex items-center">
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            let pageNum = i + 1;
                            if (totalPages > 5 && currentPage > 3) {
                                pageNum = currentPage - 3 + i;
                                if (pageNum > totalPages) {
                                    pageNum = totalPages - (4 - i);
                                }
                            }
                            return (
                                <Button
                                    key={pageNum}
                                    variant={currentPage === pageNum ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => goToPage(pageNum)}
                                    className="h-8 w-8 p-0 mx-1"
                                >
                                    {pageNum}
                                </Button>
                            );
                        })}
                    </div>
                    
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0"
                    >
                        <span className="sr-only">Siguiente página</span>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <>
            <ProposeResourcesDialog
                isOpen={isProposeResourceDialogOpen}
                onClose={() => setIsProposeResourceDialogOpen(false)}
                onPropose={handleAddResource}
            />
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span>Propuestas de Recursos</span>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-primary border-primary hover:bg-primary/10"
                            onClick={() => setIsProposeResourceDialogOpen(true)}
                        >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Nuevo Recurso
                        </Button>
                    </CardTitle>
                    <div className="mt-2 relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre, estado o usuario..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <Tabs 
                        defaultValue="Pendiente" 
                        className="w-full"
                        value={activeTab}
                        onValueChange={(value) => setActiveTabState(value as 'Pendiente' | 'Aprobado' | 'Rechazado')}
                    >
                        <TabsList className="grid w-full grid-cols-3 mb-4">
                            <TabsTrigger value="Pendiente" className="data-[state=active]:bg-yellow-100 data-[state=active]:text-yellow-800">
                                Pendientes ({pendingCount})
                            </TabsTrigger>
                            <TabsTrigger value="Aprobado" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800">
                                Aprobadas ({approvedCount})
                            </TabsTrigger>
                            <TabsTrigger value="Rechazado" className="data-[state=active]:bg-red-100 data-[state=active]:text-red-800">
                                Rechazadas ({rejectedCount})
                            </TabsTrigger>
                        </TabsList>
                    
                        <TabsContent value="Pendiente">
                            {renderProposalsTable(proposals)}
                        </TabsContent>
                        
                        <TabsContent value="Aprobado">
                            {renderProposalsTable(proposals)}
                        </TabsContent>
                        
                        <TabsContent value="Rechazado">
                            {renderProposalsTable(proposals)}
                        </TabsContent>
                    </Tabs>
                </CardContent>
                <CardFooter>
                    {renderPagination()}
                </CardFooter>
            </Card>
        </>
    )
}
