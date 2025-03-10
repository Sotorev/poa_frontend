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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ChartDataLabels from "chartjs-plugin-datalabels"
import { useCurrentUser } from "@/hooks/use-current-user"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels)

interface FacultyExpense {
  facultyId: number
  name: string
  expectedCost: number
  actualCost: number
  diff: number
  percentage: number
}

export default function FacultyExpenseReport() {
  const user = useCurrentUser() 
  const [data, setData] = useState<FacultyExpense[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isSorted, setIsSorted] = useState(false)
  const [selectedFaculty, setSelectedFaculty] = useState<string | null>(null)
  const chartRef = useRef<ChartJS<"bar">>(null)
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  // Conexión a la API para obtener los datos de costos
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await fetch(`${API_URL}/api/reports/event/costs`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${user?.token}`
          }
        })
        if (!response.ok) {
          throw new Error("Error al obtener los datos de costos")
        }
        const responseData: FacultyExpense[] = await response.json()
        setData(responseData)
      } catch (err: any) {
        setError(err.message || "Error desconocido")
      }
      setLoading(false)
    }
    fetchData()
  }, [API_URL, user?.token])

  // Ordenar los datos (por ejemplo, por porcentaje de cumplimiento)
  const sortedData = [...data].sort((a, b) => b.percentage - a.percentage)
  const currentData = isSorted ? sortedData : data

  // Filtrar por facultad si se selecciona alguna
  const filteredData = selectedFaculty
    ? currentData.filter((faculty) => faculty.name === selectedFaculty)
    : currentData

  // Se recalcula la diferencia: (gasto real - gasto planificado)
  const chartData = {
    labels: filteredData.map((faculty) => faculty.name),
    datasets: [
      {
        label: "Gasto Planificado",
        data: filteredData.map((faculty) => faculty.expectedCost),
        backgroundColor: "rgba(53, 162, 235, 0.7)",
        borderColor: "rgba(53, 162, 235, 1)",
        borderWidth: 1,
      },
      {
        label: "Gasto Real",
        data: filteredData.map((faculty) => faculty.actualCost),
        backgroundColor: "rgba(75, 192, 192, 0.7)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
      {
        label: "Diferencia",
        data: filteredData.map((faculty) =>
          Math.abs(faculty.actualCost - faculty.expectedCost)
        ),
        backgroundColor: filteredData.map((faculty) =>
          faculty.actualCost > faculty.expectedCost
            ? "rgba(255, 99, 132, 0.7)" // Exceso
            : "rgba(75, 192, 192, 0.7)"   // Ahorro
        ),
        borderColor: filteredData.map((faculty) =>
          faculty.actualCost > faculty.expectedCost
            ? "rgba(255, 99, 132, 1)"
            : "rgba(75, 192, 192, 1)"
        ),
        borderWidth: 1,
      }
    ]
  }

  const formatCurrency = (value: number) => `Q${value.toLocaleString()}`

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (tickValue: string | number) {
            return formatCurrency(Number(tickValue))
          },
        },
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        mode: "index" as const,
        intersect: true,
        displayColors: false,
        filter: (tooltipItem: any) => tooltipItem.datasetIndex === 0,
        callbacks: {
          title: (tooltipItems: any) => {
            if (!tooltipItems || !tooltipItems.length) return "";
            const index = tooltipItems[0].dataIndex;
            return filteredData?.[index]?.name || "";
          },
          label: (tooltipItem: any) => {
            const index = tooltipItem.dataIndex;
            if (index === undefined || !filteredData[index]) return "";
            const faculty = filteredData[index];
            const planned = faculty.expectedCost;
            const real = faculty.actualCost;
            const diff = real - planned;
            const diffLabel =
              diff > 0
                ? `Exceso: ${formatCurrency(Math.abs(diff))}`
                : `Ahorro: ${formatCurrency(Math.abs(diff))}`;
            // Se retornan los datos agregados en líneas separadas
            return [
              `Gasto planificado: ${formatCurrency(planned)}`,
              `Gasto real: ${formatCurrency(real)}`,
              diffLabel,
              `Porcentaje usado de planificacion: ${faculty.percentage}%`
            ];
          },
        },
        backgroundColor: "white",
        titleColor: "#000",
        bodyColor: "#000",
        titleFont: {
          size: 16, // Tamaño de letra mayor para el título
        },
        bodyFont: {
          size: 14, // Tamaño de letra mayor para el contenido
        },
      },
      datalabels: {
        anchor: "end" as const,
        align: "top" as const,
        offset: 5,
        formatter: (value: number, context: any) => {
          const diff = filteredData[context.dataIndex].actualCost - filteredData[context.dataIndex].expectedCost
          if (context.datasetIndex === 2) {
            if (diff > 0) {
              return `Exceso\n${formatCurrency(Math.abs(diff))}`
            } else {
              return `Ahorro\n${formatCurrency(Math.abs(diff))}`
            }
          }
          return formatCurrency(value)
        },
        font: {
          weight: "bold" as const,
          size: 10,
        },
        color: (context: any) => {
          const diff = filteredData[context.dataIndex].actualCost - filteredData[context.dataIndex].expectedCost
          if (context.datasetIndex === 2) {
            return diff > 0 ? "rgba(255, 99, 132, 1)" : "rgba(75, 192, 192, 1)"
          }
          return "black"
        },
      },
    },
    barPercentage: 0.8,
    categoryPercentage: 0.9,
  }

  const toggleSort = () => {
    setIsSorted(!isSorted)
  }

  useEffect(() => {
    const chart = chartRef.current
    if (chart) {
      chart.update()
    }
  }, [data, isSorted, selectedFaculty])

  return (
    <Card className="w-full max-w-7xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Reporte de Gastos por Facultad</CardTitle>
      </CardHeader>
      <CardDescription className="text-center"> Comparación de gastos planificados y reales por facultad.</CardDescription> 
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <Select value={selectedFaculty || ""} onValueChange={setSelectedFaculty}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Seleccionar facultad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las facultades</SelectItem>
              {data.map((faculty) => (
                <SelectItem key={faculty.facultyId} value={faculty.name}>
                  {faculty.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={toggleSort} variant="outline">
            {isSorted ? "Mostrar orden original" : "Ordenar por cumplimiento de presupuesto"}
          </Button>
        </div>
        <div className="h-[600px]">
          <Bar ref={chartRef} data={chartData} options={options} plugins={[ChartDataLabels]} />
        </div>
      </CardContent>
    </Card>
  )
}