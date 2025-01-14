"use client"

import { useState, useEffect } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useCurrentUser } from "@/hooks/use-current-user"
import { toast } from 'react-toastify'

interface FinancingSource {
  name: string
  amount: number
  percentageOfCategory: number
  percentageOfTotalCost: number
}

interface CategoryStats {
  totalAmount: number
  percentageOfTotal: number
  financingSources: {
    [key: string]: FinancingSource
  }
}

interface Faculty {
  facultyId: number
  name: string
  deanName: string
  additionalInfo: string | null
  annualBudget: number
  isDeleted: boolean
  isUniversityModule: boolean
}

interface CostData {
  faculty: Faculty
  facultyname: string
  categoryStats: {
    UMES: CategoryStats
    Otra: CategoryStats
  }
  additionalResources: { amount: number }[]
  totalCost: number
  facultyBudget: number
  remainingFacultyBudget: number
  totalApprovedEventsCost: number
}

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
  const { facultyname } = payload.value

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="middle"
        fill="hsl(142, 76%, 36%)"
        fontSize={getTickFontSize()}
      >
        {facultyname}
      </text>
    </g>
  )
}

export default function CostByFaculty() {
  const user = useCurrentUser()
  const [includeAdditionalResources, setIncludeAdditionalResources] = useState(false)
  const [filteredData, setFilteredData] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL

  const [chartWidth, setChartWidth] = useState<number>(0)

  useEffect(() => {
    const updateWidth = () => {
      setChartWidth(window.innerWidth)
    }

    window.addEventListener('resize', updateWidth)
    updateWidth()

    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  const formatCurrency = (value: number) => `Q${value.toLocaleString()}`

  const getTickFontSize = () => {
    if (chartWidth < 480) return 10
    if (chartWidth < 768) return 11
    return 12
  }

  useEffect(() => {
    const fetchAndMapData = async () => {
      setLoading(true)
      setError(null)

      try {
        const endpoint = `${API_URL}/api/reports/financing/poasByFaculty`

        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.token}`
          }
        })
        if (!response.ok) {
          throw new Error('Error al obtener los datos de costos por facultad.')
        }

        const data: CostData[] = await response.json()

        const mapped = data.map(item => ({
          facultyname: item.faculty?.name || "Sin Nombre",
          umesContribution: item.categoryStats?.UMES?.totalAmount || 0,
          otherContributions: item.categoryStats?.Otra?.totalAmount || 0,
          additionalResources: includeAdditionalResources && Array.isArray(item.additionalResources)
            ? item.additionalResources.reduce((sum, res) => sum + (res.amount || 0), 0)
            : 0,
          totalCost: item.totalCost || 0,
          facultyBudget: item.facultyBudget || 0,
          remainingFacultyBudget: item.remainingFacultyBudget || 0,
          totalApprovedEventsCost: item.totalApprovedEventsCost || 0
        }))

        setFilteredData(mapped)
      } catch (err: any) {
        setError(err.message || 'Error desconocido al obtener los datos de costos por facultad.')
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
  }, [API_URL, user?.token, includeAdditionalResources])

  useEffect(() => {
    if (error) {
      toast.error(error, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      })
      setError(null)
    }
  }, [error])

  const getTooltipContent = (payload: any, label: string, active: boolean) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload

      return (
        <div className="rounded-lg border border-green-300 bg-green-50 p-2 shadow-sm">
          <p className="font-bold text-green-800">Facultad: {data.facultyname}</p>
          <p className="text-sm">
            <span className="font-medium text-green-700">Contribución UMES:</span> {formatCurrency(data.umesContribution)}
          </p>
          <p className="text-sm">
            <span className="font-medium text-green-700">Otras Contribuciones:</span> {formatCurrency(data.otherContributions)}
          </p>
          {includeAdditionalResources && (
            <p className="text-sm">
              <span className="font-medium text-green-700">Recursos Adicionales:</span> {formatCurrency(data.additionalResources)}
            </p>
          )}
          <p className="text-sm">
            <span className="font-medium text-green-700">Presupuesto Asignado:</span> {formatCurrency(data.facultyBudget)}
          </p>
          <p className="text-sm">
            <span className="font-medium text-green-700">Presupuesto No Gastado:</span> {formatCurrency(data.remainingFacultyBudget)}
          </p>
          <p className="text-sm">
            <span className="font-medium text-green-700">Gasto Total:</span> {formatCurrency(data.totalCost)}
          </p>
          <p className="text-sm">
            <span className="font-medium text-green-700">Gasto Eventos Aprobados:</span> {formatCurrency(data.totalApprovedEventsCost)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-green-700">Costos Totales por Facultad</CardTitle>
          <CardDescription className="text-green-600">Plan Operativo Anual (POA) - Universidad Mesoamericana</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <RadioGroup
              defaultValue="withoutAdditional"
              onValueChange={(value) => setIncludeAdditionalResources(value === "withAdditional")}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="withoutAdditional" id="withoutAdditional" />
                <Label htmlFor="withoutAdditional">Sin recursos adicionales</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="withAdditional" id="withAdditional" />
                <Label htmlFor="withAdditional">Con recursos adicionales</Label>
              </div>
            </RadioGroup>
          </div>

          {loading && (
            <div className="flex justify-center items-center h-full">
              <p>Cargando datos...</p>
            </div>
          )}
          
          {!loading && !error && (
            <div className="h-[450px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredData}
                  margin={{ top: 20, right: 30, left: 65, bottom: 60 }}
                  barSize={30}
                  maxBarSize={50}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(142, 76%, 90%)" />
                  <XAxis
                    dataKey="facultyname"
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    tick={{ fill: "hsl(142, 76%, 36%)", fontSize: getTickFontSize() }}
                    tickMargin={10}
                  />
                  <YAxis
                    tickFormatter={formatCurrency}
                    tick={{ fill: "hsl(142, 76%, 36%)", fontSize: getTickFontSize() }}
                    stroke="hsl(142, 76%, 36%)"
                    axisLine={{ stroke: "hsl(142, 76%, 36%)" }}
                    tickLine={{ stroke: "hsl(142, 76%, 36%)" }}
                    label={{
                      value: 'Costo Total (Q)',
                      angle: -90,
                      position: 'insideLeft',
                      fill: "hsl(142, 76%, 36%)",
                      offset: -50,
                      style: {
                        textAnchor: 'middle'
                      }
                    }}
                  />
                  <Tooltip content={({ active, payload }) => getTooltipContent(payload, '', !!active)} />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    wrapperStyle={{ paddingTop: '10px' }}
                  />
                  <Bar
                    dataKey="umesContribution"
                    stackId="a"
                    fill="#004D40"
                    name="Contribución UMES"
                  />
                  <Bar
                    dataKey="otherContributions"
                    stackId="a"
                    fill="#D32F2F"
                    name="Otras Contribuciones"
                  />
                  {includeAdditionalResources && (
                    <Bar
                      dataKey="additionalResources"
                      stackId="a"
                      fill="#1976D2"
                      name="Recursos Adicionales"
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
