"use client"

import { useState, useEffect, useMemo } from 'react'
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

/**
 * Interfaz para los datos de ODS obtenidos de la API.
 */
interface ODSData {
  odsId: number
  odsName: string
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
 * Lista de Objetivos de Desarrollo Sostenible (ODS) con sus colores específicos.
 * Se define fuera del componente para evitar recrearlos en cada render.
 */
const ODS_LIST: { number: number; name: string; color: string }[] = [
  { number: 1, name: "Fin de la pobreza", color: "#E5243B" },
  { number: 2, name: "Hambre cero", color: "#DDA63A" },
  { number: 3, name: "Salud y bienestar", color: "#4C9F38" },
  { number: 4, name: "Educación de calidad", color: "#C5192D" },
  { number: 5, name: "Igualdad de género", color: "#FF3A21" },
  { number: 6, name: "Agua limpia y saneamiento", color: "#26BDE2" },
  { number: 7, name: "Energía asequible y no contaminante", color: "#FCC30B" },
  { number: 8, name: "Trabajo decente y crecimiento económico", color: "#A21942" },
  { number: 9, name: "Industria, innovación e infraestructura", color: "#FD6925" },
  { number: 10, name: "Reducción de las desigualdades", color: "#DD1367" },
  { number: 11, name: "Ciudades y comunidades sostenibles", color: "#FD9D24" },
  { number: 12, name: "Producción y consumo responsables", color: "#BF8B2E" },
  { number: 13, name: "Acción por el clima", color: "#3F7E44" },
  { number: 14, name: "Vida submarina", color: "#0A97D9" },
  { number: 15, name: "Vida de ecosistemas terrestres", color: "#56C02B" },
  { number: 16, name: "Paz, justicia e instituciones sólidas", color: "#00689D" },
  { number: 17, name: "Alianzas para lograr los objetivos", color: "#19486A" }
]

/**
 * Componente que muestra un gráfico de barras de los Objetivos de Desarrollo Sostenible (ODS).
 * Permite filtrar por facultad y ajusta el tamaño del gráfico según el ancho de la ventana.
 */
export default function ODSChart() {
  const user = useCurrentUser()
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

  /**
   * Configuración de ODS para facilitar el acceso a nombres y colores.
   */
  const ODS_CONFIG = useMemo(() => {
    const config: Record<number, { name: string; color: string }> = {}
    ODS_LIST.forEach(ods => {
      config[ods.number] = { name: ods.name, color: ods.color }
    })
    return config
  }, [])

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
   * Estado para almacenar los datos mapeados de ODS.
   */
  const [filteredData, setFilteredData] = useState<{
    objective: string
    events: number
    name: string
    color: string
  }[]>([])

  /**
   * Obtiene los datos de ODS al montar el componente o al cambiar la facultad seleccionada.
   */
  useEffect(() => {
    const fetchAndMapODSData = async () => {
      setLoading(true)
      setError(null)

      try {
        let endpoint = ''

        if (selectedFacultyId === "all") {
          endpoint = `${API_URL}/api/reports/ods/event-count-by-ods`
        } else {
          // Usar el facultyId directamente sin encodeURIComponent
          endpoint = `${API_URL}/api/reports/ods/event-count-by-ods/${selectedFacultyId}`
        }

        console.log(`Fetching ODS data from: ${endpoint}`) // Registro de depuración

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
              ? 'Error al obtener los datos de ODS para todas las facultades.'
              : `Error al obtener los datos de ODS para la facultad seleccionada.`
          )
        }

        const data: ODSData[] = await response.json()

        console.log('ODS Data Received:', data) // Registro de depuración

        // Crear un mapa de odsId a eventCount para facilitar la búsqueda
        const dataMap: Record<number, number> = {}
        data.forEach(item => {
          dataMap[item.odsId] = item.eventCount
        })

        // Mapear todos los ODS, asignando 0 a los que no estén en la respuesta
        const mapped = ODS_LIST.map(ods => ({
          objective: `ODS ${ods.number}`,
          events: dataMap[ods.number] || 0,
          name: ods.name,
          color: ods.color
        }))

        setFilteredData(mapped)
      } catch (err: any) {
        setError(err.message || 'Error desconocido al obtener los datos de ODS.')
      } finally {
        setLoading(false)
      }
    }

    if (user?.token) {
      fetchAndMapODSData()
    } else {
      setFilteredData([])
      setError('No autenticado. Por favor, inicia sesión para ver los datos.')
    }
  }, [selectedFacultyId, API_URL, user?.token, ODS_CONFIG])

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
    if (chartWidth < 480) return 400
    if (chartWidth < 768) return 500
    return 600
  }

  /**
   * Obtiene el tamaño de la fuente para las etiquetas del eje X según el ancho del gráfico.
   */
  const getTickFontSize = () => {
    if (chartWidth < 480) return 10
    if (chartWidth < 768) return 11
    return 12
  }

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader className="space-y-2">
        <CardTitle className="text-xl sm:text-2xl text-center">
          Cantidad de eventos por Objetivo de Desarrollo Sostenible (ODS)
        </CardTitle>
        <CardDescription className="text-sm sm:text-base text-center">
          {selectedFacultyId === "all"
            ? <>
                Aporte total de <span className="text-[#004D40] font-semibold">todas las facultades</span> en la distribución de eventos del POA por ODS
              </>
            : <>
                Distribución de eventos del POA por ODS para la Facultad de <span className="text-[#004D40] font-semibold">{getFacultyName()}</span>
              </>
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        <div className="mb-6 flex justify-start">
          <Select onValueChange={setSelectedFacultyId} defaultValue="all">
            <SelectTrigger className="w-full sm:w-[200px] text-[#004D40] font-semibold">
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
                  value={faculty.facultyId.toString()} // Convertir a string para el valor
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
                  bottom: chartWidth < 768 ? 120 : 100
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="objective"
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  height={100}
                  tick={{ fontSize: getTickFontSize() }}
                  tickMargin={10}
                />
                <YAxis
                  tick={{ fontSize: getTickFontSize() }}
                  width={chartWidth < 768 ? 30 : 40}
                />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-2 border rounded shadow">
                          <p className="font-semibold">{payload[0].payload.name}</p>
                          <p>Eventos: {payload[0].value}</p>
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
                  {filteredData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
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
