"use client"

import { useState, useEffect } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { facultades, ods, dataODS } from '../mock/odsData'

export default function GraficoODS() {
  const [facultadSeleccionada, setFacultadSeleccionada] = useState("Todas")
  const [chartWidth, setChartWidth] = useState(0)
  const [dataFiltrada, setDataFiltrada] = useState<{objetivo: string; eventos: number; nombre: string; color: string;}[]>([])

  useEffect(() => {
    const updateWidth = () => {
      setChartWidth(window.innerWidth)
    }
    
    window.addEventListener('resize', updateWidth)
    updateWidth()
    
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  useEffect(() => {
    if (ods && dataODS) {
      const newData = facultadSeleccionada === "Todas"
        ? ods.map((objetivo, index) => ({
            objetivo: `ODS ${objetivo.numero}`,
            eventos: dataODS.reduce((sum, facultad) => sum + facultad.eventos[index], 0),
            nombre: objetivo.nombre,
            color: objetivo.color
          }))
        : ods.map((objetivo, index) => ({
            objetivo: `ODS ${objetivo.numero}`,
            eventos: dataODS.find(f => f.facultad === facultadSeleccionada)?.eventos[index] || 0,
            nombre: objetivo.nombre,
            color: objetivo.color
          }))
      setDataFiltrada(newData)
    }
  }, [facultadSeleccionada])

  const getTickFontSize = () => {
    if (chartWidth < 480) return 10
    if (chartWidth < 768) return 11
    return 12
  }

  const getChartHeight = () => {
    if (chartWidth < 480) return 400
    if (chartWidth < 768) return 500
    return 600
  }

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader className="space-y-2">
        <CardTitle className="text-xl sm:text-2xl text-center">
          Cantidad de eventos por Objetivo de Desarrollo Sostenible (ODS)
        </CardTitle>
        <CardDescription className="text-sm sm:text-base text-center">
          {facultadSeleccionada === "Todas"
            ? <>Aporte total de <span className="text-[#004D40] font-semibold">todas las facultades</span> en la Distribución de eventos del POA por ODS</>
            : <>Distribución de eventos del POA por ODS para la Facultad de <span className="text-[#004D40] font-semibold">{facultadSeleccionada}</span></>}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        <div className="mb-6 flex justify-start">
          <Select onValueChange={setFacultadSeleccionada} defaultValue="Todas">
            <SelectTrigger className="w-full sm:w-[200px] text-[#004D40] font-semibold">
              <SelectValue placeholder="Seleccionar Facultad" />
            </SelectTrigger>
            <SelectContent>
              {facultades.map((facultad) => (
                <SelectItem 
                  key={facultad} 
                  value={facultad} 
                  className={`font-semibold ${facultad === "Todas" ? "text-[#004D40]" : ""}`}
                >
                  {facultad}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full" style={{ height: getChartHeight() }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dataFiltrada}
              margin={{
                top: 20,
                right: chartWidth < 768 ? 10 : 30,
                left: chartWidth < 768 ? 10 : 20,
                bottom: chartWidth < 768 ? 120 : 100
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="objetivo"
                angle={-45}
                textAnchor="end"
                interval={0}
                height={100}
                tick={{ fontSize: getTickFontSize() }}
                tickMargin={10}
              />
              <YAxis
                tick={{ fontSize: getTickFontSize() }}
                width={chartWidth < 768 ? 30 : 40}
              />
              <Tooltip
                cursor={{ fill: 'transparent' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-2 border rounded shadow">
                        <p className="font-semibold">{payload[0].payload.nombre}</p>
                        <p>Eventos: {payload[0].value}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="eventos"
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
                label={{ 
                  position: 'top', 
                  fill: "hsl(var(--foreground))",
                  fontSize: 14 
                }}
              >
                {dataFiltrada.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

