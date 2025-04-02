import { AreaObjectiveStrategicRequest, AreaObjectiveStrategicProposalResponse, ApproveAreaObjectiveStrategic, AreaObjectiveStrategicUpdateRequest } from './type.intervention'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function proposeAreaObjectiveStrategic(data: AreaObjectiveStrategicRequest, token: string) {
    const response = await fetch(`${API_URL}/api/strategicareas`, {
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

export async function updateAreaObjectiveStrategic(data: AreaObjectiveStrategicUpdateRequest, strategicAreaId: number, token: string) {
    const response = await fetch(`${API_URL}/api/strategicareas/${strategicAreaId}`, {
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

export async function getAreaObjectiveStrategicPendings(token: string): Promise<AreaObjectiveStrategicProposalResponse[]> {
    const response = await fetch(`${API_URL}/api/strategicareas/status/Pendiente`, {
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

export async function getAreaObjectiveStrategicApproved(token: string): Promise<AreaObjectiveStrategicProposalResponse[]> {
    const response = await fetch(`${API_URL}/api/strategicareas/status/Aprobado`, {
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

export async function getAreaObjectiveStrategicRejected(token: string): Promise<AreaObjectiveStrategicProposalResponse[]> {
    const response = await fetch(`${API_URL}/api/strategicareas/status/Rechazado`, {
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

export async function approveAreaObjectiveStrategic(strategicAreaId: number, token: string) {
    const response = await fetch(`${API_URL}/api/strategicareas/${strategicAreaId}`, {
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

export async function rejectAreaObjectiveStrategic(strategicAreaId: number, token: string) {
    const response = await fetch(`${API_URL}/api/strategicareas/${strategicAreaId}`, {
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

export async function pendingAreaObjectiveStrategic(strategicAreaId: number, token: string) {
    const response = await fetch(`${API_URL}/api/strategicareas/${strategicAreaId}`, {
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





