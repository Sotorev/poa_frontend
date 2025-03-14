"use client"

import { useEffect, useState } from "react"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LabelList,
  Cell,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCurrentUser } from "@/hooks/use-current-user"

interface FacultyEventData {
  facultyName: string
  totalEventCount: number
  planificados: number
  ejecutados: number
  finalizados: number
}

export default function GraficoAlcanceEventosPorFacultad() {
  const user = useCurrentUser()
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const [data, setData] = useState<FacultyEventData[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      if (!API_URL) return
      setLoading(true)
      try {
        const response = await fetch(
          `${API_URL}/api/reports/financing/faculty/event-count`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${user?.token}`,
            },
          }
        )
        if (!response.ok) {
          throw new Error("Error al obtener los datos de eventos")
        }
        const jsonData: FacultyEventData[] = await response.json()
        setData(jsonData)
      } catch (err: any) {
        setError(err.message || "Error desconocido")
      } finally {
        setLoading(false)
      }
    }
    if (user?.token) {
      fetchData()
    }
  }, [API_URL, user?.token])

  // Permite filtrar por facultad y cambiar la vista (agrupada o apilada)
  const [viewMode, setViewMode] = useState("group")
  const [selectedFacultad, setSelectedFacultad] = useState("todas")

  const filteredData =
    selectedFacultad === "todas"
      ? data
      : data.filter((item) => item.facultyName === selectedFacultad)

  const totals = data.reduce(
    (acc, curr) => ({
      planificados: acc.planificados + curr.planificados,
      ejecutados: acc.ejecutados + curr.ejecutados,
      finalizados: acc.finalizados + curr.finalizados,
    }),
    { planificados: 0, ejecutados: 0, finalizados: 0 }
  )

  const renderCustomizedLabel = (props: {
    x: number
    y: number
    width: number
    height: number
    value: number
    viewMode: string
  }) => {
    const { x, y, width, height, value, viewMode } = props
    const fontSize = 12
    return (
      <text
        x={x + width / 2}
        y={viewMode === "stack" ? y + height / 2 : y - 10}
        fill="#000"
        textAnchor="middle"
        fontSize={fontSize}
      >
        {value}
      </text>
    )
  }

  return (
    <Card className="w-full max-w-7xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Alcance de Eventos por Facultad
        </CardTitle>
        <CardDescription className="text-center">
          Análisis detallado del estado de eventos entre planificados, ejecutados y finalizados
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading && <p>Cargando datos...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && (
          <>
            <div className="flex justify-between items-center mb-6">
              <Select value={selectedFacultad} onValueChange={setSelectedFacultad}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Seleccionar facultad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las facultades</SelectItem>
                  {data.map((item) => (
                    <SelectItem key={item.facultyName} value={item.facultyName}>
                      {item.facultyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={viewMode} onValueChange={setViewMode}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Seleccionar vista" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stack">Vista apilada</SelectItem>
                  <SelectItem value="group">Vista agrupada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <StatCard
                title="Planificados"
                value={totals.planificados}
                color="bg-blue-100 text-blue-800"
              />
              <StatCard
                title="Ejecutados"
                value={totals.ejecutados}
                color="bg-yellow-100 text-yellow-800"
              />
              <StatCard
                title="Finalizados"
                value={totals.finalizados}
                color="bg-green-100 text-green-800"
              />
            </div>
            <div className="h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 70,
                  }}
                  barGap={0.5}
                  barCategoryGap={"20%"}
                >
                  <XAxis
                    dataKey="facultyName"
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fontSize: 12, fill: "#888" }}
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom"
                    align="center"
                    layout="horizontal"
                    wrapperStyle={{ paddingTop: 150 }}
                  />
                  <Bar
                    dataKey="planificados"
                    stackId={viewMode === "stack" ? "a" : undefined}
                    fill="hsl(210, 79%, 46%)"
                    name="Planificados"
                  >
                    <LabelList
                      dataKey="planificados"
                      content={(props) => renderCustomizedLabel({ ...props, viewMode } as { x: number; y: number; width: number; height: number; value: number; viewMode: string })}
                    />
                    {filteredData.map((entry, index) => (
                      <Cell key={`cell-planificados-${index}`} fill="hsl(210, 79%, 46%)" />
                    ))}
                  </Bar>
                  <Bar
                    dataKey="ejecutados"
                    stackId={viewMode === "stack" ? "a" : undefined}
                    fill="hsl(45, 93%, 47%)"
                    name="Ejecutados"
                  >
                    <LabelList
                      dataKey="ejecutados"
                      content={(props) => renderCustomizedLabel({ ...props, viewMode } as { x: number; y: number; width: number; height: number; value: number; viewMode: string })}
                    />
                    {filteredData.map((entry, index) => (
                      <Cell key={`cell-ejecutados-${index}`} fill="hsl(45, 93%, 47%)" />
                    ))}
                  </Bar>
                  <Bar
                    dataKey="finalizados"
                    stackId={viewMode === "stack" ? "a" : undefined}
                    fill="hsl(142, 76%, 36%)"
                    name="Finalizados"
                  >
                    <LabelList
                      dataKey="finalizados"
                      content={(props) => renderCustomizedLabel({ ...props, viewMode } as { x: number; y: number; width: number; height: number; value: number; viewMode: string })}
                    />
                    {filteredData.map((entry, index) => (
                      <Cell key={`cell-finalizados-${index}`} fill="hsl(142, 76%, 36%)" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

interface StatCardProps {
  title: string
  value: number
  color: string
}

function StatCard({ title, value, color }: StatCardProps) {
  return (
    <div className={`p-4 rounded-lg ${color}`}>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}

interface CustomTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-md">
        <h3 className="font-bold text-lg mb-2">{data.facultyName}</h3>
        <p className="text-sm mb-1">
          <span className="font-semibold">Eventos planificados:</span> {data.planificados}
        </p>
        <p className="text-sm mb-1">
          <span className="font-semibold">Eventos ejecutados:</span> {data.ejecutados}
        </p>
        <p className="text-sm">
          <span className="font-semibold">Eventos finalizados:</span> {data.finalizados}
        </p>
      </div>
    )
  }
  return null
}