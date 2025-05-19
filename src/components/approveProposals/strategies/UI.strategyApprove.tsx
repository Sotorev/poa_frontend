"use client"

import { useState, useEffect, useContext } from "react"
import { useStrategyProposals } from './useStrategyProposals'
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
import { ProposeStrategyDialog } from "./UI.strategyPropose"
import { PoaContext } from "@/contexts/PoaContext"



export function StrategyApprove() {
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
        handleAddStrategy,
        isProposeStrategyDialogOpen,
        setIsProposeStrategyDialogOpen,
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
    } = useStrategyProposals()

    const { strategicAreas } = useContext(PoaContext)
    const [editedProposals, setEditedProposals] = useState<Record<number, { description: string }>>({})
    const [searchInput, setSearchInput] = useState('')

    // Ya no necesitamos filtrar las propuestas por estado aquí porque el hook ya lo hace

    // Efecto para actualizar la búsqueda después de un breve retraso
    useEffect(() => {
        const timer = setTimeout(() => {
            handleSearch(searchInput)
        }, 300)

        return () => clearTimeout(timer)
    }, [searchInput])

    const handleInputChange = (id: number, value: string) => {
        setEditedProposals(prev => ({
            ...prev,
            [id]: {
                ...prev[id] || {
                    description: proposals.find(p => p.strategyId === id)?.description || '',
                },
                description: value
            }
        }))
    }

    const handleSaveChanges = (id: number) => {
        if (editedProposals[id]) {
            handleUpdateProposal(id, editedProposals[id].description)

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
                            onClick={() => toggleSort('description')}
                        >
                            <div className="flex items-center">
                                Estrategia
                                <ArrowUpDown className={`ml-2 h-4 w-4 ${sortColumn === 'description' ? 'opacity-100' : 'opacity-40'}`} />
                            </div>
                        </TableHead>
                        <TableHead
                            className="cursor-pointer"
                            onClick={() => toggleSort('strategicAreaId')}
                        >
                            <div className="flex items-center">
                                Área Estratégica
                                <ArrowUpDown className={`ml-2 h-4 w-4 ${sortColumn === 'strategicAreaId' ? 'opacity-100' : 'opacity-40'}`} />
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
                        const isEdited = editedProposals[proposal.strategyId] !== undefined
                        const descriptionValue = isEdited ? editedProposals[proposal.strategyId].description : proposal.description
                        const proposedByName = proposal.user ? `${proposal.user.firstName} ${proposal.user.lastName}` : 'Usuario desconocido'

                        return (
                            <TableRow key={proposal.strategyId}>
                                <TableCell className="font-medium">
                                    <Input
                                        value={descriptionValue}
                                        onChange={(e) => handleInputChange(proposal.strategyId, e.target.value)}
                                        className={isEdited ? "border-primary" : "border-transparent"}
                                    />
                                </TableCell>
                                <TableCell>
                                    {proposal.strategicAreaName}
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
                                                    onClick={() => handleSaveChanges(proposal.strategyId)}
                                                >
                                                    <SaveIcon className="h-4 w-4 mr-1" />
                                                    Guardar
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-green-600 border-green-600 hover:bg-green-50"
                                                onClick={() => handleApproval(proposal.strategyId, true)}
                                            >
                                                <CheckIcon className="h-4 w-4 mr-1" />
                                                Aprobar
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-red-600 border-red-600 hover:bg-red-50"
                                                onClick={() => handleApproval(proposal.strategyId, false)}
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
                                                    onClick={() => handleSaveChanges(proposal.strategyId)}
                                                >
                                                    <SaveIcon className="h-4 w-4 mr-1" />
                                                    Guardar
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                                                onClick={() => handleChangeStatus(proposal.strategyId, 'Pendiente')}
                                            >
                                                Mover a Pendiente
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-red-600 border-red-600 hover:bg-red-50"
                                                onClick={() => handleChangeStatus(proposal.strategyId, 'Rechazado')}
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
                                                    onClick={() => handleSaveChanges(proposal.strategyId)}
                                                >
                                                    <SaveIcon className="h-4 w-4 mr-1" />
                                                    Guardar
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                                                onClick={() => handleChangeStatus(proposal.strategyId, 'Pendiente')}
                                            >
                                                Mover a Pendiente
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-green-600 border-green-600 hover:bg-green-50"
                                                onClick={() => handleChangeStatus(proposal.strategyId, 'Aprobado')}
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
        if (totalItems === 0) return null;

        // Crear un array de números de página a mostrar
        const pageNumbers = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            // Si hay pocas páginas, mostrar todas
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            // Lógica para determinar qué páginas mostrar
            if (currentPage <= 3) {
                // Mostrar las primeras páginas + puntos suspensivos
                for (let i = 1; i <= 3; i++) pageNumbers.push(i);
                pageNumbers.push('...');
                pageNumbers.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                // Mostrar la primera página + puntos suspensivos + últimas páginas
                pageNumbers.push(1);
                pageNumbers.push('...');
                for (let i = totalPages - 2; i <= totalPages; i++) pageNumbers.push(i);
            } else {
                // Mostrar la primera página + puntos suspensivos + página actual y adyacentes + puntos suspensivos + última página
                pageNumbers.push(1);
                pageNumbers.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pageNumbers.push(i);
                pageNumbers.push('...');
                pageNumbers.push(totalPages);
            }
        }

        return (
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                        Mostrar
                    </span>
                    <Select
                        value={itemsPerPage.toString()}
                        onValueChange={(value) => changeItemsPerPage(parseInt(value))}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={itemsPerPage} />
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

                <div className="flex items-center space-x-6 lg:space-x-8">
                    <div className="flex items-center space-x-2">
                        <p className="text-sm text-muted-foreground">
                            Página {currentPage} de {totalPages}
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={goToPreviousPage}
                            disabled={currentPage === 1}
                        >
                            <span className="sr-only">Página anterior</span>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        {pageNumbers.map((page, index) => (
                            typeof page === 'number' ? (
                                <Button
                                    key={index}
                                    variant={currentPage === page ? "default" : "outline"}
                                    className="h-8 w-8 p-0"
                                    onClick={() => goToPage(page)}
                                >
                                    <span className="sr-only">Página {page}</span>
                                    {page}
                                </Button>
                            ) : (
                                <span key={index} className="px-2">...</span>
                            )
                        ))}
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages || totalPages === 0}
                        >
                            <span className="sr-only">Siguiente página</span>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            <ProposeStrategyDialog
                isOpen={isProposeStrategyDialogOpen}
                onClose={() => setIsProposeStrategyDialogOpen(false)}
                onPropose={handleAddStrategy}
                strategicAreas={strategicAreas}
            />
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span>Propuestas de Estrategias</span>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-primary border-primary hover:bg-primary/10"
                            onClick={() => setIsProposeStrategyDialogOpen(true)}
                        >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Nueva Estrategia
                        </Button>
                    </CardTitle>
                    <div className="mt-2 relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por estrategia, área, estado o usuario..."
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
