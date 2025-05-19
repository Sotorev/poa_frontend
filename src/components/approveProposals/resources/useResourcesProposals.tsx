"use client"

// Tipos
import { ResourcesProposalResponse, ResourcesProposal, ResourcesRequest, ResourcesUpdateRequest } from './type.resources'

import { useState, useEffect, useMemo } from 'react'
import { useCurrentUser } from '@/hooks/use-current-user'

import { 
    getResourcesPendings, 
    getResourcesApproved, 
    getResourcesRejected, 
    approveResources, 
    rejectResources, 
    pendingResources, 
    updateResources, 
    proposeResources 
} from './service.resources'

type SortColumn = 'name'
type SortDirection = 'asc' | 'desc'

export function useResourcesProposals() {
    const [proposals, setProposals] = useState<ResourcesProposalResponse[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [sortColumn, setSortColumn] = useState<SortColumn>('name')
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
    const [refreshTrigger, setRefreshTrigger] = useState(0)
    const [isProposeResourceDialogOpen, setIsProposeResourceDialogOpen] = useState(false)

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
                    getResourcesPendings(user.token),
                    getResourcesApproved(user.token),
                    getResourcesRejected(user.token)
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

    // Ordenar propuestas
    const sortedProposals = useMemo(() => {
        return [...proposals].sort((a, b) => {
            const aValue = String(a[sortColumn] || '').toLowerCase()
            const bValue = String(b[sortColumn] || '').toLowerCase()

            if (sortDirection === 'asc') {
                return aValue.localeCompare(bValue)
            } else {
                return bValue.localeCompare(aValue)
            }
        })
    }, [proposals, sortColumn, sortDirection])

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
                await approveResources(id, reasonForChange, user.token)
            } else {
                await rejectResources(id, reasonForChange, user.token)
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
                    await pendingResources(id, reasonForChange, user.token)
                    break
                case 'Aprobado':
                    await approveResources(id, reasonForChange, user.token)
                    break
                case 'Rechazado':
                    await rejectResources(id, reasonForChange, user.token)
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

    // Agregar propuesta de recurso
    const handleAddResource = async (proposal: ResourcesProposal) => {
        if (!user?.token) return

        try {
            setLoading(true)
            const completeProposal: ResourcesRequest = {
                name: proposal.name,
                userId: user.userId,
                reasonForChange: proposal.reasonForChange,
                status: 'Pendiente',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
            await proposeResources(completeProposal, user.token)
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
            
            const updateObj: ResourcesUpdateRequest = {
                name
            }
            
            await updateResources(updateObj, id, user.token)
            
            // Refrescar la lista después de actualizar
            setRefreshTrigger(prev => prev + 1)
        } catch (err) {
            setError('Error al actualizar la propuesta')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return {
        proposals: sortedProposals,
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
    }
}
