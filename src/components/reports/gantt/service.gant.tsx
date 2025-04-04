import { FacultyWithEvents } from "./type.gant"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function getEventsByFaculty(token: string): Promise<FacultyWithEvents[]> {
    try {
        const response = await fetch(`${API_URL}/api/reports/event/compliance/details`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        const data = await response.json()

        if (!response.ok) {
            throw new Error("Failed to fetch events")
        }

        return data
    } catch (error) {
        console.error("Error fetching events:", error)
        throw error
    }
}
