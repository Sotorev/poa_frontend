"use client"

import { useState, useEffect, useMemo } from 'react'
import { useCurrentUser } from '@/hooks/use-current-user'
import { AreaObjectiveStrategicProposal, ApproveAreaObjectiveStrategic } from './type.AreaObjectiveStrategic'
import { getAreaObjectiveStrategicProposals, approveAreaObjectiveStrategic } from './service.AreaObjectiveStrategic'

type SortColumn = 'nameArea' | 'nameObjective'
type SortDirection = 'asc' | 'desc'

export function useAreaObjectiveStrategicApproval() {
    const [proposals, setProposals] = useState<AreaObjectiveStrategicProposal[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [sortColumn, setSortColumn] = useState<SortColumn>('nameArea')
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    const user = useCurrentUser()

    // Cargar propuestas
    useEffect(() => {
        if (!user?.token) return

        const fetchProposals = async () => {
            try {
                setLoading(true)
                setError(null)
                const data = await getAreaObjectiveStrategicProposals(user.token)
                setProposals(data)
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
            const aValue = a[sortColumn].toLowerCase()
            const bValue = b[sortColumn].toLowerCase()

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
    const handleApproval = async (id: number, approved: boolean) => {
        if (!user?.token) return

        try {
            setLoading(true)
            const approvalData: ApproveAreaObjectiveStrategic = {
                id,
                approved,
            }

            await approveAreaObjectiveStrategic(approvalData, user.token)
            
            // Refrescar la lista de propuestas
            setRefreshTrigger(prev => prev + 1)
        } catch (err) {
            setError(`Error al ${approved ? 'aprobar' : 'rechazar'} la propuesta`)
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
    }
}
