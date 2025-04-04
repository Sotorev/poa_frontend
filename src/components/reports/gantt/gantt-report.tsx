"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useCurrentUser } from "@/hooks/use-current-user"
import { FacultyWithEvents } from "./type.gant"
// Services
import { getEventsByFaculty } from "./service.gant"
import { getFaculties } from "@/services/faculty/service.faculty"
// Definición de tipos
import { Faculty } from "@/types/type.faculty"
type EventState = "Planificación" | "En ejecución" | "Finalizado" | "Todos"



export default function GanttChart() {
  const [facultyWithEvents, setFacultyWithEvents] = useState<FacultyWithEvents[]>([])
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const user = useCurrentUser()

  const [selectedState, setSelectedState] = useState<EventState>("Todos")
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyWithEvents>()

  const [searchTerm, setSearchTerm] = useState("")



  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user?.token) return

        setFacultyWithEvents(await getEventsByFaculty(user?.token))
      } catch (error) {
        console.error("Error fetching events", error)
      }
    }
    fetchData()
  }, [user?.token])

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        if (!user?.token) return
        const faculties = await getFaculties(user?.token)
        setFaculties(faculties)
      } catch (error) {
        console.error("Error fetching faculties", error)
      }
    }
    fetchFaculties()
  }, [user?.token])

  const timelineStartDate = new Date(2024, 0, 1)
  const timelineEndDate = new Date(2025, 11, 31)

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

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Gráfico de Gantt - POA Universidad</h1>
      <p className="text-gray-500 mb-6 text-sm">
        Este gráfico de Gantt muestra el Plan Operativo Anual (POA) de la universidad para el año 2025. Cada evento está
        representado por tres fases: Planificación (rojo), Ejecutado (amarillo) y Finalizado (verde). El gráfico permite
        visualizar la duración y el progreso de cada evento a lo largo del tiempo.
      </p>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="w-full md:w-1/3">
          <label className="text-sm text-gray-500 mb-1 block">Facultad</label>
          <Select onValueChange={(value) => setSelectedFaculty(facultyWithEvents.find(f => f.name === value))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona una facultad" />
            </SelectTrigger>
            <SelectContent>
              {faculties.map((faculty) => (
                <SelectItem key={faculty.facultyId} value={faculty.name}>
                  {faculty.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-1/3">
          <label className="text-sm text-gray-500 mb-1 block">Filtrar por Fase</label>
          <Select value={selectedState} onValueChange={(value) => setSelectedState(value as EventState | "Todos")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos</SelectItem>
              <SelectItem value="Planificación">Planificación</SelectItem>
              <SelectItem value="En ejecución">En ejecución</SelectItem>
              <SelectItem value="Finalizado">Finalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* <div className="w-full md:w-1/3">
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
        </div> */}
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
              <p className="text-2xl font-bold">{selectedFaculty.allEvents.length}</p>
            </Card>
            <Card className="p-4">
              <h3 className="text-sm text-gray-500 mb-1">Eventos Completados</h3>
              <p className="text-2xl font-bold">{selectedFaculty.statusData.find(s => s.name === "Finalizado")?.count || 0}</p>
            </Card>
            <Card className="p-4">
              <h3 className="text-sm text-gray-500 mb-1">Eventos en Progreso</h3>
              <p className="text-2xl font-bold">{selectedFaculty.statusData.find(s => s.name === "En ejecución")?.count || 0}</p>
            </Card>
            <Card className="p-4">
              <h3 className="text-sm text-gray-500 mb-1">Eventos Planificacións</h3>
              <p className="text-2xl font-bold">{selectedFaculty.statusData.find(s => s.name === "Planificación")?.count || 0}</p>
            </Card>
          </div>

          {/* Gráfico de Gantt */}
          <div className="relative mt-8">
            {selectedFaculty.allEvents.map((event, index) => (
              <div key={event.eventId} className={`relative h-12 mb-1 ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                {/* Nombre del evento – se agrega title para mostrar el nombre completo */}
                <div className="absolute left-0 top-0 w-48 h-full flex flex-col justify-center">
                  <span className="text-sm font-medium truncate" title={event.name}>{event.name}</span>
                </div>
                {/* Contenedor de barras */}
                <div className="absolute left-48 right-0 h-full">
                  {/* Barra Planificación */}
                  {event.status === "Planificación" && (
                    <div
                      className="absolute h-4 top-2 bg-red-600 rounded-sm cursor-pointer group"
                      style={calculateBarStyle(new Date(event.startDate), new Date(event.endDate))}
                      title={`${event.name} - Planificación`}
                    >
                      <div className="hidden group-hover:block absolute top-full left-0 mt-2 p-3 bg-white shadow-lg rounded-md z-10 w-64">
                        <p className="font-bold text-sm" title={event.name}>{event.name}</p>
                        <p className="text-sm">
                          {formatDateRange(new Date(event.startDate), new Date(event.endDate))}
                        </p>
                        <p className="text-sm mt-1">
                          Duración: {calculateDuration(new Date(event.startDate), new Date(event.endDate))}
                        </p>
                        <p className="text-sm mt-1">Porcentaje: 100%</p>
                        <p className="text-sm mt-1 text-red-600 font-medium">Planificación</p>
                      </div>
                    </div>
                  )}
                  {/* Barra Ejecutado */}
                  {event.status === "En ejecución" && (
                    <div
                      className="absolute h-4 top-2 bg-amber-500 rounded-sm cursor-pointer group"
                      style={calculateBarStyle(new Date(event.startDate), new Date(event.endDate))}
                      title={`${event.name} - Ejecutado`}
                    >
                      <div className="hidden group-hover:block absolute top-full left-0 mt-2 p-3 bg-white shadow-lg rounded-md z-10 w-64">
                        <p className="font-bold text-sm" title={event.name}>{event.name}</p>
                        <p className="text-sm">
                          {formatDateRange(new Date(event.startDate), new Date(event.endDate))}
                        </p>
                        <p className="text-sm mt-1">
                          Duración: {calculateDuration(new Date(event.startDate), new Date(event.endDate))}
                        </p>
                        <p className="text-sm mt-1">Porcentaje: 100%</p>
                        <p className="text-sm mt-1 text-amber-500 font-medium">Ejecutado</p>
                      </div>
                    </div>
                  )}
                  {/* Barra Finalizado */}
                  {event.status === "Finalizado" && (
                    <div
                      className="absolute h-4 top-2 bg-green-600 rounded-sm cursor-pointer group"
                      style={calculateBarStyle(new Date(event.startDate), new Date(event.endDate))}
                      title={`${event.name} - Finalizado`}
                    >
                      <div className="hidden group-hover:block absolute top-full left-0 mt-2 p-3 bg-white shadow-lg rounded-md z-10 w-64">
                        <p className="font-bold text-sm" title={event.name}>{event.name}</p>
                        <p className="text-sm">
                          {formatDateRange(new Date(event.startDate), new Date(event.endDate))}
                        </p>
                        <p className="text-sm mt-1">
                          Duración: {calculateDuration(new Date(event.startDate), new Date(event.endDate))}
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
              <span className="text-sm">Planificación</span>
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