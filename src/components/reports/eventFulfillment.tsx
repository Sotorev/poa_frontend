"use client"

import { useState, useRef, useEffect } from "react"
import { Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import ChartDataLabels from "chartjs-plugin-datalabels"
import { useCurrentUser } from "@/hooks/use-current-user"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
)

interface ComplianceData {
  facultyId: number
  name: string
  totalEvents: number
  statusData: {
    name: string
    count: number
    percentage: number
  }[]
}

const ComplianceReportChart = () => {
  // Estados para controlar la vista y filtros
  const [data, setData] = useState<ComplianceData[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFaculty, setSelectedFaculty] = useState<string>("all")
  const [isSorted, setIsSorted] = useState(false)
  const [isStacked, setIsStacked] = useState(false)

  const chartRef = useRef<ChartJS<"bar">>(null)
  const user = useCurrentUser()
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  // Obtener datos de la API /api/reports/event/compliance
  useEffect(() => {
    const fetchComplianceData = async () => {
      setLoading(true)
      setError(null)
      try {
        const endpoint = `${API_URL}/api/reports/event/compliance`
        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user?.token}`
          }
        })
        if (!response.ok) {
          throw new Error("Error al obtener los datos de cumplimiento de eventos")
        }
        const responseData: ComplianceData[] = await response.json()
        setData(responseData)
      } catch (err: any) {
        setError(err.message || "Error desconocido")
      }
      setLoading(false)
    }
    if (user?.token) {
      fetchComplianceData()
    }
  }, [API_URL, user?.token])

  // Ordenar o no los datos basado en el porcentaje de cumplimiento (calculado como finished/totalEvents, en este caso usamos "Test" como finalizados)
  const sortedData = [...data].sort((a, b) => {
    const getTestValue = (item: ComplianceData) => {
      const testRecord = item.statusData.find(record => record.name === "Test")
      return testRecord ? testRecord.count / item.totalEvents : 0
    }
    return getTestValue(b) - getTestValue(a)
  })

  const currentData = isSorted ? sortedData : data

  // Filtrar por facultad si corresponde
  const filteredData =
    selectedFaculty === "all"
      ? currentData
      : currentData.filter(faculty => faculty.name === selectedFaculty)

  // Configuración de chartData para react-chartjs-2
  const chartData = {
    labels: filteredData.map(faculty => faculty.name),
    datasets: [
      {
        label: "Eventos Planificados",
        data: filteredData.map(faculty => faculty.totalEvents),
        backgroundColor: "rgba(53, 162, 235, 0.7)",
        borderColor: "rgba(53, 162, 235, 1)",
        borderWidth: 1
      },
      {
        label: "Eventos Finalizados",
        data: filteredData.map(faculty => {
          // Buscar el valor de "Test" en statusData; si no se encuentra, devuelve 0
          const testRecord = faculty.statusData.find(record => record.name === "Test")
          return testRecord ? testRecord.count : 0
        }),
        backgroundColor: "rgba(75, 192, 192, 0.7)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: isStacked,
        ticks: {
          font: {
            size: 12
          }
        },
        padding: 12
      },
      y: {
        stacked: isStacked,
        beginAtZero: true,
        ticks: {
          font: {
            size: 12
          }
        }
      }
    },
    plugins: {
      legend: {
        position: "top" as const
      },
      title: {
        display: true,
        text: "Reporte de Cumplimiento por Facultad",
        font: {
          size: 18,
          weight: 700
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const datasetLabel = context.dataset.label || ""
            const value = context.parsed.y
            if (datasetLabel === "Eventos Finalizados") {
              const total = chartData.datasets[0].data[context.dataIndex] || 1
              const percentage = ((value / total) * 100).toFixed(1)
              return `${datasetLabel}: ${value} (${percentage}%)`
            }
            return `${datasetLabel}: ${value}`
          }
        }
      },
      datalabels: {
        anchor: "end" as const,
        align: "top" as const,
        formatter: (value: number, context: any) => {
          const datasetLabel = context.dataset.label || ""
          if (datasetLabel === "Eventos Finalizados") {
            const total = chartData.datasets[0].data[context.dataIndex] || 1
            const percentage = ((value / total) * 100).toFixed(1)
            return `${value} (${percentage}%)`
          }
          return value
        },
        font: {
          weight: "bold" as const
        }
      }
    }
  }

  const toggleSort = () => setIsSorted(!isSorted)
  const toggleStacked = () => setIsStacked(!isStacked)

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.update()
    }
  }, [selectedFaculty, isSorted, isStacked, data])

  const getFacultyName = () => {
    const faculty = data.find(faculty => faculty.name === selectedFaculty)
    return faculty ? faculty.name : ""
  }

  return (
    <Card className="w-full max-w-7xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Reporte de Cumplimiento por Facultad
        </CardTitle>
        <CardDescription className="text-center">
          {selectedFaculty === "all"
            ? <>Eventos finalizados en <span className="text-[#004D40] font-semibold">todas las facultades</span> en comparación a los eventos planificados en el POA</>
            : <>Eventos finalizados en comparación a los planificados para la <span className="text-[#004D40] font-semibold">{selectedFaculty}</span></>}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Seleccionar facultad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las facultades</SelectItem>
              {data.map(faculty => (
                <SelectItem
                  key={faculty.facultyId}
                  value={faculty.name}
                >
                  {faculty.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch id="stacked-view" checked={isStacked} onCheckedChange={toggleStacked} />
              <Label htmlFor="stacked-view">Vista apilada</Label>
            </div>
            <Button onClick={toggleSort} variant="outline">
              {isSorted ? "Mostrar orden original" : "Ordenar por cumplimiento"}
            </Button>
          </div>
        </div>
        <div className="h-[400px]">
          <Bar ref={chartRef} data={chartData} options={options} plugins={[ChartDataLabels]} />
        </div>
      </CardContent>
    </Card>
  )
}

export default ComplianceReportChart