"use client"

import { useState, useEffect } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { facultades, objetivosEstrategicos, dataPOA } from '../mock/poaData'

export default function GraficoPOA() {
  const [facultadSeleccionada, setFacultadSeleccionada] = useState("Todas")
  const [chartWidth, setChartWidth] = useState(0)
  const [dataFiltrada, setDataFiltrada] = useState<{ objetivo: string; eventos: number; }[]>([])

  useEffect(() => {
    const updateWidth = () => {
      setChartWidth(window.innerWidth)
    }
    
    window.addEventListener('resize', updateWidth)
    updateWidth()
    
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  useEffect(() => {
    if (objetivosEstrategicos && dataPOA) {
      const newData = facultadSeleccionada === "Todas"
        ? objetivosEstrategicos.map((objetivo, index) => ({
            objetivo,
            eventos: dataPOA.reduce((sum, facultad) => sum + facultad.eventos[index], 0)
          }))
        : objetivosEstrategicos.map((objetivo, index) => ({
            objetivo,
            eventos: dataPOA.find(f => f.facultad === facultadSeleccionada)?.eventos[index] || 0
          }))
      setDataFiltrada(newData)
    }
  }, [facultadSeleccionada])

  const getTickFontSize = () => {
    if (chartWidth < 480) return 10;
    if (chartWidth < 768) return 11;
    return 12;
  }

  const getChartHeight = () => {
    if (chartWidth < 480) return 300
    if (chartWidth < 768) return 400
    return 500
  }

  const colores = [
    "#004D40", // Verde UMES
    "#D32F2F", // Rojo
    "#1976D2", // Azul
    "#FFA000", // Ámbar
    "#7B1FA2", // Púrpura
    "#388E3C", // Verde
    "#0097A7"  // Cian
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Cantidad de eventos por Objetivo Estratégico
        </CardTitle>
        <CardDescription className="text-center">
          {facultadSeleccionada === "Todas"
            ? <>Aporte total de <span className="text-[#004D40] font-semibold">todas las facultades</span> en la Distribución de eventos del POA por objetivo estratégico</>
            : <>Distribución de eventos del POA por objetivo estratégico para la Facultad de <span className="text-[#004D40] font-semibold">{facultadSeleccionada}</span></>}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        <div className="mb-6 flex justify-start">
          <Select onValueChange={setFacultadSeleccionada} defaultValue="Todas">
            <SelectTrigger className="w-[200px] text-[#004D40] font-semibold">
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
              margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
              barSize={chartWidth < 768 ? 20 : 40}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(142, 60%, 92%)" />
              <XAxis
                dataKey="objetivo"
                angle={-45}
                textAnchor="end"
                interval={0}
                height={100}
                tick={{ fontSize: getTickFontSize(), fill: "hsl(var(--foreground))" }}
                tickMargin={10}
                stroke="hsl(var(--muted))"
              />
              <YAxis 
                tick={{ fontSize: getTickFontSize(), fill: "hsl(var(--foreground))" }} 
                stroke="hsl(var(--muted))"
              />
              <Tooltip
                cursor={{ fill: 'transparent' }}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                  boxShadow: "var(--shadow)"
                }}
                labelStyle={{ color: "hsl(var(--foreground))", fontWeight: "bold" }}
                itemStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Bar 
                dataKey="eventos" 
                radius={[4, 4, 0, 0]}
                label={{ 
                  position: 'top', 
                  fill: "hsl(var(--foreground))",
                  fontSize: 14 
                }} 
              >
                {dataFiltrada.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colores[index]} fillOpacity={1} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

