"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useCurrentUser } from "@/hooks/use-current-user"

// Definir el tipo de status (los valores del API)
type EventStatus = "Planificación" | "En ejecución" | "Test"

interface Event {
  id: number
  name: string
  faculty: string
  status: EventStatus
  planned: {
    startDate: Date | null
    endDate: Date | null
  }
  executed: {
    startDate: Date | null
    endDate: Date | null
  }
}

export default function GanttChart() {
  const user = useCurrentUser()
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedStatus, setSelectedStatus] = useState<string>("todos")
  const [selectedFaculty, setSelectedFaculty] = useState<string>("todas")
  const [searchTerm, setSearchTerm] = useState("")

  // Llamada a la API enviando el token
  useEffect(() => {
    if (!user?.token) return
    fetch(`${API_URL}/api/reports/event/compliance/details`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`
      }
    })
      .then(res => res.json())
      .then((data: any[]) => {
        const fetchedEvents: Event[] = []
        // Iterar cada objeto de facultad y mapear cada evento
        data.forEach((facultyData) => {
          const facultyName = facultyData.name
          if (facultyData.allEvents && Array.isArray(facultyData.allEvents)) {
            facultyData.allEvents.forEach((evt: any) => {
              fetchedEvents.push({
                id: evt.eventId,
                name: evt.name,
                faculty: facultyName,
                status: evt.status, // "Planificación", "En ejecución" o "Test"
                planned: {
                  startDate: evt.startDate ? new Date(evt.startDate) : null,
                  endDate: evt.endDate ? new Date(evt.endDate) : null,
                },
                executed: {
                  startDate: evt.startExecutionDate ? new Date(evt.startExecutionDate) : null,
                  endDate: evt.endExecutionDate ? new Date(evt.endExecutionDate) : null,
                }
              })
            })
          }
        })
        setEvents(fetchedEvents)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching events:", error)
        setLoading(false)
      })
  }, [API_URL, user?.token])

  // Lista única de facultades
  const faculties = ["todas", ...Array.from(new Set(events.map((event) => event.faculty)))]

  // Filtrado de eventos
  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      selectedStatus === "todos" || event.status === selectedStatus
    const matchesFaculty =
      selectedFaculty === "todas" || event.faculty === selectedFaculty
    return matchesSearch && matchesStatus && matchesFaculty
  })

  // Estadísticas (ejemplo; ajustar según necesidades)
  const totalEvents = events.length
  const eventsPerCategory = totalEvents ? Math.round((totalEvents / 3) * 100) / 100 : 0

  // Rango de fechas para el gráfico (se asume planificación para 2025)
  const chartStartDate = new Date(2025, 0, 1)
  const chartEndDate = new Date(2025, 11, 31)
  const totalDays = (chartEndDate.getTime() - chartStartDate.getTime()) / (1000 * 60 * 60 * 24)

  // Calcula la posición y el ancho de la barra usando las fechas según el status
  const calculateBarStyle = (plannedStart: Date | null, plannedEnd: Date | null, executedStart: Date | null, executedEnd: Date | null, status: EventStatus) => {
    // Determinar qué fechas usar según el status
    let start: Date | null, end: Date | null
    if (status === "Planificación") {
      start = plannedStart
      end = plannedEnd
    } else if (status === "En ejecución") {
      start = executedStart
      end = executedEnd
    } else { // "Test" se mapea, por ejemplo, usando las fechas planificadas
      start = plannedStart
      end = plannedEnd
    }
    if (!start || !end) return { left: "0%", width: "0%" }
    const startDiff = (start.getTime() - chartStartDate.getTime()) / (1000 * 60 * 60 * 24)
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    const leftPosition = (startDiff / totalDays) * 100
    const width = (duration / totalDays) * 100
    return {
      left: `${leftPosition}%`,
      width: `${width}%`
    }
  }

  // Formatear rango de fechas
  const formatDateRange = (start: Date, end: Date) => {
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    return `${months[start.getMonth()]} - ${months[end.getMonth()]} 2025`
  }

  // Calcular duración en meses y días
  const calculateDuration = (start: Date, end: Date) => {
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const months = Math.floor(diffDays / 30)
    const days = diffDays % 30
    return `${months} ${months === 1 ? "mes" : "meses"}, ${days} ${days === 1 ? "día" : "días"}`
  }

  // Colores para cada status
  const statusColors: Record<EventStatus, string> = {
    "Planificación": "bg-red-600",
    "En ejecución": "bg-amber-500",
    "Test": "bg-green-600"
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Gráfico de Gantt - POA Universidad</h1>
      <p className="text-gray-500 mb-6 text-sm">
        Este gráfico muestra el Plan Operativo Anual de la universidad (2025), comparando las fechas
        planificadas (rojo) con las fechas reales de ejecución (amarillo) o finalizadas (verde) según el status.
      </p>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <h3 className="text-sm text-gray-500 mb-1">Total de Eventos</h3>
          <p className="text-2xl font-bold">{totalEvents}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm text-gray-500 mb-1">Eventos "Test"</h3>
          <p className="text-2xl font-bold">{eventsPerCategory}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm text-gray-500 mb-1">Eventos en Ejecución</h3>
          <p className="text-2xl font-bold">{eventsPerCategory}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm text-gray-500 mb-1">Eventos en Planificación</h3>
          <p className="text-2xl font-bold">{eventsPerCategory}</p>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="w-full md:w-1/3">
          <label className="text-sm text-gray-500 mb-1 block">Facultad</label>
          <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todas las facultades" />
            </SelectTrigger>
            <SelectContent>
              {faculties.map((faculty) => (
                <SelectItem key={faculty} value={faculty}>
                  {faculty === "todas" ? "Todas las facultades" : faculty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-1/3">
          <label className="text-sm text-gray-500 mb-1 block">Filtrar por Status</label>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="Planificación">Planificación</SelectItem>
              <SelectItem value="En ejecución">En ejecución</SelectItem>
              <SelectItem value="Test">Test</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-1/3">
          <label className="text-sm text-gray-500 mb-1 block">Buscar evento</label>
          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Gráfico de Gantt */}
      <div className="relative mt-8">
        {loading ? (
          <p>Cargando eventos...</p>
        ) : (
          filteredEvents.map((event, index) => {
            // Determinar las fechas a usar según el status
            let barDates = { start: null as Date | null, end: null as Date | null }
            if (event.status === "Planificación") {
              barDates = { start: event.planned.startDate, end: event.planned.endDate }
            } else if (event.status === "En ejecución") {
              barDates = { start: event.executed.startDate, end: event.executed.endDate }
            } else { // "Test"
              barDates = { start: event.planned.startDate, end: event.planned.endDate }
            }
            return (
              <div key={event.id} className={`relative h-12 mb-1 ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                {/* Nombre y facultad */}
                <div className="absolute left-0 top-0 w-48 h-full flex flex-col justify-center">
                  <span className="text-sm font-medium truncate">{event.name}</span>
                  <span className="text-xs text-gray-500 truncate">{event.faculty}</span>
                </div>
                {/* Contenedor de barra */}
                <div className="absolute left-48 right-0 h-full">
                  <div
                    className={`absolute h-4 top-2 ${statusColors[event.status]} rounded-sm cursor-pointer group`}
                    style={calculateBarStyle(
                      event.planned.startDate, 
                      event.planned.endDate, 
                      event.executed.startDate, 
                      event.executed.endDate, 
                      event.status
                    )}
                    title={`${event.name} - ${event.status}`}
                  >
                    <div className="hidden group-hover:block absolute top-full left-0 mt-2 p-3 bg-white shadow-lg rounded-md z-10 w-64">
                      <p className="font-bold text-sm">{event.name}</p>
                      <p className="text-xs text-gray-500">{event.faculty}</p>
                      {barDates.start && barDates.end ? (
                        <p className="text-sm">{formatDateRange(barDates.start, barDates.end)}</p>
                      ) : (
                        <p className="text-sm">Not scheduled</p>
                      )}
                      {barDates.start && barDates.end && (
                        <p className="text-sm mt-1">
                          Duración: {calculateDuration(barDates.start, barDates.end)}
                        </p>
                      )}
                      <p className="text-sm mt-1 text-center font-medium">{event.status}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Leyenda */}
      <div className="mt-6 flex flex-wrap gap-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-600 rounded-sm mr-2"></div>
          <span className="text-sm">Planificación</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-amber-500 rounded-sm mr-2"></div>
          <span className="text-sm">En ejecución</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-600 rounded-sm mr-2"></div>
          <span className="text-sm">Test</span>
        </div>
      </div>
    </div>
  )
}