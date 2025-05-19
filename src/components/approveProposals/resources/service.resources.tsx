import { ResourcesRequest, ResourcesProposalResponse, ApproveResources, ResourcesUpdateRequest } from './type.resources'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function proposeResources(data: ResourcesRequest, token: string) {
    const response = await fetch(`${API_URL}/api/institutionalResources`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    })

    if (!response.ok) {
        throw new Error(`Error al proponer recurso: ${response.statusText}`);
    }

    return response.json();
}

export async function updateResources(data: ResourcesUpdateRequest, resourceId: number, token: string) {
    const response = await fetch(`${API_URL}/api/institutionalResources/${resourceId}`, {
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

export async function getResourcesPendings(token: string): Promise<ResourcesProposalResponse[]> {
    const response = await fetch(`${API_URL}/api/institutionalResources/status/Pendiente`, {
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

export async function getResourcesApproved(token: string): Promise<ResourcesProposalResponse[]> {
    const response = await fetch(`${API_URL}/api/institutionalResources/status/Aprobado`, {
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

export async function getResourcesRejected(token: string): Promise<ResourcesProposalResponse[]> {
    const response = await fetch(`${API_URL}/api/institutionalResources/status/Rechazado`, {
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

export async function approveResources(resourceId: number, reasonForChange: string, token: string) {
    const response = await fetch(`${API_URL}/api/institutionalResources/${resourceId}`, {
        method: 'PUT',
        body: JSON.stringify({ resourceId, status: 'Aprobado', reasonForChange }),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    })

    if (!response.ok) {
        throw new Error(`Error al aprobar propuesta: ${response.statusText}`);
    }

    return response.json();
}

export async function rejectResources(resourceId: number, reasonForChange: string, token: string) {
    const response = await fetch(`${API_URL}/api/institutionalResources/${resourceId}`, {
        method: 'PUT',
        body: JSON.stringify({ resourceId, status: 'Rechazado', reasonForChange }),
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

export async function pendingResources(resourceId: number, reasonForChange: string, token: string) {
    const response = await fetch(`${API_URL}/api/institutionalResources/${resourceId}`, {
        method: 'PUT',
        body: JSON.stringify({ resourceId, status: 'Pendiente', reasonForChange }),
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





