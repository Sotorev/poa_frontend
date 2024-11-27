"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts" // Importa los componentes necesarios de la biblioteca Recharts para crear gráficos de barras
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card" // Importa los componentes de la interfaz de usuario personalizados para construir la tarjeta

// Datos mockeados de las facultades con aportes
const facultyData = [
  { faculty: "Ingeniería", umesContribution: 300000, otherContributions: 200000 },
  { faculty: "Medicina", umesContribution: 450000, otherContributions: 300000 },
  { faculty: "Derecho", umesContribution: 200000, otherContributions: 100000 },
  { faculty: "Economía", umesContribution: 250000, otherContributions: 200000 },
  { faculty: "Humanidades", umesContribution: 150000, otherContributions: 100000 },
  { faculty: "Arquitectura", umesContribution: 250000, otherContributions: 150000 },
]

// Componente principal que muestra los costos por facultad
/**
 * Componente CostByFaculty
 *
 * Renderiza una tarjeta que muestra los costos operativos totales por facultad para el Plan Operativo Anual (POA) de la Universidad Mesoamericana.
 * Utiliza un gráfico de barras para visualizar los datos, formateando valores en Quetzales (Q) y proporcionando tooltips interactivos para información detallada.
 *
 * @returns Un elemento JSX que representa el componente CostByFaculty.
 */
export default function CostByFaculty() {
  /**
   * Formatea un valor numérico a una cadena de texto representando una cantidad en quetzales.
   * @param value - El valor numérico a formatear.
   * @returns Una cadena de texto con el formato de moneda.
   */
  const formatCurrency = (value: number) => `Q${value.toLocaleString()}`

  return (
    <div className="flex items-center justify-center w-full">
      <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle className="text-green-700">Costos Totales por Facultad</CardTitle>
        <CardDescription className="text-green-600">Plan Operativo Anual (POA) - Universidad Mesoamericana</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[450px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={facultyData}
              margin={{ top: 20, right: 30, left: 65, bottom: 60 }}
              barSize={30}
              maxBarSize={50}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(142, 76%, 90%)" />
              <XAxis
                dataKey="faculty"
                tick={{ fill: "hsl(142, 76%, 36%)" }}
                tickLine={{ stroke: "hsl(142, 76%, 36%)" }}
                axisLine={{ stroke: "hsl(142, 76%, 36%)" }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                tickFormatter={formatCurrency}
                tick={{ fill: "hsl(142, 76%, 36%)" }}
                tickLine={{ stroke: "hsl(142, 76%, 36%)" }}
                axisLine={{ stroke: "hsl(142, 76%, 36%)" }}
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
              <Tooltip
                formatter={formatCurrency}
                cursor={{ fill: "hsl(142, 76%, 90%)" }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border border-green-300 bg-green-50 p-2 shadow-sm">
                        <p className="font-bold text-green-800">{label}</p>
                        {payload.map((entry, index) => (
                          <p key={index} className="text-sm">
                            <span className="font-medium" style={{ color: entry.color }}>
                              {entry.name === "UMES Contribution" ? "Contribución UMES" : "Otras Contribuciones"}:
                            </span>{' '}
                            {formatCurrency(entry.value ?? 0)}
                          </p>
                        ))}
                        <p className="text-sm font-medium text-green-800">
                          Total: {formatCurrency(payload.reduce((sum, entry) => sum + (entry.value ?? 0), 0))}
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                wrapperStyle={{ paddingTop: '10px' }}
              />
              <Bar dataKey="umesContribution" stackId="a" fill="hsl(142, 76%, 36%)" name="Contribución UMES" />
              <Bar dataKey="otherContributions" stackId="a" fill="hsl(142, 50%, 60%)" name="Otras Contribuciones" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      </Card>
    </div>
  )
}