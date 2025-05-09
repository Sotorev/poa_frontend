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
import { toast } from 'react-toastify'

/**
 * Interfaz para los datos de Costos obtenidos de la API.
 */
interface CostData {
  objectiveId: number
  objectiveName: string
  objectiveDescription: string
  totalAmount: number
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
 * Componente personalizado para los ticks del eje X que muestra tanto el ID como el Nombre del Objetivo Estratégico.
 */
const CustomXAxisTick = ({
  x,
  y,
  payload,
  getTickFontSize
}: {
  x: number
  y: number
  payload: any
  getTickFontSize: () => number
}) => {
  const { value } = payload;
  const description = "Obj. Estratégico No. ";

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="end"
        fill="hsl(var(--foreground))"
        fontSize={getTickFontSize()}
        transform="rotate(-45)"
      >
        {description + value}
      </text>
    </g>
  );
};

/**
 * Componente que muestra un gráfico de barras de los Costos por Objetivo Estratégico del POA.
 * Permite filtrar por facultad y ajusta el tamaño del gráfico según el ancho de la ventana.
 */
export default function PoaCostChart() {
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
   * Genera un color único para cada objetivo estratégico basado en su ID.
   * Utiliza una distribución uniforme de colores en el espacio de tonos.
   */
  const generateColorForObjective = (objectiveId: number): string => {
    const hue = (objectiveId * 137.508) % 360 // Distribuye los colores uniformemente
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
   * Estado para almacenar los datos mapeados de Costos por Objetivo Estratégico.
   */
  const [filteredData, setFilteredData] = useState<{
    objectiveId: number
    objectiveName: string
    objectiveDescription: string
    cost: number
  }[]>([])

  /**
   * Obtiene los datos de Costos por Objetivo Estratégico al montar el componente o al cambiar la facultad seleccionada.
   */
  useEffect(() => {
    const fetchAndMapData = async () => {
      setLoading(true)
      setError(null)

      try {
        let endpoint = ''

        if (selectedFacultyId === "all") {
          endpoint = `${API_URL}/api/reports/financing/financing-by-objective`
        } else {
          endpoint = `${API_URL}/api/reports/financing/financing-by-objective-faculty/${selectedFacultyId}`
        }


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
              ? 'Error al obtener los datos de costos para todas las facultades.'
              : `Error al obtener los datos de costos para la facultad seleccionada.`
          )
        }

        const data: CostData[] = await response.json()


        // Mapear los datos para Recharts, asignando 'totalAmount' a 'cost'
        const mapped = data.map(item => ({
          objectiveId: item.objectiveId,
          objectiveName: item.objectiveName,
          objectiveDescription: item.objectiveDescription,
          cost: item.totalAmount
        }))

        setFilteredData(mapped)
      } catch (err: any) {
        setError(err.message || 'Error desconocido al obtener los datos de costos.')
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
   * useEffect para mostrar un toast cuando hay un error.
   */
  useEffect(() => {
    if (error) {
      toast.error(error, {
        position: "top-right",
        autoClose: 5000, // Duración del toast en milisegundos
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      })
      setError(null) // Limpia el error después de mostrar el toast para evitar toasts repetidos
    }
  }, [error])

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
   * Formatea los valores numéricos como moneda.
   */
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(value)
  }

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Costos por Objetivo Estratégico
        </CardTitle>
        <CardDescription className="text-center">
          {selectedFacultyId === "all"
            ? <>Costos totales de <span className="text-[#004D40] font-semibold">todas las facultades</span> por objetivo estratégico del POA</>
            : <>Costos por objetivo estratégico del POA para la Facultad de <span className="text-[#004D40] font-semibold">{getFacultyName()}</span></>}
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
                  dataKey="objectiveId"
                  height={100}
                  tick={(props) => <CustomXAxisTick {...props} getTickFontSize={getTickFontSize} />}
                  stroke="hsl(var(--muted))"
                />
                <YAxis
                  tick={{ fontSize: getTickFontSize(), fill: "hsl(var(--foreground))" }}
                  stroke="hsl(var(--muted))"
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  formatter={(value: number) => formatCurrency(value)}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const { objectiveId, objectiveDescription, cost } = payload[0].payload
                      return (
                        <div className="bg-white p-2 border rounded shadow">
                          <p className="font-semibold">Objetivo Estratégico No. {objectiveId}</p>
                          <p className="font-semibold mt-1">Descripción:</p>
                          <p>{objectiveDescription || "No hay descripción disponible."}</p>
                          <p className="mt-1">Costo: {formatCurrency(cost)}</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar
                  dataKey="cost"
                  radius={[4, 4, 0, 0]}
                  label={{
                    position: 'top',
                    fill: "hsl(var(--foreground))",
                    fontSize: 14,
                    formatter: (value: number) => formatCurrency(value)
                  }}
                >
                  {filteredData.map((entry) => (
                    <Cell
                      key={`cell-${entry.objectiveId}`}
                      fill={generateColorForObjective(entry.objectiveId)}
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
