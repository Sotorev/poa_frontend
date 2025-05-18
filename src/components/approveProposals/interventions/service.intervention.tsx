import { InterventionRequest, InterventionProposalResponse, ApproveIntervention, InterventionUpdateRequest } from './type.intervention'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function proposeIntervention(data: InterventionRequest, token: string) {
    const response = await fetch(`${API_URL}/api/interventions`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    })

    if (!response.ok) {
        throw new Error(`Error al proponer intervención: ${response.statusText}`);
    }

    return response.json();
}

export async function updateIntervention(data: InterventionUpdateRequest, interventionId: number, token: string) {
    const response = await fetch(`${API_URL}/api/interventions/${interventionId}`, {
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

export async function getInterventionPendings(token: string): Promise<InterventionProposalResponse[]> {
    const response = await fetch(`${API_URL}/api/interventions/status/Pendiente`, {
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

export async function getInterventionApproved(token: string): Promise<InterventionProposalResponse[]> {
    const response = await fetch(`${API_URL}/api/interventions/status/Aprobado`, {
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

export async function getInterventionRejected(token: string): Promise<InterventionProposalResponse[]> {
    const response = await fetch(`${API_URL}/api/interventions/status/Rechazado`, {
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

export async function approveIntervention(interventionId: number, token: string) {
    const response = await fetch(`${API_URL}/api/interventions/${interventionId}`, {
        method: 'PUT',
        body: JSON.stringify({ interventionId, status: 'Aprobado' }),
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

export async function rejectIntervention(interventionId: number, token: string) {
    const response = await fetch(`${API_URL}/api/interventions/${interventionId}`, {
        method: 'PUT',
        body: JSON.stringify({ interventionId, status: 'Rechazado' }),
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

export async function pendingIntervention(interventionId: number, token: string) {
    const response = await fetch(`${API_URL}/api/interventions/${interventionId}`, {
        method: 'PUT',
        body: JSON.stringify({ interventionId, status: 'Pendiente' }),
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





