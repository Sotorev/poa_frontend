import { ProposeAreaObjectiveStrategic, AreaObjectiveStrategicProposal, ApproveAreaObjectiveStrategic } from './type.AreaObjectiveStrategic'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function proposeAreaObjectiveStrategic(data: ProposeAreaObjectiveStrategic) {
    const response = await fetch(`${API_URL}/api/proposeAreaObjectiveStrategic`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        throw new Error(`Error al proponer área y objetivo estratégico: ${response.statusText}`);
    }

    return response.json();
}

export async function getAreaObjectiveStrategicProposals(token: string): Promise<AreaObjectiveStrategicProposal[]> {
    const response = await fetch(`${API_URL}/api/areaObjectiveStrategic/proposals`, {
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

export async function approveAreaObjectiveStrategic(data: ApproveAreaObjectiveStrategic, token: string) {
    const response = await fetch(`${API_URL}/api/areaObjectiveStrategic/approve`, {
        method: 'POST',
        body: JSON.stringify(data),
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

