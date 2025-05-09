import { StrategyRequest, StrategyProposalResponse, ApproveStrategy, StrategyUpdateRequest } from './type.strategy'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function proposeStrategy(data: StrategyRequest, token: string) {
    const response = await fetch(`${API_URL}/api/strategies`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    })

    if (!response.ok) {
        throw new Error(`Error al proponer área y objetivo estratégico: ${response.statusText}`);
    }

    return response.json();
}

export async function updateStrategy(data: StrategyUpdateRequest, strategyId: number, token: string) {
    const response = await fetch(`${API_URL}/api/strategies/${strategyId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    })

    if (!response.ok) {
        throw new Error(`Error al actualizar propuesta: ${response.statusText}`);
    }

    return response.json();
}

export async function getStrategyPendings(token: string): Promise<StrategyProposalResponse[]> {
    const response = await fetch(`${API_URL}/api/strategies/status/Pendiente`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    })

    if (!response.ok) {
        throw new Error(`Error al obtener propuestas: ${response.statusText}`);
    }

    return response.json();
}

export async function getStrategyApproved(token: string): Promise<StrategyProposalResponse[]> {
    const response = await fetch(`${API_URL}/api/strategies/status/Aprobado`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    })

    if (!response.ok) {
        throw new Error(`Error al obtener propuestas: ${response.statusText}`);
    }

    return response.json();
}

export async function getStrategyRejected(token: string): Promise<StrategyProposalResponse[]> {
    const response = await fetch(`${API_URL}/api/strategies/status/Rechazado`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    })

    if (!response.ok) {
        throw new Error(`Error al obtener propuestas: ${response.statusText}`);
    }

    return response.json();
}

export async function approveStrategy(strategyId: number, token: string) {
    const response = await fetch(`${API_URL}/api/strategies/${strategyId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'Aprobado' }),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    })

    if (!response.ok) {
        throw new Error(`Error al aprobar/rechazar propuesta: ${response.statusText}`);
    }

    return response.json();
}

export async function rejectStrategy(strategyId: number, token: string) {
    const response = await fetch(`${API_URL}/api/strategies/${strategyId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'Rechazado' }),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    })

    if (!response.ok) {
        throw new Error(`Error al rechazar propuesta: ${response.statusText}`);
    }

    return response.json();
}

export async function pendingStrategy(strategyId: number, token: string) {
    const response = await fetch(`${API_URL}/api/strategies/${strategyId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'Pendiente' }),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    })

    if (!response.ok) {
        throw new Error(`Error al poner en pendiente propuesta: ${response.statusText}`);
    }

    return response.json();
}





