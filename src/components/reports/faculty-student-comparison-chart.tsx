"use client"

import { useState, useMemo, useEffect } from "react"
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
  ReferenceLine,
  ReferenceArea,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Users, GraduationCap, TrendingUp, AlertCircle } from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" }).format(value)

const formatNumber = (value: number) => new Intl.NumberFormat("es-GT").format(value)

// Definición de la interfaz de datos basada en la respuesta de la API
interface FacultyData {
  facultyId: number
  facultyName: string
  annualBudget: number
  totalStudents: number
}

// Función para calcular estadísticas a partir de los datos
const calculateStats = (data: FacultyData[]) => {
  const avgBudget = data.reduce((sum, item) => sum + item.annualBudget, 0) / data.length
  const avgStudents = data.reduce((sum, item) => sum + item.totalStudents, 0) / data.length

  return {
    avgBudget,
    avgStudents,
    budgetPerStudent: data
      .map((item) => ({
        facultyName: item.facultyName,
        value: item.annualBudget / item.totalStudents,
      }))
      .sort((a, b) => b.value - a.value),
  }
}

// Tooltip personalizado: muestra los datos combinados para cada facultad y calcula el presupuesto por estudiante
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as FacultyData
    const budgetPerStudent = data.annualBudget / data.totalStudents
    // Calcula el porcentaje de diferencia en presupuesto vs. presupuesto ideal (si se requiere alguna lógica adicional se puede incorporar)
    // En este ejemplo se muestra el presupuesto por estudiante
    return (
      <div className="animate-in fade-in duration-200 bg-white/95 backdrop-blur-sm p-4 shadow-lg border rounded-lg max-w-[320px]">
        <div className="flex items-center gap-2 mb-3 border-b pb-2">
          <GraduationCap className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">{data.facultyName}</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4 bg-green-50/50 p-2 rounded">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Presupuesto:</span>
            </div>
            <span className="text-sm font-semibold text-green-700">{formatCurrency(data.annualBudget)}</span>
          </div>
          <div className="flex items-center justify-between gap-4 bg-blue-50/50 p-2 rounded">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Estudiantes:</span>
            </div>
            <span className="text-sm font-semibold text-blue-700">{formatNumber(data.totalStudents)}</span>
          </div>
          <div className="flex items-center justify-between gap-4 bg-purple-50/50 p-2 rounded">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">Presupuesto/Estudiante:</span>
            </div>
            <span className="text-sm font-semibold text-purple-700">{formatCurrency(budgetPerStudent)}</span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

const CustomizedLabel = (props: any) => {
  const { x, y, value } = props
  return (
    <text x={x + 10} y={y} dy={4} fill="#4b5563" fontSize={12} textAnchor="start" className="font-medium">
      {value}
    </text>
  )
}

export default function FacultyStudentComparisonChart() {
  const [data, setData] = useState<FacultyData[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const user = useCurrentUser()

  // Obtenemos los datos de la API (misma ruta que en faculty-comparison-chart)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await fetch(`${API_URL}/api/reports/faculty/faculty-report/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user?.token}`
          }
        })
        if (!response.ok) {
          throw new Error("Error al obtener los datos de facultades.")
        }
        // Se espera que la API devuelva un arreglo de objetos con keys: facultyId, facultyName, annualBudget, totalStudents
        const jsonData: FacultyData[] = await response.json()
        setData(jsonData)
      } catch (err: any) {
        setError(err.message || "Error desconocido")
      }
      setLoading(false)
    }
    if(user?.token){
      fetchData()
    }
  }, [API_URL, user?.token])

  // Calculamos estadísticas para mostrar en otras partes del dashboard
  const stats = useMemo(() => calculateStats(data), [data])

  return (
    <Card className="w-full max-w-7xl mx-auto shadow-md bg-white">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-center text-gray-800">
          Análisis de Presupuesto vs Estudiantes por Facultad
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && <p className="mb-4 text-center text-red-500">{error}</p>}
        {loading && <p className="mb-4 text-center text-gray-600">Cargando datos...</p>}
        {/* Tarjetas de estadísticas (similares a faculty-comparison-chart) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-green-50 border border-green-200">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Mayor Presupuesto por Estudiante</h3>
              <div className="flex items-center justify-between">
                <span className="text-green-800">{stats.budgetPerStudent[0]?.facultyName}</span>
                <span className="font-semibold text-green-700">
                  {stats.budgetPerStudent[0] ? formatCurrency(stats.budgetPerStudent[0].value) : "-"}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border border-blue-200">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Promedio de Estudiantes</h3>
              <div className="flex items-center justify-between">
                <span className="text-blue-800">General</span>
                <span className="font-semibold text-blue-700">{formatNumber(Math.round(stats.avgStudents))}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border border-purple-200">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Promedio de Presupuesto</h3>
              <div className="flex items-center justify-between">
                <span className="text-purple-800">General</span>
                <span className="font-semibold text-purple-700">{formatCurrency(stats.avgBudget)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Gráfico Scatter */}
        <div className="h-[600px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{
                top: 20,
                right: 80,
                bottom: 40,
                left: 80,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                type="number"
                dataKey="totalStudents"
                name="Estudiantes"
                label={{
                  value: "Cantidad de Estudiantes",
                  position: "bottom",
                  offset: 20,
                  style: { fill: "#4b5563" },
                }}
                tick={{ fill: "#4b5563" }}
              />
              <YAxis
                type="number"
                dataKey="annualBudget"
                name="Presupuesto"
                label={{
                  value: "Presupuesto (GTQ)",
                  angle: -90,
                  position: "left",
                  offset: 40,
                  style: { fill: "#4b5563" },
                }}
                tick={{ fill: "#4b5563" }}
                tickFormatter={(value) => `${value / 1000000}M`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3" }} wrapperStyle={{ outline: "none" }} />
              <ReferenceLine
                x={stats.avgStudents}
                stroke="#3b82f6"
                strokeDasharray="3 3"
                label={{ value: "Promedio Estudiantes", position: "insideBottom", fill: "#3b82f6" }}
              />
              <ReferenceLine
                y={stats.avgBudget}
                stroke="#10b981"
                strokeDasharray="3 3"
                label={{ value: "Promedio Presupuesto", position: "insideLeft", fill: "#10b981" }}
              />
              <ReferenceArea
                x1={0}
                x2={stats.avgStudents}
                y1={stats.avgBudget}
                y2={Number.POSITIVE_INFINITY}
                fill="#f0fdf4"
                fillOpacity={0.2}
              />
              <ReferenceArea
                x1={stats.avgStudents}
                x2={Number.POSITIVE_INFINITY}
                y1={stats.avgBudget}
                y2={Number.POSITIVE_INFINITY}
                fill="#f0f7ff"
                fillOpacity={0.2}
              />
              <ReferenceArea
                x1={0}
                x2={stats.avgStudents}
                y1={0}
                y2={stats.avgBudget}
                fill="#fff7ed"
                fillOpacity={0.2}
              />
              <ReferenceArea
                x1={stats.avgStudents}
                x2={Number.POSITIVE_INFINITY}
                y1={0}
                y2={stats.avgBudget}
                fill="#fdf2f8"
                fillOpacity={0.2}
              />
              <Scatter data={data} fill="#60a5fa" stroke="#3b82f6" strokeWidth={2}>
                {data.map((entry, index) => (
                  <Label key={index} content={<CustomizedLabel value={entry.facultyName} />} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Guía de Interpretación
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Cuadrante Superior Derecho: Alto presupuesto y alto número de estudiantes</li>
              <li>• Cuadrante Superior Izquierdo: Alto presupuesto con menos estudiantes</li>
              <li>• Cuadrante Inferior Derecho: Bajo presupuesto con más estudiantes</li>
              <li>• Cuadrante Inferior Izquierdo: Bajo presupuesto y menos estudiantes</li>
            </ul>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Indicadores Clave
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Las líneas punteadas representan los promedios generales</li>
              <li>• Pase el cursor sobre cada punto para ver detalles específicos</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}