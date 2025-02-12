"use client"

import { useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, LabelList } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const fullData = [
  { facultad: "Ingeniería", planificados: 200, ejecutados: 145, finalizados: 120 },
  { facultad: "Ciencias", planificados: 180, ejecutados: 120, finalizados: 100 },
  { facultad: "Humanidades", planificados: 150, ejecutados: 90, finalizados: 75 },
  { facultad: "Medicina", planificados: 220, ejecutados: 180, finalizados: 160 },
  { facultad: "Derecho", planificados: 160, ejecutados: 110, finalizados: 95 },
  { facultad: "Economía", planificados: 190, ejecutados: 130, finalizados: 115 },
]

export default function GraficoAlcanceEventosPorFacultad() {
  const [viewMode, setViewMode] = useState("group")
  const [selectedFacultad, setSelectedFacultad] = useState("todas")

  const filteredData =
    selectedFacultad === "todas" ? fullData : fullData.filter((item) => item.facultad === selectedFacultad)

  const totals = fullData.reduce(
    (acc, curr) => ({
      planificados: acc.planificados + curr.planificados,
      ejecutados: acc.ejecutados + curr.ejecutados,
      finalizados: acc.finalizados + curr.finalizados,
    }),
    { planificados: 0, ejecutados: 0, finalizados: 0 },
  )

  const renderCustomizedLabel = (props: { x: number; y: number; width: number; height: number; value: number; viewMode: string }) => {
    const { x, y, width, height, value, viewMode } = props
    const radius = 10
    const fontSize = 12

    return (
      <g>
        <text
          x={x + width / 2}
          y={viewMode === "stack" ? y + height / 2 : y - radius}
          fill="#000"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={fontSize}
        >
          {value}
        </text>
      </g>
    )
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Alcance de Eventos por Facultad</CardTitle>
        <CardDescription>Análisis detallado de eventos planificados, ejecutados y finalizados</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-6">
          <Select value={selectedFacultad} onValueChange={setSelectedFacultad}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Seleccionar facultad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las facultades</SelectItem>
              {fullData.map((item) => (
                <SelectItem key={item.facultad} value={item.facultad}>
                  {item.facultad}
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
          <StatCard title="Planificados" value={totals.planificados} color="bg-blue-100 text-blue-800" />
          <StatCard title="Ejecutados" value={totals.ejecutados} color="bg-yellow-100 text-yellow-800" />
          <StatCard title="Finalizados" value={totals.finalizados} color="bg-green-100 text-green-800" />
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
            >
              <XAxis dataKey="facultad" interval={0} angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="planificados"
                stackId={viewMode === "stack" ? "a" : undefined}
                fill="hsl(210, 79%, 46%)"
                name="Planificados"
              >
                <LabelList dataKey="planificados" content={(props) => renderCustomizedLabel({ ...props, viewMode } as { x: number; y: number; width: number; height: number; value: number; viewMode: string })} />
              </Bar>
              <Bar
                dataKey="ejecutados"
                stackId={viewMode === "stack" ? "a" : undefined}
                fill="hsl(45, 93%, 47%)"
                name="Ejecutados"
              >
                <LabelList dataKey="ejecutados" content={(props) => renderCustomizedLabel({ ...props, viewMode } as { x: number; y: number; width: number; height: number; value: number; viewMode: string })} />
              </Bar>
              <Bar
                dataKey="finalizados"
                stackId={viewMode === "stack" ? "a" : undefined}
                fill="hsl(142, 76%, 36%)"
                name="Finalizados"
              >
                <LabelList dataKey="finalizados" content={(props) => renderCustomizedLabel({ ...props, viewMode } as { x: number; y: number; width: number; height: number; value: number; viewMode: string })} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

interface StatCardProps {
  title: string;
  value: number;
  color: string;
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
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-md">
        <h3 className="font-bold text-lg mb-2">{data.facultad}</h3>
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

