import { ProposeAreaObjectiveStrategic } from './type.AreaObjectiveStrategic'

const API_URL = process.env.NEXT_PUBLIC_API_URL



export async function proposeAreaObjectiveStrategic(data: ProposeAreaObjectiveStrategic){
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

