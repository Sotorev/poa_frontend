"use client"

import { useState, useEffect } from "react"
import type { DashboardData, GanttItem } from "@/types/dashboard"
import { transformEventsToGanttItems, getUpcomingEvents, getOverdueEvents } from "@/utils/dashboard-utils"
import { StatusCards } from "@/components/dashboard/status-cards"
import { EventAlerts } from "@/components/dashboard/event-alerts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Users, Calendar, TrendingUp } from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [ganttItems, setGanttItems] = useState<GanttItem[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<GanttItem[]>([])
  const [overdueEvents, setOverdueEvents] = useState<GanttItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const currentUser = useCurrentUser()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/event/compliance/details/faculty/${currentUser?.facultyId}`, {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser?.token}`,
          },
        })

        if (!res.ok) {
          throw new Error(`Error: ${res.status} ${res.statusText}`)
        }

        const data = await res.json()
        setDashboardData(data)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido al cargar los datos')
        // Fallback to mock data in case of error
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  useEffect(() => {
    if (dashboardData) {
      // Transform events to Gantt items
      const items = transformEventsToGanttItems(dashboardData.allEvents)
      setGanttItems(items)

      // Get upcoming and overdue events
      setUpcomingEvents(getUpcomingEvents(items))
      setOverdueEvents(getOverdueEvents(items))
    }
  }, [dashboardData])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">Cargando datos del dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error && !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar los datos</h2>
              <p className="text-lg text-gray-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-yellow-600 mr-3">⚠️</div>
              <div>
                <p className="text-yellow-800 font-medium">Advertencia</p>
                <p className="text-yellow-700 text-sm">Se produjo un error al cargar los datos. Mostrando datos de respaldo.</p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Panel de Control POA</h1>
            <p className="text-lg text-gray-600">{dashboardData!.name} - Universidad Mesoamericana</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-lg px-4 py-2">
              <BarChart3 className="h-5 w-5 mr-2" />
              {dashboardData!.totalEvents} Eventos Totales
            </Badge>
          </div>
        </div>

        {/* Status Cards */}
        <StatusCards statusData={dashboardData!.statusData} totalEvents={dashboardData!.totalEvents} />

        {/* Event Alerts */}
        <EventAlerts upcomingEvents={upcomingEvents} overdueEvents={overdueEvents} />

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Próximos Vencimientos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{upcomingEvents.length}</div>
              <p className="text-blue-100">Eventos en los próximos 7 días</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Eventos Retrasados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{overdueEvents.length}</div>
              <p className="text-red-100">Requieren atención inmediata</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Tasa de Finalización
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {dashboardData!.statusData.find((s) => s.name === "Finalizado")?.percentage.toFixed(1) || 0}%
              </div>
              <p className="text-green-100">Eventos completados</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
