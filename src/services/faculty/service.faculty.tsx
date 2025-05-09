import { Faculty } from "@/types/type.faculty"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function getFaculties(token: string): Promise<Faculty[]> {
    try {
        const response = await fetch(`${API_URL}/api/faculties/`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        const data = await response.json()
        return data
    } catch (error) {
        console.error("Error fetching faculties:", error)
        throw error
    }
}
