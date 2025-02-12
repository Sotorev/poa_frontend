"use client"

import { useState, useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Users } from "lucide-react"

// Datos de ejemplo - reemplazar con datos reales de tu base de datos
const data = [
  { facultad: "Ingeniería", presupuesto: 5000000, estudiantes: 2000 },
  { facultad: "Ciencias", presupuesto: 4000000, estudiantes: 1800 },
  { facultad: "Artes", presupuesto: 2000000, estudiantes: 1500 },
  { facultad: "Medicina", presupuesto: 6000000, estudiantes: 1000 },
  { facultad: "Negocios", presupuesto: 3000000, estudiantes: 2200 },
]

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" }).format(value)

const formatNumber = (value: number) => new Intl.NumberFormat("es-GT").format(value)

export default function FacultyComparisonChart() {
  const [sortBy, setSortBy] = useState<"presupuesto" | "estudiantes">("presupuesto")

  const sortedData = useMemo(() => [...data].sort((a, b) => b[sortBy] - a[sortBy]), [sortBy])

  const totalBudget = useMemo(() => data.reduce((sum, faculty) => sum + faculty.presupuesto, 0), [])

  const totalStudents = useMemo(() => data.reduce((sum, faculty) => sum + faculty.estudiantes, 0), [])

  return (
    <Card className="w-full shadow-md bg-white">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-center text-gray-800">Comparación de Facultades</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="bg-green-50 border border-green-200">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium text-green-700">Presupuesto Total</p>
                <p className="text-2xl font-semibold text-green-800">{formatCurrency(totalBudget)}</p>
              </div>
              <DollarSign size={30} className="text-green-500" />
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border border-blue-200">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium text-blue-700">Total de Estudiantes</p>
                <p className="text-2xl font-semibold text-blue-800">{formatNumber(totalStudents)}</p>
              </div>
              <Users size={30} className="text-blue-500" />
            </CardContent>
          </Card>
        </div>
        <div className="flex justify-center space-x-4 mb-6">
          <Button
            variant={sortBy === "presupuesto" ? "default" : "outline"}
            onClick={() => setSortBy("presupuesto")}
            className="transition-colors duration-200 bg-green-200 hover:bg-green-300 text-green-800"
          >
            Ordenar por Presupuesto
          </Button>
          <Button
            variant={sortBy === "estudiantes" ? "default" : "outline"}
            onClick={() => setSortBy("estudiantes")}
            className="transition-colors duration-200 bg-blue-200 hover:bg-blue-300 text-blue-800"
          >
            Ordenar por Estudiantes
          </Button>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={sortedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="facultad" tick={{ fill: "#4b5563" }} />
            <YAxis yAxisId="left" orientation="left" stroke="#34d399" tick={{ fill: "#4b5563" }} />
            <YAxis yAxisId="right" orientation="right" stroke="#60a5fa" tick={{ fill: "#4b5563" }} />
            <Tooltip
              formatter={(value, name) => {
                if (name === "Presupuesto") return formatCurrency(value as number)
                return formatNumber(value as number)
              }}
              contentStyle={{ backgroundColor: "#f0f9ff", border: "1px solid #e0f2fe" }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="presupuesto" fill="#34d399" name="Presupuesto" />
            <Bar yAxisId="right" dataKey="estudiantes" fill="#60a5fa" name="Estudiantes" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

