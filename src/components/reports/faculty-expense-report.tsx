"use client"

import { useState, useRef, useEffect } from "react"
import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ChartDataLabels from "chartjs-plugin-datalabels"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels)

interface FacultyExpense {
  name: string
  planned: number
  actual: number
}

const FacultyExpenseReport = () => {
  const [isSorted, setIsSorted] = useState(false)
  const [selectedFaculty, setSelectedFaculty] = useState<string | null>(null)
  const chartRef = useRef<ChartJS<"bar">>(null)

  const originalData: FacultyExpense[] = [
    { name: "Ingeniería", planned: 500000, actual: 480000 },
    { name: "Medicina", planned: 600000, actual: 620000 },
    { name: "Derecho", planned: 400000, actual: 390000 },
    { name: "Economía", planned: 350000, actual: 340000 },
    { name: "Ciencias", planned: 450000, actual: 460000 },
  ]

  const sortedData = [...originalData].sort((a, b) => {
    const deviationA = (a.actual - a.planned) / a.planned
    const deviationB = (b.actual - b.planned) / b.planned

    if (deviationA < 0 && deviationB >= 0) return -1
    if (deviationA >= 0 && deviationB < 0) return 1
    if (deviationA < 0 && deviationB < 0) return Math.abs(deviationB) - Math.abs(deviationA)
    return 0
  })

  const currentData = isSorted ? sortedData : originalData

  const filteredData = selectedFaculty ? currentData.filter((faculty) => faculty.name === selectedFaculty) : currentData

  const chartData = {
    labels: filteredData.map((faculty) => faculty.name),
    datasets: [
      {
        label: "Gastos Planificados",
        data: filteredData.map((faculty) => faculty.planned),
        backgroundColor: "rgba(53, 162, 235, 0.7)",
        borderColor: "rgba(53, 162, 235, 1)",
        borderWidth: 1,
      },
      {
        label: "Gastos Reales",
        data: filteredData.map((faculty) => faculty.actual),
        backgroundColor: "rgba(75, 192, 192, 0.7)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
      {
        label: "Diferencia",
        data: filteredData.map((faculty) => faculty.actual - faculty.planned),
        backgroundColor: filteredData.map((faculty) =>
          faculty.actual > faculty.planned ? "rgba(255, 99, 132, 0.7)" : "rgba(75, 192, 192, 0.7)",
        ),
        borderColor: filteredData.map((faculty) =>
          faculty.actual > faculty.planned ? "rgba(255, 99, 132, 1)" : "rgba(75, 192, 192, 1)",
        ),
        borderWidth: 1,
      },
    ],
  }

  const formatCurrency = (value: number) => {
    return `Q${value.toLocaleString()}`
  }

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
          callback: (value: number) => formatCurrency(value),
        },
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Reporte de Gastos por Facultad",
        font: {
          size: 18,
          weight: "bold" as const,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const datasetIndex = context.datasetIndex
            const dataIndex = context.dataIndex
            const value = context.dataset.data[dataIndex]
            const planned = chartData.datasets[0].data[dataIndex]
            const actual = chartData.datasets[1].data[dataIndex]

            if (datasetIndex === 0) {
              return `Gasto Planificado: ${formatCurrency(value)}`
            } else if (datasetIndex === 1) {
              const percentage = ((actual / planned) * 100).toFixed(2)
              return [`Gasto Real: ${formatCurrency(value)}`, `Porcentaje del planificado: ${percentage}%`]
            } else if (datasetIndex === 2) {
              const differenceText = value > 0 ? "Exceso" : "Ahorro"
              const differencePercentage = ((Math.abs(value) / planned) * 100).toFixed(2)
              return [
                `${differenceText}: ${formatCurrency(Math.abs(value))}`,
                `Porcentaje de diferencia: ${differencePercentage}%`,
              ]
            }
          },
        },
      },
      datalabels: {
        anchor: "end",
        align: "top",
        offset: 5,
        formatter: (value: number, context: any) => {
          const datasetIndex = context.datasetIndex

          if (datasetIndex === 2) {
            const differenceText = value > 0 ? "Exceso" : "Ahorro"
            return `${differenceText}\n${formatCurrency(Math.abs(value))}`
          }

          return formatCurrency(value)
        },
        font: {
          weight: "bold",
          size: 10,
        },
        color: (context: any) => {
          const datasetIndex = context.datasetIndex
          const value = context.dataset.data[context.dataIndex]
          if (datasetIndex === 2) {
            return value > 0 ? "rgba(255, 99, 132, 1)" : "rgba(75, 192, 192, 1)"
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
  }, [])

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Reporte de Gastos por Facultad</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <Select value={selectedFaculty || ""} onValueChange={setSelectedFaculty}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Seleccionar facultad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las facultades</SelectItem>
              {originalData.map((faculty) => (
                <SelectItem key={faculty.name} value={faculty.name}>
                  {faculty.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={toggleSort} variant="outline">
            {isSorted ? "Mostrar orden original" : "Ordenar por cumplimiento de presupuesto"}
          </Button>
        </div>
        <div className="h-[500px]">
          <Bar ref={chartRef} data={chartData} options={options} plugins={[ChartDataLabels]} />
        </div>
      </CardContent>
    </Card>
  )
}

export default FacultyExpenseReport

