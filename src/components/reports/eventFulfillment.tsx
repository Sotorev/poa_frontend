"use client"

import { useState, useRef, useEffect } from "react"
import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import ChartDataLabels from "chartjs-plugin-datalabels"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels)

interface FacultyData {
  name: string
  planned: number
  finished: number
}

const ComplianceReportChart = () => {
  const [isSorted, setIsSorted] = useState(false)
  const [isStacked, setIsStacked] = useState(false)
  const [selectedFaculty, setSelectedFaculty] = useState<string | null>(null)
  const chartRef = useRef<ChartJS<"bar">>(null)

  const originalData: FacultyData[] = [
    { name: "Ingeniería", planned: 50, finished: 45 },
    { name: "Medicina", planned: 40, finished: 35 },
    { name: "Derecho", planned: 30, finished: 28 },
    { name: "Economía", planned: 35, finished: 30 },
    { name: "Ciencias", planned: 45, finished: 40 },
  ]

  const sortedData = [...originalData].sort((a, b) => b.finished / b.planned - a.finished / a.planned)

  const currentData = isSorted ? sortedData : originalData

  const filteredData = selectedFaculty ? currentData.filter((faculty) => faculty.name === selectedFaculty) : currentData

  const chartData = {
    labels: filteredData.map((faculty) => faculty.name),
    datasets: [
      {
        label: "Eventos Planificados",
        data: filteredData.map((faculty) => faculty.planned),
        backgroundColor: "rgba(53, 162, 235, 0.7)",
        borderColor: "rgba(53, 162, 235, 1)",
        borderWidth: 1,
      },
      {
        label: "Eventos Finalizados",
        data: filteredData.map((faculty) => faculty.finished),
        backgroundColor: "rgba(75, 192, 192, 0.7)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: isStacked,
      },
      y: {
        stacked: isStacked,
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Reporte de Cumplimiento por Facultad",
        font: {
          size: 18,
          weight: "bold",
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const datasetIndex = context.datasetIndex
            const dataIndex = context.dataIndex
            const value = context.dataset.data[dataIndex]
            const total = chartData.datasets[0].data[dataIndex]
            const percentage = ((datasetIndex === 1 ? value / total : 1) * 100).toFixed(1)
            return `${context.dataset.label}: ${value} (${percentage}%)`
          },
        },
      },
      datalabels: {
        anchor: "end",
        align: "top",
        formatter: (value: number, context: any) => {
          const datasetIndex = context.datasetIndex
          const total = chartData.datasets[0].data[context.dataIndex]
          const percentage = ((datasetIndex === 1 ? value / total : 1) * 100).toFixed(1)
          return `${value} (${percentage}%)`
        },
        font: {
          weight: "bold",
        },
      },
    },
  }

  const toggleSort = () => {
    setIsSorted(!isSorted)
  }

  const toggleStacked = () => {
    setIsStacked(!isStacked)
  }

  useEffect(() => {
    const chart = chartRef.current

    if (chart) {
      chart.update()
    }
  }, [selectedFaculty, isSorted, isStacked]) //Corrected useEffect dependencies

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Reporte de Cumplimiento por Facultad</CardTitle>
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

