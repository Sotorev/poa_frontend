import { PEI } from "@/types/pei"

export async function getCurrentPei(token: string): Promise<PEI> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pei/current`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })

    if (!response.ok) {
        throw new Error(`Error al obtener el PEI actual: ${response.statusText}`)
    }

    return response.json()
}
