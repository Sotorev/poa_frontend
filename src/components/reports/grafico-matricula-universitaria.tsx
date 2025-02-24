"use client"

import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import * as React from "react"
import { useEffect, useState } from "react"
import { useCurrentUser } from "@/hooks/use-current-user"

interface FacultyData {
  facultyId: number
  facultyName: string
  year: number
  studentCount: number
  annualVariation: number
}

export default function GraficoMatriculaUniversitaria() {
  const [datos, setDatos] = useState<FacultyData[]>([])
  const [colores, setColores] = useState<{ [key: string]: string }>({})
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const user = useCurrentUser()

  useEffect(() => {
    async function obtenerDatos() {
      try {
        if (!API_URL) {
          throw new Error("La URL de la API no está configurada")
        }
        const endpoint = `${API_URL}/api/reports/faculty/student-count-by-year`
        const response = await fetch(endpoint, {
          method: "GET",  
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user?.token}`
          }
        })

        if (!response.ok) {
          throw new Error("Error al obtener los datos de matrícula")
        }

        const data: FacultyData[] = await response.json()

        if (data.length === 0) {
          throw new Error("No se encontraron datos para mostrar")
        }

        // Generar colores aleatorios para cada facultad
        const facultades = Array.from(new Set(data.map(item => item.facultyName)))
        const coloresGenerados = facultades.reduce((acc: { [key: string]: string }, facultad) => {
          acc[facultad] = generarColorAleatorio()
          return acc
        }, {})

        setDatos(data)
        setColores(coloresGenerados)
      } catch (err: any) {
        console.error(err.message || "Error desconocido al obtener los datos de matrícula")
      }
    }

    if (user?.token) {
      obtenerDatos()
    } else {
      setDatos([])
      console.error("No autenticado. Por favor, inicia sesión para ver los datos.")
    }
  }, [API_URL, user?.token])

  const generarColorAleatorio = () => {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 100%, 50%)`;
  }

  const datosBrutos = React.useMemo(() => {
    if (!datos || datos.length === 0) return []
    const años = Array.from(new Set(datos.map(d => d.year))).sort((a, b) => a - b) // Ordenamos los años de manera ascendente
    const facultades = Array.from(new Set(datos.map(d => d.facultyName))) // Extraemos las facultades
    
    // Estructuramos los datos de tal forma que cada objeto tenga un "año" y las facultades como claves
    return años.map(año => {
      const fila: { [key: string]: number | string } = { año }
      facultades.forEach(facultad => {
        const registro = datos.find(d => d.facultyName === facultad && d.year === año)
        if (registro) {
          fila[facultad] = registro.studentCount
          fila[`${facultad}-variation`] = registro.annualVariation
        } else {
          fila[facultad] = 0
          fila[`${facultad}-variation`] = 0
        }
      })
      return fila
    })
  }, [datos])

  // Sumar total de estudiantes por año
  const sumaTotalEstudiantes = (fila: { [key: string]: string | number }) => {
    return Object.keys(fila).reduce((sum, key) => {
      if (key !== 'año' && !key.endsWith('-variation')) {
        return sum + (fila[key] as number)
      }
      return sum
    }, 0)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Tendencias de Matrícula Universitaria</CardTitle>
        <CardDescription>
          Matrícula de estudiantes por facultad a lo largo de los años
        </CardDescription>
      </CardHeader>
      <CardContent>
        {datos.length === 0 ? (
          <div className="text-center text-lg text-red-600">No hay datos disponibles para mostrar</div>
        ) : (
          <>
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
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    }}
                    labelStyle={{ fontWeight: "bold", marginBottom: "4px" }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  {Object.entries(colores).map(([facultad, color]) => (
                    <Area
                      key={facultad}
                      type="monotone"
                      dataKey={facultad}
                      stroke={color}
                      fill={`url(#color${facultad})`}
                      fillOpacity={0}
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
                  {datosBrutos
                  .filter((fila) => fila.año !== undefined && fila.año !== null)
                  .map((fila) => (
                    <TableRow key={String(fila.año)}>
                      <TableCell className="text-center font-medium">{fila.año}</TableCell>
                      {Object.keys(colores).map((facultad) => (
                        <TableCell key={facultad} className="text-center font-medium">
                          <div>{fila[facultad as keyof typeof fila]}</div>
                          <div
                            className={`text-sm ${
                              Number(fila[`${facultad}-variation` as keyof typeof fila]) > 0
                                ? "text-green-500"
                                : Number(fila[`${facultad}-variation` as keyof typeof fila]) < 0
                                ? "text-red-500"
                                : "text-gray-500"
                            }`}
                          >
                            {(() => {
                              const variation = Number(fila[`${facultad}-variation` as keyof typeof fila]);
                              return variation > 0 ? `+${variation}%` : `${variation}%`;
                            })()}
                          </div>
                        </TableCell>
                      ))}
                      <TableCell className="text-center font-bold">
                        {sumaTotalEstudiantes(fila)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
