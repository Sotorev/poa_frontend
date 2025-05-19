"use client"

// Tipos
import { InterventionProposalResponse, InterventionProposal, InterventionRequest, InterventionUpdateRequest } from './type.intervention'
import { Strategy } from '@/types/Strategy'

import { useState, useEffect, useMemo } from 'react'
import { useCurrentUser } from '@/hooks/use-current-user'

import { 
    getInterventionPendings, 
    getInterventionApproved, 
    getInterventionRejected, 
    approveIntervention, 
    rejectIntervention, 
    pendingIntervention, 
    updateIntervention, 
    proposeIntervention 
} from './service.intervention'
import { getStrategies } from '@/components/poa/eventManagement/formView/service.eventPlanningForm'

type SortColumn = 'name' | 'strategyId'
type SortDirection = 'asc' | 'desc'

export function useInterventionProposals() {
    const [proposals, setProposals] = useState<InterventionProposalResponse[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [sortColumn, setSortColumn] = useState<SortColumn>('name')
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
    const [refreshTrigger, setRefreshTrigger] = useState(0)
    const [strategies, setStrategies] = useState<Strategy[]>([])
    const [isProposeInterventionDialogOpen, setIsProposeInterventionDialogOpen] = useState(false)
    
    // Estados para búsqueda y paginación
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(5)
    const [activeTab, setActiveTab] = useState<'Pendiente' | 'Aprobado' | 'Rechazado'>('Pendiente')

    const user = useCurrentUser()

    // Cargar estrategias
    useEffect(() => {
        if (!user?.token) return

        const fetchStrategies = async () => {
            try {
                const strategiesData = await getStrategies(user.token)
                setStrategies(strategiesData)
            } catch (err) {
                console.error('Error al cargar estrategias:', err)
            }
        }

        fetchStrategies()
    }, [user?.token])

    // Cargar propuestas
    useEffect(() => {
        if (!user?.token) return

        const fetchProposals = async () => {
            try {
                setLoading(true)
                setError(null)
                
                // Obtener propuestas de los tres estados
                const [pendingData, approvedData, rejectedData] = await Promise.all([
                    getInterventionPendings(user.token),
                    getInterventionApproved(user.token),
                    getInterventionRejected(user.token)
                ])
                
                // Combinar todas las propuestas
                const allProposals = [...pendingData, ...approvedData, ...rejectedData]
                // Asignar información de estrategia a cada propuesta
                const allProposalsWithStrategy = allProposals.map(proposal => {
                    const strategy = strategies.find(s => s.strategyId === proposal.strategyId)
                    return {
                        ...proposal,
                        strategyDescription: strategy ? strategy.description : 'Estrategia no encontrada'
                    }
                })
                setProposals(allProposalsWithStrategy)
            } catch (err) {
                setError('Error al cargar las propuestas')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchProposals()
    }, [user?.token, refreshTrigger, strategies])

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
                    proposal.strategyDescription?.toLowerCase().includes(searchTermLower) ||
                    proposal.reasonForChange?.toLowerCase().includes(searchTermLower) ||
                    (proposal.user?.firstName?.toLowerCase().includes(searchTermLower) || false) ||
                    (proposal.user?.lastName?.toLowerCase().includes(searchTermLower) || false) ||
                    (proposal.user?.email?.toLowerCase().includes(searchTermLower) || false)
                )
            })
        
        // Luego ordenamos los resultados filtrados
        return filtered.sort((a, b) => {
            const aValue = (a[sortColumn] ?? '').toString().toLowerCase()
            const bValue = (b[sortColumn] ?? '').toString().toLowerCase()

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
    const handleApproval = async (id: number, approved: boolean) => {
        if (!user?.token) return

        try {
            setLoading(true)
            
            if (approved) {
                await approveIntervention(id, user.token)
            } else {
                await rejectIntervention(id, user.token)
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
    const handleChangeStatus = async (id: number, newStatus: 'Pendiente' | 'Aprobado' | 'Rechazado') => {
        if (!user?.token) return

        try {
            setLoading(true)
            setError(null)
            
            switch(newStatus) {
                case 'Pendiente':
                    await pendingIntervention(id, user.token)
                    break
                case 'Aprobado':
                    await approveIntervention(id, user.token)
                    break
                case 'Rechazado':
                    await rejectIntervention(id, user.token)
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

    // Agregar propuesta de intervención
    const handleAddIntervention = async (proposal: InterventionProposal) => {
        if (!user?.token) return

        try {
            setLoading(true)
            const completeProposal: InterventionRequest = {
                name: proposal.name,
                strategyId: proposal.strategyId,
                userId: user.userId,
                reasonForChange: proposal.reasonForChange || '',
                status: 'Pendiente'
            }

            await proposeIntervention(completeProposal, user.token)
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

            const updateInterventionObject: InterventionUpdateRequest = {
                name,
                interventionId: id
            }
            
            await updateIntervention(updateInterventionObject, id, user.token)
            
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
        handleAddIntervention,
        isProposeInterventionDialogOpen,
        setIsProposeInterventionDialogOpen,
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
        rejectedCount: filteredAndSortedProposals.filter(p => p.status === 'Rechazado').length,
        // Estrategias para el diálogo de propuesta
        strategies
    }
}
