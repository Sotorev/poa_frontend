import { PurchaseTypeRequest, PurchaseTypeProposalResponse, ApprovePurchaseType, PurchaseTypeUpdateRequest } from './type.purchaseType'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function proposePurchaseType(data: PurchaseTypeRequest, token: string) {
    const response = await fetch(`${API_URL}/api/purchasetypes`, {
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

export async function updatePurchaseType(data: PurchaseTypeUpdateRequest, purchaseTypeId: number, token: string) {
    const response = await fetch(`${API_URL}/api/purchasetypes/${purchaseTypeId}`, {
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

export async function getPurchaseTypePendings(token: string): Promise<PurchaseTypeProposalResponse[]> {
    const response = await fetch(`${API_URL}/api/purchasetypes/status/Pendiente`, {
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

export async function getPurchaseTypeApproved(token: string): Promise<PurchaseTypeProposalResponse[]> {
    const response = await fetch(`${API_URL}/api/purchasetypes/status/Aprobado`, {
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

export async function getPurchaseTypeRejected(token: string): Promise<PurchaseTypeProposalResponse[]> {
    const response = await fetch(`${API_URL}/api/purchasetypes/status/Rechazado`, {
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

export async function approvePurchaseType(purchaseTypeId: number, reasonForChange: string,token: string) {
    const response = await fetch(`${API_URL}/api/purchasetypes/${purchaseTypeId}`, {
        method: 'PUT',
        body: JSON.stringify({ purchaseTypeId, status: 'Aprobado', reasonForChange }),
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

export async function rejectPurchaseType(purchaseTypeId: number, reasonForChange: string, token: string) {
    const response = await fetch(`${API_URL}/api/purchasetypes/${purchaseTypeId}`, {
        method: 'PUT',
        body: JSON.stringify({ purchaseTypeId, status: 'Rechazado', reasonForChange }),
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

export async function pendingPurchaseType(purchaseTypeId: number, reasonForChange: string, token: string) {
    const response = await fetch(`${API_URL}/api/purchasetypes/${purchaseTypeId}`, {
        method: 'PUT',
        body: JSON.stringify({ purchaseTypeId, status: 'Pendiente', reasonForChange }),
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





