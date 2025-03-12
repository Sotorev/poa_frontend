"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useCurrentUser } from "@/hooks/use-current-user"

// Definición de tipos
type EventPhase = "planificado" | "ejecutado" | "finalizado"

export interface EventPhaseData {
  startDate: Date | null
  endDate: Date | null
  hasData: boolean
}

export interface Event {
  id: number
  name: string
  faculty: string
  phases: {
    [key in EventPhase]: EventPhaseData
  }
}

export default function GanttChart() {
  // Estado de eventos y estadísticas de cada facultad
  const [events, setEvents] = useState<Event[]>([])
  const [facultyStats, setFacultyStats] = useState<Record<
    string,
    { planned: number; completed: number; inProgress: number; total: number }
  >>({})

  const [selectedPhase, setSelectedPhase] = useState("todos")
  // Inicialmente no se ha seleccionado una facultad
  const [selectedFaculty, setSelectedFaculty] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const user = useCurrentUser()
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/reports/event/compliance/details`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user?.token}`,
          },
        })
        const data = await res.json()
        const loadedEvents: Event[] = []
        const statsMap: Record<
          string,
          { planned: number; completed: number; inProgress: number; total: number }
        > = {}

        data.forEach((facultyObj: any) => {
          // Extraer datos de estadísticas usando:
          // "Planificación" para planificados, "Test" para completados y "En ejecución" para en progreso
          let planned = 0,
            completed = 0,
            inProgress = 0
          facultyObj.statusData.forEach((item: any) => {
            if (item.name === "Planificación") planned = item.count
            if (item.name === "Test") completed = item.count
            if (item.name === "En ejecución") inProgress = item.count
          })
          statsMap[facultyObj.name] = {
            planned,
            completed,
            inProgress,
            total: facultyObj.totalEvents,
          }

          facultyObj.allEvents.forEach((apiEvent: any) => {
            // Para "planificado": se renderiza solo si startDate y endDate son válidas (no null)
            const hasPlanificado =
              apiEvent.startDate !== null && apiEvent.endDate !== null
            const planificadoStart = hasPlanificado ? new Date(apiEvent.startDate) : null
            const planificadoEnd = hasPlanificado ? new Date(apiEvent.endDate) : null

            // Para "ejecutado": se renderiza solo si startExecutionDate y endExecutionDate son válidas
            const hasEjecutado =
              apiEvent.startExecutionDate !== null && apiEvent.endExecutionDate !== null
            const ejecutadoStart = hasEjecutado ? new Date(apiEvent.startExecutionDate) : null
            const ejecutadoEnd = hasEjecutado ? new Date(apiEvent.endExecutionDate) : null

            // Para "finalizado": se renderiza solo si endExecutionDate es válida
            const hasFinalizado = apiEvent.endExecutionDate !== null
            const finalizadoStart = hasFinalizado
              ? new Date(new Date(apiEvent.endExecutionDate).getTime() + 24 * 60 * 60 * 1000)
              : null
            const finalizadoEnd = hasFinalizado && finalizadoStart
              ? new Date(finalizadoStart.getTime() + 24 * 60 * 60 * 1000)
              : null

            loadedEvents.push({
              id: apiEvent.eventId,
              name: apiEvent.name,
              faculty: facultyObj.name,
              phases: {
                planificado: {
                  startDate: planificadoStart,
                  endDate: planificadoEnd,
                  hasData: hasPlanificado,
                },
                ejecutado: {
                  startDate: ejecutadoStart,
                  endDate: ejecutadoEnd,
                  hasData: hasEjecutado,
                },
                finalizado: {
                  startDate: finalizadoStart,
                  endDate: finalizadoEnd,
                  hasData: hasFinalizado,
                },
              },
            })
          })
        })
        setEvents(loadedEvents)
        setFacultyStats(statsMap)
      } catch (error) {
        console.error("Error fetching events", error)
      }
    }
    fetchData()
  }, [API_URL, user?.token])

  // Lista de facultades únicas
  const faculties = Array.from(new Set(events.map((event) => event.faculty)))

  // Filtrar eventos (solo se muestran si se ha seleccionado facultad)
  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPhase = selectedPhase === "todos" || true
    const matchesFaculty = selectedFaculty ? event.faculty === selectedFaculty : false
    return matchesSearch && matchesPhase && matchesFaculty
  })

  // Calcular el rango de fechas dinámicamente usando solo fechas válidas
  const allValidDates = events.flatMap((event) => {
    const dates: number[] = []
    if (event.phases.planificado.hasData && event.phases.planificado.startDate && event.phases.planificado.endDate) {
      dates.push(event.phases.planificado.startDate.getTime())
      dates.push(event.phases.planificado.endDate.getTime())
    }
    if (event.phases.ejecutado.hasData && event.phases.ejecutado.startDate && event.phases.ejecutado.endDate) {
      dates.push(event.phases.ejecutado.startDate.getTime())
      dates.push(event.phases.ejecutado.endDate.getTime())
    }
    if (event.phases.finalizado.hasData && event.phases.finalizado.startDate && event.phases.finalizado.endDate) {
      dates.push(event.phases.finalizado.startDate.getTime())
      dates.push(event.phases.finalizado.endDate.getTime())
    }
    return dates
  })

  const timelineStartDate =
    allValidDates.length > 0 ? new Date(Math.min(...allValidDates)) : new Date(2024, 0, 1)
  const timelineEndDate =
    allValidDates.length > 0 ? new Date(Math.max(...allValidDates)) : new Date(2025, 11, 31)

  const totalDays = (timelineEndDate.getTime() - timelineStartDate.getTime()) / (1000 * 60 * 60 * 24)

  // Actualización en el cálculo del ancho:
  const calculateBarStyle = (start: Date, end: Date) => {
    const startDiff = (start.getTime() - timelineStartDate.getTime()) / (1000 * 60 * 60 * 24)
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    const leftPosition = (startDiff / totalDays) * 100
    let widthPercentage = (duration / totalDays) * 100
    // Ajuste: establecer un mínimo de ancho y evitar que sea excesivamente pequeño
    if (widthPercentage < 2) widthPercentage = 2
    // Establecer un ancho máximo que corresponde a 1 año (365 días)
  const maxWidthPercentage = (365 / totalDays) * 100
  if (widthPercentage > maxWidthPercentage) widthPercentage = maxWidthPercentage
    return { left: `${leftPosition}%`, width: `${widthPercentage}%` }
  }

  // Mostrar el rango con día, mes y año (por ejemplo: "15 Ene 2024 – 25 Feb 2024")
  const formatDateRange = (start: Date, end: Date) => {
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    return `${start.getDate()} ${months[start.getMonth()]} ${start.getFullYear()} – ${end.getDate()} ${months[end.getMonth()]} ${end.getFullYear()}`
  }

  const calculateDuration = (start: Date, end: Date) => {
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const months = Math.floor(diffDays / 30)
    const days = diffDays % 30
    return `${months} ${months === 1 ? "mes" : "meses"}, ${days} ${days === 1 ? "día" : "días"}`
  }

  // Estadísticas basadas en el encabezado
  const stats = selectedFaculty && facultyStats[selectedFaculty]
    ? facultyStats[selectedFaculty]
    : { total: 0, completed: 0, inProgress: 0, planned: 0 }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Gráfico de Gantt - POA Universidad</h1>
      <p className="text-gray-500 mb-6 text-sm">
        Este gráfico de Gantt muestra el Plan Operativo Anual (POA) de la universidad para el año 2025. Cada evento está
        representado por tres fases: Planificado (rojo), Ejecutado (amarillo) y Finalizado (verde). El gráfico permite
        visualizar la duración y el progreso de cada evento a lo largo del tiempo.
      </p>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="w-full md:w-1/3">
          <label className="text-sm text-gray-500 mb-1 block">Facultad</label>
          <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona una facultad" />
            </SelectTrigger>
            <SelectContent>
              {faculties.map((faculty) => (
                <SelectItem key={faculty} value={faculty}>
                  {faculty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-1/3">
          <label className="text-sm text-gray-500 mb-1 block">Filtrar por Fase</label>
          <Select value={selectedPhase} onValueChange={setSelectedPhase}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="planificado">Planificado</SelectItem>
              <SelectItem value="ejecutado">Ejecutado</SelectItem>
              <SelectItem value="finalizado">Finalizado</SelectItem>
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

      {/* Mostrar mensaje si no se ha seleccionado una facultad */}
      {!selectedFaculty ? (
        <p className="text-center text-gray-600">Por favor, selecciona una facultad para ver el gráfico.</p>
      ) : (
        <>
          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <h3 className="text-sm text-gray-500 mb-1">Total de Eventos</h3>
              <p className="text-2xl font-bold">{stats.total}</p>
            </Card>
            <Card className="p-4">
              <h3 className="text-sm text-gray-500 mb-1">Eventos Completados</h3>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </Card>
            <Card className="p-4">
              <h3 className="text-sm text-gray-500 mb-1">Eventos en Progreso</h3>
              <p className="text-2xl font-bold">{stats.inProgress}</p>
            </Card>
            <Card className="p-4">
              <h3 className="text-sm text-gray-500 mb-1">Eventos Planificados</h3>
              <p className="text-2xl font-bold">{stats.planned}</p>
            </Card>
          </div>

          {/* Gráfico de Gantt */}
          <div className="relative mt-8">
            {filteredEvents.map((event, index) => (
              <div key={event.id} className={`relative h-12 mb-1 ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                {/* Nombre del evento – se agrega title para mostrar el nombre completo */}
                <div className="absolute left-0 top-0 w-48 h-full flex flex-col justify-center">
                  <span className="text-sm font-medium truncate" title={event.name}>{event.name}</span>
                  <span className="text-xs text-gray-500 truncate" title={event.faculty}>{event.faculty}</span>
                </div>
                {/* Contenedor de barras */}
                <div className="absolute left-48 right-0 h-full">
                  {/* Barra Planificado */}
                  {event.phases.planificado.hasData && event.phases.planificado.startDate && event.phases.planificado.endDate && (
                    <div
                      className="absolute h-4 top-2 bg-red-600 rounded-sm cursor-pointer group"
                      style={calculateBarStyle(event.phases.planificado.startDate, event.phases.planificado.endDate)}
                      title={`${event.name} - Planificado`}
                    >
                      <div className="hidden group-hover:block absolute top-full left-0 mt-2 p-3 bg-white shadow-lg rounded-md z-10 w-64">
                        <p className="font-bold text-sm" title={event.name}>{event.name}</p>
                        <p className="text-xs text-gray-500" title={event.faculty}>{event.faculty}</p>
                        <p className="text-sm">
                          {formatDateRange(event.phases.planificado.startDate, event.phases.planificado.endDate)}
                        </p>
                        <p className="text-sm mt-1">
                          Duración: {calculateDuration(event.phases.planificado.startDate, event.phases.planificado.endDate)}
                        </p>
                        <p className="text-sm mt-1">Porcentaje: 100%</p>
                        <p className="text-sm mt-1 text-red-600 font-medium">Planificado</p>
                      </div>
                    </div>
                  )}
                  {/* Barra Ejecutado */}
                  {event.phases.ejecutado.hasData && event.phases.ejecutado.startDate && event.phases.ejecutado.endDate && (
                    <div
                      className="absolute h-4 top-2 bg-amber-500 rounded-sm cursor-pointer group"
                      style={calculateBarStyle(event.phases.ejecutado.startDate, event.phases.ejecutado.endDate)}
                      title={`${event.name} - Ejecutado`}
                    >
                      <div className="hidden group-hover:block absolute top-full left-0 mt-2 p-3 bg-white shadow-lg rounded-md z-10 w-64">
                        <p className="font-bold text-sm" title={event.name}>{event.name}</p>
                        <p className="text-xs text-gray-500" title={event.faculty}>{event.faculty}</p>
                        <p className="text-sm">
                          {formatDateRange(event.phases.ejecutado.startDate, event.phases.ejecutado.endDate)}
                        </p>
                        <p className="text-sm mt-1">
                          Duración: {calculateDuration(event.phases.ejecutado.startDate, event.phases.ejecutado.endDate)}
                        </p>
                        <p className="text-sm mt-1">Porcentaje: 100%</p>
                        <p className="text-sm mt-1 text-amber-500 font-medium">Ejecutado</p>
                      </div>
                    </div>
                  )}
                  {/* Barra Finalizado */}
                  {event.phases.finalizado.hasData && event.phases.finalizado.startDate && event.phases.finalizado.endDate && (
                    <div
                      className="absolute h-4 top-2 bg-green-600 rounded-sm cursor-pointer group"
                      style={calculateBarStyle(event.phases.finalizado.startDate, event.phases.finalizado.endDate)}
                      title={`${event.name} - Finalizado`}
                    >
                      <div className="hidden group-hover:block absolute top-full left-0 mt-2 p-3 bg-white shadow-lg rounded-md z-10 w-64">
                        <p className="font-bold text-sm" title={event.name}>{event.name}</p>
                        <p className="text-xs text-gray-500" title={event.faculty}>{event.faculty}</p>
                        <p className="text-sm">
                          {formatDateRange(event.phases.finalizado.startDate, event.phases.finalizado.endDate)}
                        </p>
                        <p className="text-sm mt-1">
                          Duración: {calculateDuration(event.phases.finalizado.startDate, event.phases.finalizado.endDate)}
                        </p>
                        <p className="text-sm mt-1">Porcentaje: 100%</p>
                        <p className="text-sm mt-1 text-green-600 font-medium">Finalizado</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {/* Leyenda */}
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-600 rounded-sm mr-2"></div>
              <span className="text-sm">Planificado</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-amber-500 rounded-sm mr-2"></div>
              <span className="text-sm">Ejecutado</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-600 rounded-sm mr-2"></div>
              <span className="text-sm">Finalizado</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}