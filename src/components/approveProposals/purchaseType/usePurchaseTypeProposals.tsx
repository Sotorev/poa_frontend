"use client"

// Tipos
import { PurchaseTypeProposalResponse, PurchaseTypeProposal, PurchaseTypeRequest, PurchaseTypeUpdateRequest } from './type.purchaseType'

import { useState, useEffect, useMemo } from 'react'
import { useCurrentUser } from '@/hooks/use-current-user'

import { 
    getPurchaseTypePendings, 
    getPurchaseTypeApproved, 
    getPurchaseTypeRejected, 
    approvePurchaseType, 
    rejectPurchaseType, 
    pendingPurchaseType, 
    updatePurchaseType, 
    proposePurchaseType 
} from './service.purchaseType'

type SortColumn = 'name'
type SortDirection = 'asc' | 'desc'

export function usePurchaseTypeProposals() {
    const [proposals, setProposals] = useState<PurchaseTypeProposalResponse[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [sortColumn, setSortColumn] = useState<SortColumn>('name')
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
    const [refreshTrigger, setRefreshTrigger] = useState(0)
    const [isProposePurchaseTypeDialogOpen, setIsProposePurchaseTypeDialogOpen] = useState(false)
    
    // Estados para búsqueda y paginación
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(5)
    const [activeTab, setActiveTab] = useState<'Pendiente' | 'Aprobado' | 'Rechazado'>('Pendiente')

    const user = useCurrentUser()

    // No se requiere cargar datos adicionales para recursos

    // Cargar propuestas
    useEffect(() => {
        if (!user?.token) return

        const fetchProposals = async () => {
            try {
                setLoading(true)
                setError(null)
                
                // Obtener propuestas de los tres estados
                const [pendingData, approvedData, rejectedData] = await Promise.all([
                    getPurchaseTypePendings(user.token),
                    getPurchaseTypeApproved(user.token),
                    getPurchaseTypeRejected(user.token)
                ])
                
                // Combinar todas las propuestas
                const allProposals = [...pendingData, ...approvedData, ...rejectedData]
                setProposals(allProposals)
            } catch (err) {
                setError('Error al cargar las propuestas')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchProposals()
    }, [user?.token, refreshTrigger])

    // Filtrar y ordenar propuestas
    const filteredAndSortedProposals = useMemo(() => {
        // Primero filtramos por el término de búsqueda
        const filtered = searchTerm.trim() === '' 
            ? [...proposals]
            : [...proposals].filter(proposal => {
                const searchTermLower = searchTerm.toLowerCase()
                return (
                    proposal.name?.toLowerCase().includes(searchTermLower) || 
                    proposal.status?.toLowerCase().includes(searchTermLower) ||
                    proposal.reasonForChange?.toLowerCase().includes(searchTermLower) ||
                    (proposal.user?.firstName?.toLowerCase().includes(searchTermLower) || false) ||
                    (proposal.user?.lastName?.toLowerCase().includes(searchTermLower) || false) ||
                    (proposal.user?.email?.toLowerCase().includes(searchTermLower) || false)
                )
            })
        
        // Luego ordenamos los resultados filtrados
        return filtered.sort((a, b) => {
            const aValue = String(a[sortColumn] || '').toLowerCase()
            const bValue = String(b[sortColumn] || '').toLowerCase()

            if (sortDirection === 'asc') {
                return aValue.localeCompare(bValue)
            } else {
                return bValue.localeCompare(aValue)
            }
        })
    }, [proposals, sortColumn, sortDirection, searchTerm])
    
    // Filtrar por el estado activo (pendiente, aprobado, rechazado)
    const proposalsByStatus = useMemo(() => {
        return filteredAndSortedProposals.filter(proposal => proposal.status === activeTab)
    }, [filteredAndSortedProposals, activeTab])

    // Cambiar columna de ordenamiento
    const toggleSort = (column: SortColumn) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortColumn(column)
            setSortDirection('asc')
        }
    }

    // Aprobar o rechazar una propuesta
    const handleApproval = async (id: number, reasonForChange: string, approved: boolean) => {
        if (!user?.token) return

        try {
            setLoading(true)
            
            if (approved) {
                await approvePurchaseType(id, reasonForChange, user.token)
            } else {
                await rejectPurchaseType(id, reasonForChange, user.token)
            }
            
            // Refrescar la lista de propuestas
            setRefreshTrigger(prev => prev + 1)
        } catch (err) {
            setError(`Error al ${approved ? 'aprobar' : 'rechazar'} la propuesta`)
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    // Cambiar el estado de una propuesta
    const handleChangeStatus = async (id: number, reasonForChange: string, newStatus: 'Pendiente' | 'Aprobado' | 'Rechazado') => {
        if (!user?.token) return

        try {
            setLoading(true)
            setError(null)
            
            switch(newStatus) {
                case 'Pendiente':
                    await pendingPurchaseType(id, reasonForChange, user.token)
                    break
                case 'Aprobado':
                    await approvePurchaseType(id, reasonForChange, user.token)
                    break
                case 'Rechazado':
                    await rejectPurchaseType(id, reasonForChange, user.token)
                    break
            }
            
            // Refrescar la lista después de cambiar el estado
            setRefreshTrigger(prev => prev + 1)
        } catch (err) {
            setError(`Error al cambiar el estado de la propuesta a ${newStatus}`)
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    // Agregar propuesta de tipo de compra
    const handleAddPurchaseType = async (proposal: PurchaseTypeProposal) => {
        if (!user?.token) return

        try {
            setLoading(true)
            const completeProposal: PurchaseTypeRequest = {
                name: proposal.name,
                userId: user.userId,
                reasonForChange: proposal.reasonForChange,
                status: 'Pendiente',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }

            await proposePurchaseType(completeProposal, user.token)
            setRefreshTrigger(prev => prev + 1)
        } catch (err) {
            setError('Error al agregar la propuesta')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    // Actualizar los campos de una propuesta
    const handleUpdateProposal = async (id: number, name: string) => {
        if (!user?.token) return

        try {
            setLoading(true)
            setError(null)
            
            const updateObj: PurchaseTypeUpdateRequest = {
                name
            }
            
            await updatePurchaseType(updateObj, id, user.token)
            
            // Refrescar la lista después de actualizar
            setRefreshTrigger(prev => prev + 1)
        } catch (err) {
            setError('Error al actualizar la propuesta')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    // Paginar resultados por estado activo
    const paginatedProposals = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return proposalsByStatus.slice(startIndex, endIndex)
    }, [proposalsByStatus, currentPage, itemsPerPage])
    
    // Calcular total de páginas para el estado activo
    const totalPages = useMemo(() => {
        return Math.max(1, Math.ceil(proposalsByStatus.length / itemsPerPage))
    }, [proposalsByStatus, itemsPerPage])
    
    // Funciones para manejar la paginación
    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1)
        }
    }
    
    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1)
        }
    }
    
    const goToPage = (pageNumber: number) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber)
        }
    }
    
    // Función para manejar la búsqueda
    const handleSearch = (term: string) => {
        setSearchTerm(term)
        setCurrentPage(1) // Resetear a la primera página cuando se realiza una búsqueda
    }
    
    // Función para cambiar la pestaña activa
    const setActiveTabState = (tab: 'Pendiente' | 'Aprobado' | 'Rechazado') => {
        setActiveTab(tab)
        setCurrentPage(1) // Resetear a la primera página cuando se cambia de pestaña
    }
    
    // Función para cambiar ítems por página
    const changeItemsPerPage = (items: number) => {
        setItemsPerPage(items)
        setCurrentPage(1) // Resetear a la primera página
    }
    
    return {
        proposals: paginatedProposals,
        allProposals: filteredAndSortedProposals,
        proposalsByStatus,
        loading,
        error,
        sortColumn,
        sortDirection,
        toggleSort,
        handleApproval,
        handleUpdateProposal,
        handleChangeStatus,
        handleAddPurchaseType,
        isProposePurchaseTypeDialogOpen,
        setIsProposePurchaseTypeDialogOpen,
        // Nuevas propiedades para búsqueda y paginación
        searchTerm,
        handleSearch,
        currentPage,
        itemsPerPage,
        totalPages,
        goToNextPage,
        goToPreviousPage,
        goToPage,
        changeItemsPerPage,
        totalItems: proposalsByStatus.length,
        activeTab,
        setActiveTabState,
        // Totales por estado para mostrar en las pestañas
        pendingCount: filteredAndSortedProposals.filter(p => p.status === 'Pendiente').length,
        approvedCount: filteredAndSortedProposals.filter(p => p.status === 'Aprobado').length,
        rejectedCount: filteredAndSortedProposals.filter(p => p.status === 'Rechazado').length
    }
}
