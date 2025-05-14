import { FacultyWithEvents } from "./type.gant"
import { auth } from "@/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function getEventsByFaculty(): Promise<FacultyWithEvents[]> {
    const session = await auth()
    const token = session?.user?.token

    if (!token) {
        throw new Error("No token available")
    }

    try {
        const response = await fetch(`${API_URL}/api/reports/event/compliance/details`, {
            headers: {
                "Authorization": `Bearer ${token}`
            },
            cache: "no-store"
        })
        
        if (!response.ok) {
            throw new Error("Failed to fetch events")
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.error("Error fetching events:", error)
        throw error
    }
}
