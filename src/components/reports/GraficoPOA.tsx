"use client"

import { useState, useEffect } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell
} from 'recharts'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useToast } from "@/hooks/use-toast"

/**
 * Interfaz para los datos de POA obtenidos de la API.
 */
interface PoaData {
  objectiveId: number
  objectiveName: string
  objectiveDescription: string
  eventCount: number
}

/**
 * Interfaz para las facultades obtenidas de la API.
 */
interface Faculty {
  facultyId: number
  name: string
  deanName: string
  additionalInfo: string | null
  annualBudget: number
  isDeleted: boolean
  isUniversityModule: boolean
}

/**
 * Componente que muestra un gráfico de barras de los Objetivos Estratégicos del POA.
 * Permite filtrar por facultad y ajusta el tamaño del gráfico según el ancho de la ventana.
 */
export default function PoaChart() {
  const user = useCurrentUser()
  const { toast } = useToast()
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>("all") // "all" representa todas las facultades
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL

  /**
   * Estado para manejar el ancho de la ventana y ajustar el gráfico responsivamente.
   */
  const [chartWidth, setChartWidth] = useState<number>(0)

  useEffect(() => {
    const updateWidth = () => {
      setChartWidth(window.innerWidth)
    }

    window.addEventListener('resize', updateWidth)
    updateWidth()

    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error,
      })
    }
  }, [error, toast])
  /**
   * Genera un color único para cada objetivo estratégico basado en su ID.
   * Utiliza una distribución uniforme de colores en el espacio de tonos.
   */
  const generateColor = (id: number): string => {
    const hue = (id * 137.508) % 360 // Distribuye los colores uniformemente
    return `hsl(${hue}, 65%, 55%)`
  }

  /**
   * Obtiene la lista de facultades al montar el componente.
   */
  useEffect(() => {
    const fetchFaculties = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`${API_URL}/api/faculties`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.token}`
          }
        })
        if (!response.ok) {
          throw new Error('Error al obtener la lista de facultades.')
        }
        const data: Faculty[] = await response.json()
        setFaculties(data)
      } catch (err: any) {
        setError(err.message || 'Error desconocido al obtener las facultades.')
      } finally {
        setLoading(false)
      }
    }

    // Solo realizar la solicitud si el usuario tiene un token
    if (user?.token) {
      fetchFaculties()
    } else {
      setFaculties([]) // Opcional: limpiar facultades si no hay token
      setError('No autenticado. Por favor, inicia sesión para ver las facultades.')
    }
  }, [API_URL, user?.token])

  /**
   * Estado para almacenar los datos mapeados de Objetivos Estratégicos.
   */
  const [filteredData, setFilteredData] = useState<{
    objectiveId: number
    objective: string
    events: number
    objectiveDescription: string
  }[]>([])

  /**
   * Obtiene los datos de Objetivos Estratégicos al montar el componente o al cambiar la facultad seleccionada.
   */
  useEffect(() => {
    const fetchAndMapData = async () => {
      setLoading(true)
      setError(null)

      try {
        let endpoint = ''

        if (selectedFacultyId === "all") {
          endpoint = `${API_URL}/api/reports/financing/event-count-by-objective`
        } else {
          // Usar el facultyId directamente sin encodeURIComponent
          endpoint = `${API_URL}/api/reports/financing/event-count-by-objective/${selectedFacultyId}`
        }

        console.log(`Fetching POA data from: ${endpoint}`) // Registro de depuración

        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.token}`
          }
        })
        if (!response.ok) {
          throw new Error(
            selectedFacultyId === "all"
              ? 'Error al obtener los datos de POA para todas las facultades.'
              : `Error al obtener los datos de POA para la facultad seleccionada.`
          )
        }

        const data: PoaData[] = await response.json()

        console.log('POA Data Received:', data) // Registro de depuración

        // Mapear los datos para Recharts
        const mapped = data.map(item => ({
          objectiveId: item.objectiveId,
          objective: item.objectiveName,
          events: item.eventCount,
          objectiveDescription: item.objectiveDescription
        }))

        setFilteredData(mapped)
      } catch (err: any) {
        setError(err.message || 'Error desconocido al obtener los datos de POA.')
      } finally {
        setLoading(false)
      }
    }

    if (user?.token) {
      fetchAndMapData()
    } else {
      setFilteredData([])
      setError('No autenticado. Por favor, inicia sesión para ver los datos.')
    }
  }, [selectedFacultyId, API_URL, user?.token])

  /**
   * Obtiene el nombre de la facultad seleccionada para mostrar en la descripción.
   */
  const getFacultyName = () => {
    if (selectedFacultyId === "all") return "todas las facultades"
    const faculty = faculties.find(fac => fac.facultyId.toString() === selectedFacultyId)
    return faculty ? faculty.name : "la facultad seleccionada"
  }

  /**
   * Obtiene la altura del gráfico según el ancho de la ventana.
   */
  const getChartHeight = () => {
    if (chartWidth < 480) return 300
    if (chartWidth < 768) return 400
    return 500
  }

  /**
   * Obtiene el tamaño de la fuente para las etiquetas del eje X según el ancho del gráfico.
   */
  const getTickFontSize = () => {
    if (chartWidth < 480) return 10
    if (chartWidth < 768) return 11
    return 12
  }

  /**
   * Componente personalizado para los ticks del eje X que muestra tanto el ID como el Nombre del Objetivo Estratégico.
   */
  const CustomXAxisTick = ({ x, y, payload, index }: any) => {
    const { objectiveId, objective } = filteredData[index]

    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor="middle" fill="hsl(var(--foreground))" fontSize={getTickFontSize()}>
          {objectiveId}
        </text>
        <text x={0} y={0} dy={30} textAnchor="middle" fill="hsl(var(--foreground))" fontSize={getTickFontSize()}>
          {objective}
        </text>
      </g>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Cantidad de eventos por Objetivo Estratégico
        </CardTitle>
        <CardDescription className="text-center">
          {selectedFacultyId === "all"
            ? <>Aporte total de <span className="text-[#004D40] font-semibold">todas las facultades</span> en la Distribución de eventos del POA por objetivo estratégico</>
            : <>Distribución de eventos del POA por objetivo estratégico para la Facultad de <span className="text-[#004D40] font-semibold">{getFacultyName()}</span></>}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        <div className="mb-6 flex justify-start">
          <Select onValueChange={setSelectedFacultyId} defaultValue="all">
            <SelectTrigger className="w-[200px] text-[#004D40] font-semibold">
              <SelectValue placeholder="Seleccionar Facultad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem 
                key="all" 
                value="all" 
                className="font-semibold text-[#004D40]"
              >
                Todas
              </SelectItem>
              {faculties.map((faculty) => (
                <SelectItem 
                  key={faculty.facultyId} 
                  value={faculty.facultyId.toString()} 
                  className="font-semibold"
                >
                  {faculty.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading && (
          <div className="flex justify-center items-center h-full">
            <p>Cargando datos...</p>
          </div>
        )}

        {error && (
          <div className="flex justify-center items-center h-full">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="w-full" style={{ height: getChartHeight() }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredData}
                margin={{
                  top: 20,
                  right: chartWidth < 768 ? 10 : 30,
                  left: chartWidth < 768 ? 10 : 20,
                  bottom: chartWidth < 768 ? 100 : 120
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(142, 60%, 92%)" />
                <XAxis
                  dataKey="objective"
                  height={100}
                  tick={<CustomXAxisTick />}
                  stroke="hsl(var(--muted))"
                />
                <YAxis 
                  tick={{ fontSize: getTickFontSize(), fill: "hsl(var(--foreground))" }} 
                  stroke="hsl(var(--muted))"
                />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const { objectiveId, objectiveDescription, events } = payload[0].payload
                      return (
                        <div className="bg-white p-2 border rounded shadow">
                          <p className="font-semibold">ID del Objetivo: {objectiveId}</p>
                          <p className="font-semibold mt-1">Descripción:</p>
                          <p>{objectiveDescription || "No hay descripción disponible."}</p>
                          <p className="mt-1">Eventos: {events}</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar 
                  dataKey="events" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={60}
                  label={{ 
                    position: 'top', 
                    fill: "hsl(var(--foreground))",
                    fontSize: 14 
                  }} 
                >
                  {filteredData.map((entry) => (
                    <Cell
                      key={`cell-${entry.objectiveId}`}
                      fill={generateColor(entry.objectiveId)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
