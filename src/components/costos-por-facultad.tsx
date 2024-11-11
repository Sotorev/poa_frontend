"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const datosFacultades = [
  { facultad: "Ingeniería", costo: 500000 },
  { facultad: "Medicina", costo: 750000 },
  { facultad: "Derecho", costo: 300000 },
  { facultad: "Ciencias Económicas", costo: 450000 },
  { facultad: "Humanidades", costo: 250000 },
  { facultad: "Arquitectura", costo: 400000 },
]

export function CostosPorFacultad() {
  const CustomBar = (props: any) => {
    const { x, y, width, height, value } = props
    return (
      <g>
        <rect x={x} y={y} width={width} height={height} fill="hsl(142, 76%, 36%)" rx={4} />
        <text
          x={x + width / 2}
          y={y - 10}
          fill="hsl(142, 76%, 36%)"
          textAnchor="middle"
          dominantBaseline="bottom"
          fontSize="12"
          className="font-medium"
        >
          {`Q${value.toLocaleString()}`}
        </text>
      </g>
    )
  }

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle className="text-green-700">Costos Totales por Facultad</CardTitle>
        <CardDescription className="text-green-600">Planificación Operativa Anual (POA) - Universidad Mesoamericana</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[450px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={datosFacultades}
              margin={{ top: 40, right: 30, left: 65, bottom: 20 }}
              barSize={30}
              maxBarSize={50}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(142, 76%, 90%)" />
              <XAxis
                dataKey="facultad"
                tick={{ fill: "hsl(142, 76%, 36%)" }}
                tickLine={{ stroke: "hsl(142, 76%, 36%)" }}
                axisLine={{ stroke: "hsl(142, 76%, 36%)" }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tickFormatter={(value) => `Q${value.toLocaleString()}`}
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
                cursor={{ fill: "hsl(142, 76%, 90%)" }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border border-green-300 bg-green-50 p-2 shadow-sm">
                        <div className="grid gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-green-700">
                              Facultad
                            </span>
                            <span className="font-bold text-green-800">
                              {label}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-green-700">
                              Costo
                            </span>
                            <span className="font-bold text-green-800">
                              Q{payload[0].value.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar
                dataKey="costo"
                shape={<CustomBar />}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}