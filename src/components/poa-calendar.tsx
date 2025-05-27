"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, CalendarIcon, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  getCalendarDays,
  formatMonthYear,
  getEventsForDay,
  getNextMonth,
  getPreviousMonth,
  isCurrentMonth,
  isEventStart,
  isEventEnd,
} from "../utils/calendar-utils"
import type { CalendarEvent } from "../../types/event"
import { useCurrentUser } from "@/hooks/use-current-user"

// Paleta de colores a usar
const colorPalette = [
  { bg: "bg-blue-500", text: "text-white", light: "bg-blue-50", border: "border-blue-200" },
  { bg: "bg-green-500", text: "text-white", light: "bg-green-50", border: "border-green-200" },
  { bg: "bg-rose-500", text: "text-white", light: "bg-rose-50", border: "border-rose-200" },
  { bg: "bg-amber-500", text: "text-white", light: "bg-amber-50", border: "border-amber-200" },
  { bg: "bg-violet-500", text: "text-white", light: "bg-violet-50", border: "border-violet-200" },
  { bg: "bg-cyan-500", text: "text-white", light: "bg-cyan-50", border: "border-cyan-200" },
  { bg: "bg-pink-500", text: "text-white", light: "bg-pink-50", border: "border-pink-200" },
  { bg: "bg-emerald-500", text: "text-white", light: "bg-emerald-50", border: "border-emerald-200" },
  { bg: "bg-orange-500", text: "text-white", light: "bg-orange-50", border: "border-orange-200" },
  { bg: "bg-indigo-500", text: "text-white", light: "bg-indigo-50", border: "border-indigo-200" },
]

// Asignar color a cada evento según su posición
function assignColorsToEvents(events: CalendarEvent[]) {
  return events.map((ev, idx) => {
    const color = colorPalette[idx % colorPalette.length]
    return { ...ev, color }
  })
}

export default function PoaCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [showDayEvents, setShowDayEvents] = useState(false)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const currentUser = useCurrentUser()

  // Cargar eventos y asignar color
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upcoming-dates/upcoming-events/5`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser?.token}`,
          },
        })

        if (!response.ok) {
          throw new Error(`Error al cargar eventos: ${response.statusText}`)
        }

        const data = await response.json()
        const validData = data.filter((item: any) => item.EventID && item.EventName)

        const formattedEvents: CalendarEvent[] = validData.map((item: any) => {
          const startDate = new Date(`${item.StartDate}T12:00:00`);
          const endDate = new Date(`${item.EndDate}T12:00:00`);
          startDate.setDate(startDate.getDate() - 1);
          
          return {
            id: item.EventID,
            name: item.EventName,
            startDate,
            endDate,
          };
        });

        // Asignar un color a cada evento
        const colored = assignColorsToEvents(formattedEvents)
        setEvents(colored)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido al cargar eventos")
      } finally {
        setLoading(false)
      }
    }

    if (currentUser?.token) {
      fetchEvents()
    }
  }, [currentUser?.token])

  const calendarDays = getCalendarDays(currentDate)

  // Moverse hacia el mes anterior/siguiente
  const handlePreviousMonth = () => setCurrentDate(getPreviousMonth(currentDate))
  const handleNextMonth = () => setCurrentDate(getNextMonth(currentDate))

  // Al hacer clic en un día con eventos, abrir modal
  const handleDayClick = (day: Date) => {
    const dayEvents = getEventsForDay(events, day)
    if (dayEvents.length > 0) {
      setSelectedDay(day)
      setShowDayEvents(true)
    }
  }

  const handleCloseModal = () => {
    setShowDayEvents(false)
    setSelectedDay(null)
  }

  // Generar las clases CSS para cada evento según si inicia/termina en el día
  function getEventDisplayStyle(event: CalendarEvent, day: Date) {
    const isStart = isEventStart(event, day)
    const isEnd = isEventEnd(event, day)
    let shape = ""

    if (isStart && isEnd) shape = "rounded-md"
    else if (isStart) shape = "rounded-l-md rounded-r-none"
    else if (isEnd) shape = "rounded-r-md rounded-l-none"
    else shape = "rounded-none"
    
    // Usar directamente la propiedad color de cada evento
    return `${event.color?.bg || ""} ${event.color?.text || ""} ${shape}`
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">

      {/* Encabezado del calendario */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-8 w-8 text-primary" />
              <CardTitle className="text-2xl font-bold text-primary">
                Calendario POA - {formatMonthYear(currentDate)}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handlePreviousMonth} aria-label="Mes anterior">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextMonth} aria-label="Mes siguiente">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Contenedor del calendario */}
      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Cargando eventos...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-red-500">
              <p>Error: {error}</p>
            </div>
          ) : (
            <>
              {/* Encabezado de días de la semana */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
                  <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground bg-muted rounded-lg">
                    {day}
                  </div>
                ))}
              </div>

              {/* Días del mes */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  const isInCurrentMonth = isCurrentMonth(day, currentDate)
                  const dayEvents = getEventsForDay(events, day)

                  return (
                    <div
                      key={index}
                      onClick={() => handleDayClick(day)}
                      className={`min-h-[120px] p-2 border rounded-lg transition-colors cursor-pointer ${
                        isInCurrentMonth
                          ? "bg-background border-border hover:bg-muted/50"
                          : "bg-muted/30 border-muted text-muted-foreground"
                      }`}
                    >
                      {/* Número del día */}
                      <div
                        className={`text-sm font-medium mb-2 ${
                          isInCurrentMonth ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {day.getDate()}
                      </div>

                      {/* Mostrar los eventos de este día (hasta 3) */}
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((event) => {
                          const style = getEventDisplayStyle(event, day)
                          const showEventName = isEventStart(event, day)
                          return (
                            <div key={event.id} className={`text-[9px] p-0 transition-all ${style}`} title={event.name}>
                              {showEventName && <span className="truncate block">{event.name}</span>}
                              {!showEventName && <div className="h-2.5 w-full" />}
                            </div>
                          )
                        })}
                        {dayEvents.length > 3 && (
                          <div
                            className="flex items-center justify-center mt-0.5 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDayClick(day)
                            }}
                          >
                            <span className="bg-primary text-primary-foreground text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
                              +{dayEvents.length - 3}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal con eventos del día */}
      {showDayEvents && selectedDay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-[80vh] flex flex-col">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {selectedDay.toLocaleDateString("es-ES", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={handleCloseModal}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="overflow-y-auto max-h-[60vh] py-4">
              <div className="space-y-3">
                {getEventsForDay(events, selectedDay).map((event) => (
                  <div
                    key={event.id}
                    className={`p-3 rounded-lg border ${event.color?.light || ""} ${event.color?.border || ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${event.color?.bg || ""}`} />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold mb-1">{event.name}</h3>
                        <div className=" text-muted-foreground space-y-1">
                          <div>
                            <span className="font-medium">Inicio:</span>{" "}
                            {/* Crear una nueva fecha sumando 1 día para mostrar la fecha original */}
                            {(() => {
                              const displayDate = new Date(event.startDate);
                              displayDate.setDate(displayDate.getDate() + 1);
                              return displayDate.toLocaleDateString("es-ES", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              });
                            })()}
                          </div>
                          <div className="text-red-600">
                            <span className="font-medium">Fin:</span>{" "}
                            {event.endDate.toLocaleDateString("es-ES", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}