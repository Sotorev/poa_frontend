import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FacultyWithEvents, EventDate } from "./type.gant"
// Services
import { getEventsByFaculty } from "./service.gant"
import { getFaculties } from "@/services/faculty/service.faculty"
// Definición de tipos
import { Faculty } from "@/types/type.faculty"
import { auth } from "@/auth"
import GanttClient from "./gantt-client"

type EventState = "Planificación" | "En ejecución" | "Finalizado" | "Todos"

export default async function GanttChart() {
  let facultyWithEvents: FacultyWithEvents[] = []
  let faculties: Faculty[] = []
  
  try {
    facultyWithEvents = await getEventsByFaculty()
    
    // Get the token from the session
    const session = await auth()
    const token = session?.user?.token
    
    if (token) {
      faculties = await getFaculties(token)
    }
  } catch (error) {
    console.error("Error fetching data:", error)
  }

  const timelineStartDate = new Date(2024, 0, 1)
  const timelineEndDate = new Date(2025, 11, 31)

  return (
    <GanttClient 
      facultyWithEvents={facultyWithEvents}
      faculties={faculties}
      timelineStartDate={timelineStartDate}
      timelineEndDate={timelineEndDate}
    />
  )
}