"use client"

import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import * as React from "react"

const datosBrutos = [
  { año: 2018, Ingeniería: 1200, Negocios: 1000, Ciencias: 800, Artes: 600, Medicina: 400 },
  { año: 2019, Ingeniería: 1300, Negocios: 950, Ciencias: 850, Artes: 580, Medicina: 420 },
  { año: 2020, Ingeniería: 1350, Negocios: 900, Ciencias: 920, Artes: 550, Medicina: 450 },
  { año: 2021, Ingeniería: 1400, Negocios: 880, Ciencias: 1000, Artes: 530, Medicina: 480 },
  { año: 2022, Ingeniería: 1450, Negocios: 850, Ciencias: 1100, Artes: 500, Medicina: 520 },
]

const calcularCrecimiento = (datos: { [key: string]: number | string }[]) => {
  const facultades = Object.keys(datos[0]).filter((key) => key !== "año")
  const datosCrecimiento = facultades.map((facultad) => {
    const crecimientoAnual = datos.slice(1).map((año, index) => {
      const añoAnterior = datos[index]
      const crecimiento = ((Number(año[facultad]) - Number(añoAnterior[facultad])) / Number(añoAnterior[facultad])) * 100
      return Number(crecimiento.toFixed(2))
    })
    const crecimientoTotal = ((Number(datos[datos.length - 1][facultad]) - Number(datos[0][facultad])) / Number(datos[0][facultad])) * 100
    return {
      facultad,
      crecimientoAnual,
      crecimientoTotal: Number(crecimientoTotal.toFixed(2)),
    }
  })

  const crecimientoAnualTotal = datos.slice(1).map((año, index) => {
    const añoAnterior = datos[index]
    const totalActual = facultades.reduce((sum, facultad) => sum + Number(año[facultad]), 0)
    const totalAnterior = facultades.reduce((sum, facultad) => sum + Number(añoAnterior[facultad]), 0)
    const crecimiento = ((totalActual - totalAnterior) / totalAnterior) * 100
    return Number(crecimiento.toFixed(2))
  })

  const crecimientoTotalGeneral =
    ((facultades.reduce((sum, facultad) => sum + Number(datos[datos.length - 1][facultad]), 0) -
      facultades.reduce((sum, facultad) => sum + Number(datos[0][facultad]), 0)) /
      facultades.reduce((sum, facultad) => sum + Number(datos[0][facultad]), 0)) *
    100

  datosCrecimiento.push({
    facultad: "Total",
    crecimientoAnual: crecimientoAnualTotal,
    crecimientoTotal: Number(crecimientoTotalGeneral.toFixed(2)),
  })

  return datosCrecimiento
}

const datosCrecimiento = calcularCrecimiento(datosBrutos)

const colores = {
  Ingeniería: "#3498db",
  Negocios: "#2ecc71",
  Ciencias: "#e74c3c",
  Artes: "#f39c12",
  Medicina: "#9b59b6",
}

export default function GraficoMatriculaUniversitaria() {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Tendencias de Matrícula Universitaria</CardTitle>
        <CardDescription>
          Matrícula de estudiantes y porcentaje de crecimiento por facultad de 2018 a 2022
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={datosBrutos} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                {Object.entries(colores).map(([facultad, color]) => (
                  <linearGradient key={facultad} id={`color${facultad}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                  </linearGradient>
                ))}
              </defs>
              <XAxis dataKey="año" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
              <Tooltip
                contentStyle={{ backgroundColor: "white", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
                labelStyle={{ fontWeight: "bold", marginBottom: "4px" }}
              />
              <Legend verticalAlign="top" height={36} />
              {Object.entries(colores).map(([facultad, color]) => (
                <Area
                  key={facultad}
                  type="monotone"
                  dataKey={facultad}
                  stroke={color}
                  fillOpacity={1}
                  fill="none"
                  strokeWidth={2}
                  dot={{ stroke: color, strokeWidth: 2, r: 4, fill: "white" }}
                  activeDot={{ r: 6, stroke: "white", strokeWidth: 2 }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Año</TableHead>
                {Object.keys(colores).map((facultad) => (
                  <TableHead key={facultad} className="text-center">
                    {facultad}
                  </TableHead>
                ))}
                <TableHead className="text-center">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {datosBrutos.map((fila, index) => (
                <React.Fragment key={fila.año}>
                  <TableRow>
                    <TableCell rowSpan={2} className="text-center font-medium">
                      {fila.año}
                    </TableCell>
                    {Object.keys(colores).map((facultad) => (
                      <TableCell key={facultad} className="text-center font-medium">
                        {fila[facultad as keyof typeof fila]}
                      </TableCell>
                    ))}
                    <TableCell className="text-center font-bold">
                      {Object.keys(colores).reduce((sum, facultad) => sum + fila[facultad as keyof typeof fila], 0)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    {Object.keys(colores).map((facultad) => (
                      <TableCell key={facultad} className="text-center">
                        {index > 0 && (
                          <span
                            className={
                              (datosCrecimiento.find((d) => d.facultad === facultad)?.crecimientoAnual[index - 1] ?? 0) >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {(datosCrecimiento.find((d) => d.facultad === facultad)?.crecimientoAnual[index - 1] ?? 0) >= 0
                              ? "+"
                              : ""}
                            {datosCrecimiento.find((d) => d.facultad === facultad)?.crecimientoAnual[index - 1]}%
                          </span>
                        )}
                      </TableCell>
                    ))}
                    <TableCell className="text-center">
                      {index > 0 && (
                        <span
                          className={
                            (datosCrecimiento.find((d) => d.facultad === "Total")?.crecimientoAnual[index - 1] ?? 0) >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {(datosCrecimiento.find((d) => d.facultad === "Total")?.crecimientoAnual[index - 1] ?? 0) >= 0
                            ? "+"
                            : ""}
                          {datosCrecimiento.find((d) => d.facultad === "Total")?.crecimientoAnual[index - 1]}%
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

