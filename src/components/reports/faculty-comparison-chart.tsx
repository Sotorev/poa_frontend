"use client"

import { useState, useMemo, useEffect } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Users } from "lucide-react"

interface FacultyData {
  facultyId: number;
  facultyName: string;
  totalStudents: number;
  totalBudget: number;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" }).format(value)

const formatNumber = (value: number) => new Intl.NumberFormat("es-GT").format(value)

async function fetchFacultyData(apiUrl: string): Promise<FacultyData[]> {
  const response = await fetch(`${apiUrl}/api/reports/faculty/faculty-report/`)
  if (!response.ok) {
    throw new Error("Error fetching data")
  }
  return response.json()
}

export default function FacultyComparisonChart() {
  const [data, setData] = useState<FacultyData[]>([])
  const [sortBy, setSortBy] = useState<"totalBudget" | "totalStudents">("totalBudget")
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3010"

  useEffect(() => {
    fetchFacultyData(API_URL)
      .then((fetchedData) => setData(fetchedData))
      .catch((error) => console.error("Error fetching data:", error))
  }, [API_URL])

  const sortedData = useMemo(() => [...data].sort((a, b) => b[sortBy] - a[sortBy]), [data, sortBy])
  const totalBudget = useMemo(() => data.reduce((sum, faculty) => sum + faculty.totalBudget, 0), [data])
  const totalStudents = useMemo(() => data.reduce((sum, faculty) => sum + faculty.totalStudents, 0), [data])

  return (
    <Card className="w-full shadow-md bg-white">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-center text-gray-800">
          Comparación de Facultades
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="bg-green-50 border border-green-200">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium text-green-700">Presupuesto Total</p>
                <p className="text-2xl font-semibold text-green-800">
                  {formatCurrency(totalBudget)}
                </p>
              </div>
              <DollarSign size={30} className="text-green-500" />
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border border-blue-200">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium text-blue-700">Total de Estudiantes</p>
                <p className="text-2xl font-semibold text-blue-800">
                  {formatNumber(totalStudents)}
                </p>
              </div>
              <Users size={30} className="text-blue-500" />
            </CardContent>
          </Card>
        </div>
        <div className="flex justify-center space-x-4 mb-6">
          <Button
            variant={sortBy === "totalBudget" ? "default" : "outline"}
            onClick={() => setSortBy("totalBudget")}
            className="transition-colors duration-200 bg-green-200 hover:bg-green-300 text-green-800"
          >
            Ordenar por Presupuesto
          </Button>
          <Button
            variant={sortBy === "totalStudents" ? "default" : "outline"}
            onClick={() => setSortBy("totalStudents")}
            className="transition-colors duration-200 bg-blue-200 hover:bg-blue-300 text-blue-800"
          >
            Ordenar por Estudiantes
          </Button>
        </div>
        <ResponsiveContainer width="100%" height={600}>
          <BarChart
            data={sortedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 200 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="facultyName"
              angle={-45}
              tick={{ fill: "#4b5563", textAnchor: "end", fontSize: 12 }}
            />
            <YAxis yAxisId="left" orientation="left" stroke="#34d399" tick={{ fill: "#4b5563" }} />
            <YAxis yAxisId="right" orientation="right" stroke="#60a5fa" tick={{ fill: "#4b5563" }} />
            <Tooltip
              formatter={(value, name) => {
                if (name === "Presupuesto") return formatCurrency(value as number)
                return formatNumber(value as number)
              }}
              contentStyle={{ backgroundColor: "#f0f9ff", border: "1px solid #e0f2fe" }}
            />
            <Bar yAxisId="left" dataKey="totalBudget" fill="#34d399" name="Presupuesto" />
            <Bar yAxisId="right" dataKey="totalStudents" fill="#60a5fa" name="Estudiantes" />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex justify-center space-x-4 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: "#34d399" }} />
            <span className="text-sm text-gray-700">Presupuesto</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: "#60a5fa" }} />
            <span className="text-sm text-gray-700">Estudiantes</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}