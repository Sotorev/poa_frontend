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

// export async function getAreaObjectiveStrategicProposals(token: string): Promise<AreaObjectiveStrategicProposal[]> {
//     const response = await fetch(`${API_URL}/api/areaObjectiveStrategic/proposals`, {
//         method: 'GET',
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`
//         },
//     })

//     if (!response.ok) {
//         throw new Error(`Error al obtener propuestas: ${response.statusText}`);
//     }

//     return response.json();
// }

export async function getAreaObjectiveStrategicProposals(token: string): Promise<AreaObjectiveStrategicProposal[]> {
    return [
        {
            id: 1,
            nameArea: "Investigación y Desarrollo",
            nameObjective: "Mejorar la infraestructura tecnológica",
            status: "pending",
            proposedBy: "Juan Pérez",
            proposedAt: "2025-03-30T10:00:00Z"
        },
        {
            id: 2,
            nameArea: "Recursos Humanos",
            nameObjective: "Capacitación continua para empleados",
            status: "approved",
            proposedBy: "María López",
            proposedAt: "2025-03-29T15:30:00Z"
        },
        {
            id: 3,
            nameArea: "Marketing",
            nameObjective: "Aumentar la presencia en redes sociales",
            status: "rejected",
            proposedBy: "Carlos Rodríguez",
            proposedAt: "2025-03-28T12:45:00Z"
        }
    ];
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

interface UpdateAreaObjectiveStrategicRequest {
    id: number;
    nameArea: string;
    nameObjective: string;
}

export async function updateAreaObjectiveStrategic(data: UpdateAreaObjectiveStrategicRequest, token: string) {
    const response = await fetch(`${API_URL}/api/areaObjectiveStrategic/update`, {
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

