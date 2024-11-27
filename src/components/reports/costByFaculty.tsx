"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts" // Importa los componentes necesarios de la biblioteca Recharts para crear gráficos de barras
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card" // Importa los componentes de la interfaz de usuario personalizados para construir la tarjeta

// Datos mockeados de las facultades con aportes
const facultyData = [
  { faculty: "Engineering", umesContribution: 300000, otherContributions: 200000 },
  { faculty: "Medicine", umesContribution: 450000, otherContributions: 300000 },
  { faculty: "Law", umesContribution: 200000, otherContributions: 100000 },
  { faculty: "Economics", umesContribution: 250000, otherContributions: 200000 },
  { faculty: "Humanities", umesContribution: 150000, otherContributions: 100000 },
  { faculty: "Architecture", umesContribution: 250000, otherContributions: 150000 },
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
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle className="text-green-700">Total Costs by Faculty</CardTitle>
        <CardDescription className="text-green-600">Annual Operational Planning (POA) - Universidad Mesoamericana</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[450px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={facultyData} // Datos que se utilizarán para el gráfico
              margin={{ top: 20, right: 30, left: 65, bottom: 60 }} // Márgenes del gráfico
              barSize={30} // Tamaño de las barras individuales
              maxBarSize={50} // Tamaño máximo permitido para las barras
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(142, 76%, 90%)" /> {/* Cuadrícula del gráfico con líneas punteadas */}
              <XAxis
                dataKey="faculty" // Clave de datos para el eje X
                tick={{ fill: "hsl(142, 76%, 36%)" }} // Estilo de las etiquetas del eje X
                tickLine={{ stroke: "hsl(142, 76%, 36%)" }} // Estilo de las líneas de las etiquetas del eje X
                axisLine={{ stroke: "hsl(142, 76%, 36%)" }} // Estilo de la línea del eje X
                interval={0} // Intervalo de las etiquetas del eje X
                angle={-45} // Ángulo de inclinación de las etiquetas del eje X
                textAnchor="end" // Alineación del texto de las etiquetas
                height={80} // Altura del área del eje X
              />
              <YAxis
                tickFormatter={formatCurrency} // Función para formatear las etiquetas del eje Y
                tick={{ fill: "hsl(142, 76%, 36%)" }} // Estilo de las etiquetas del eje Y
                tickLine={{ stroke: "hsl(142, 76%, 36%)" }} // Estilo de las líneas de las etiquetas del eje Y
                axisLine={{ stroke: "hsl(142, 76%, 36%)" }} // Estilo de la línea del eje Y
                label={{
                  value: 'Total Cost (Q)', // Texto de la etiqueta del eje Y
                  angle: -90, // Ángulo de la etiqueta
                  position: 'insideLeft', // Posición de la etiqueta
                  fill: "hsl(142, 76%, 36%)", // Color de la etiqueta
                  offset: -50, // Desplazamiento de la etiqueta
                  style: {
                    textAnchor: 'middle' // Alineación del texto de la etiqueta
                  }
                }}
              />
              <Tooltip
                formatter={formatCurrency} // Función para formatear los valores en el tooltip
                cursor={{ fill: "hsl(142, 76%, 90%)" }} // Estilo del cursor al pasar sobre una barra
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border border-green-300 bg-green-50 p-2 shadow-sm"> {/* Contenedor del tooltip con estilos */}
                        <p className="font-bold text-green-800">{label}</p> {/* Etiqueta de la facultad */}
                        {payload.map((entry, index) => (
                          <p key={index} className="text-sm">
                            <span className="font-medium" style={{ color: entry.color }}>
                              {entry.name}:
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
                verticalAlign="top" // Alineación vertical de la leyenda
                height={36} // Altura de la leyenda
                wrapperStyle={{ paddingTop: '10px' }} // Estilo de envoltura de la leyenda
              />
              <Bar dataKey="umesContribution" stackId="a" fill="hsl(142, 76%, 36%)" name="UMES Contribution" /> {/* Barra para la contribución de UMES */}
              <Bar dataKey="otherContributions" stackId="a" fill="hsl(142, 50%, 60%)" name="Other Contributions" /> {/* Barra para otras contribuciones */}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}