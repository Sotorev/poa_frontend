"use client"

import { useState } from "react"
import { usePurchaseTypeProposals } from './usePurchaseTypeProposals'
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
import { CheckIcon, XIcon, ArrowUpDown, Loader2, SaveIcon, Search, PlusCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis
} from "@/components/ui/pagination"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ProposePurchaseTypeDialog } from "./UI.purchaseTypePropose"

export function PurchaseTypeApprove() {
    const {
        proposals,
        loading,
        error,
        sortColumn,
        sortDirection,
        toggleSort,
        handleApproval,
        handleUpdateProposal,
        handleChangeStatus,
        handleAddPurchaseType,
        searchTerm,
        handleSearch,
        currentPage,
        totalPages,
        goToNextPage,
        goToPreviousPage,
        goToPage,
        totalItems,
        activeTab,
        setActiveTabState,
        pendingCount,
        approvedCount,
        rejectedCount,
        isProposePurchaseTypeDialogOpen,
        setIsProposePurchaseTypeDialogOpen
    } = usePurchaseTypeProposals()

    const [editedProposals, setEditedProposals] = useState<Record<number, { name: string }>>({})

    const handleInputChange = (id: number, field: 'name', value: string) => {
        setEditedProposals(prev => ({
            ...prev,
            [id]: {
                ...prev[id] || {
                    name: proposals.find(p => p.purchaseTypeId === id)?.name || ''
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
                                Nombre del Tipo de Compra
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
                        const isEdited = editedProposals[proposal.purchaseTypeId] !== undefined
                        const nameValue = isEdited ? editedProposals[proposal.purchaseTypeId].name : proposal.name
                        const proposedByName = proposal.user ? `${proposal.user.firstName} ${proposal.user.lastName}` : 'Usuario desconocido'

                        return (
                            <TableRow key={proposal.purchaseTypeId}>
                                <TableCell className="font-medium">
                                    <Input
                                        value={nameValue}
                                        onChange={(e) => handleInputChange(proposal.purchaseTypeId, 'name', e.target.value)}
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
                                                    onClick={() => handleSaveChanges(proposal.purchaseTypeId)}
                                                >
                                                    <SaveIcon className="h-4 w-4 mr-1" />
                                                    Guardar
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-green-600 border-green-600 hover:bg-green-50"
                                                onClick={() => handleApproval(proposal.purchaseTypeId, proposal.reasonForChange, true)}
                                            >
                                                <CheckIcon className="h-4 w-4 mr-1" />
                                                Aprobar
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-red-600 border-red-600 hover:bg-red-50"
                                                onClick={() => handleApproval(proposal.purchaseTypeId, proposal.reasonForChange, false)}
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
                                                    onClick={() => handleSaveChanges(proposal.purchaseTypeId)}
                                                >
                                                    <SaveIcon className="h-4 w-4 mr-1" />
                                                    Guardar
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                                                onClick={() => handleChangeStatus(proposal.purchaseTypeId, proposal.reasonForChange, 'Pendiente')}
                                            >
                                                Mover a Pendiente
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-red-600 border-red-600 hover:bg-red-50"
                                                onClick={() => handleChangeStatus(proposal.purchaseTypeId, proposal.reasonForChange, 'Rechazado')}
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
                                                    onClick={() => handleSaveChanges(proposal.purchaseTypeId)}
                                                >
                                                    <SaveIcon className="h-4 w-4 mr-1" />
                                                    Guardar
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                                                onClick={() => handleChangeStatus(proposal.purchaseTypeId, proposal.reasonForChange, 'Pendiente')}
                                            >
                                                Mover a Pendiente
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-green-600 border-green-600 hover:bg-green-50"
                                                onClick={() => handleChangeStatus(proposal.purchaseTypeId, proposal.reasonForChange, 'Aprobado')}
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

    // Renderizar paginación
    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const pages = [];
        const maxVisiblePages = 5;

        // Lógica para mostrar un número limitado de páginas con elipsis
        if (totalPages <= maxVisiblePages) {
            // Mostrar todas las páginas si hay pocas
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Lógica para mostrar algunas páginas con elipsis
            const leftSide = Math.floor(maxVisiblePages / 2);
            const rightSide = maxVisiblePages - leftSide - 1;

            if (currentPage > leftSide + 1) {
                pages.push(1);
                if (currentPage > leftSide + 2) {
                    pages.push('ellipsis');
                }
            }

            // Páginas alrededor de la página actual
            const startPage = Math.max(1, currentPage - leftSide);
            const endPage = Math.min(totalPages, currentPage + rightSide);

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - rightSide) {
                if (currentPage < totalPages - rightSide - 1) {
                    pages.push('ellipsis');
                }
                pages.push(totalPages);
            }
        }

        return (
            <Pagination className="mt-4">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={goToPreviousPage}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                    </PaginationItem>

                    {pages.map((page, index) => (
                        <PaginationItem key={index}>
                            {page === 'ellipsis' ? (
                                <PaginationEllipsis />
                            ) : (
                                <PaginationLink
                                    isActive={page === currentPage}
                                    onClick={() => goToPage(page as number)}
                                >
                                    {page}
                                </PaginationLink>
                            )}
                        </PaginationItem>
                    ))}

                    <PaginationItem>
                        <PaginationNext
                            onClick={goToNextPage}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        );
    };

    // Renderizar información de paginación
    const renderPaginationInfo = () => {
        const start = (currentPage - 1) * 5 + 1;
        const end = Math.min(start + 4, totalItems);

        return (
            <div className="text-sm text-muted-foreground mt-2">
                Mostrando {totalItems > 0 ? start : 0} a {end} de {totalItems} resultados
            </div>
        );
    };

    return (
        <>
            <ProposePurchaseTypeDialog
                isOpen={isProposePurchaseTypeDialogOpen}
                onClose={() => setIsProposePurchaseTypeDialogOpen(false)}
                onPropose={handleAddPurchaseType}
            />
            <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Propuestas de Tipos de Compra</CardTitle>
                    <Button
                            variant="outline"
                            size="sm"
                            className="text-primary border-primary hover:bg-primary/10"
                            onClick={() => setIsProposePurchaseTypeDialogOpen(true)}
                        >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Nueva Propuesta
                        </Button>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Barra de búsqueda */}
                    <div className="relative mb-4">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar propuestas..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>

                    <Tabs value={activeTab} onValueChange={(value) => setActiveTabState(value as 'Pendiente' | 'Aprobado' | 'Rechazado')} className="w-full">
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
                            {renderPagination()}
                            {renderPaginationInfo()}
                        </TabsContent>

                        <TabsContent value="Aprobado">
                            {renderProposalsTable(proposals)}
                            {renderPagination()}
                            {renderPaginationInfo()}
                        </TabsContent>

                        <TabsContent value="Rechazado">
                            {renderProposalsTable(proposals)}
                            {renderPagination()}
                            {renderPaginationInfo()}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </>
    )
}
