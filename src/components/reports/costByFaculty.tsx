"use client"

import { useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

// Datos mockeados de las facultades con aportes y recursos adicionales
const facultyData = [
  {
    faculty: "Ingeniería",
    umesContribution: 300000,
    otherContributions: 200000,
    additionalResources: 50000,
    facultyDetails: {
      assignedBudget: 550000,
      totalExpenses: 520000,
      approvedEventsExpenses: 30000
    },
    umesDetails: {
      annualBudget: 280000,
      subsidies: 20000
    },
    otherDetails: {
      donations: 150000,
      grants: 50000
    },
    additionalDetails: {
      equipment: 30000,
      maintenance: 20000
    }
  },
  {
    faculty: "Medicina",
    umesContribution: 450000,
    otherContributions: 300000,
    additionalResources: 75000,
    facultyDetails: {
      assignedBudget: 825000,
      totalExpenses: 800000,
      approvedEventsExpenses: 25000
    },
    umesDetails: {
      annualBudget: 420000,
      subsidies: 30000
    },
    otherDetails: {
      donations: 200000,
      grants: 100000
    },
    additionalDetails: {
      equipment: 50000,
      maintenance: 25000
    }
  },
  {
    faculty: "Derecho",
    umesContribution: 200000,
    otherContributions: 100000,
    additionalResources: 30000,
    facultyDetails: {
      assignedBudget: 330000,
      totalExpenses: 310000,
      approvedEventsExpenses: 20000
    },
    umesDetails: {
      annualBudget: 180000,
      subsidies: 20000
    },
    otherDetails: {
      donations: 80000,
      grants: 20000
    },
    additionalDetails: {
      equipment: 20000,
      maintenance: 10000
    }
  },
  {
    faculty: "Economía",
    umesContribution: 250000,
    otherContributions: 200000,
    additionalResources: 40000,
    facultyDetails: {
      assignedBudget: 490000,
      totalExpenses: 470000,
      approvedEventsExpenses: 20000
    },
    umesDetails: {
      annualBudget: 230000,
      subsidies: 20000
    },
    otherDetails: {
      donations: 150000,
      grants: 50000
    },
    additionalDetails: {
      equipment: 25000,
      maintenance: 15000
    }
  },
  {
    faculty: "Humanidades",
    umesContribution: 150000,
    otherContributions: 100000,
    additionalResources: 25000,
    facultyDetails: {
      assignedBudget: 275000,
      totalExpenses: 260000,
      approvedEventsExpenses: 15000
    },
    umesDetails: {
      annualBudget: 140000,
      subsidies: 10000
    },
    otherDetails: {
      donations: 80000,
      grants: 20000
    },
    additionalDetails: {
      equipment: 15000,
      maintenance: 10000
    }
  },
  {
    faculty: "Arquitectura",
    umesContribution: 250000,
    otherContributions: 150000,
    additionalResources: 45000,
    facultyDetails: {
      assignedBudget: 445000,
      totalExpenses: 425000,
      approvedEventsExpenses: 20000
    },
    umesDetails: {
      annualBudget: 230000,
      subsidies: 20000
    },
    otherDetails: {
      donations: 100000,
      grants: 50000
    },
    additionalDetails: {
      equipment: 30000,
      maintenance: 15000
    }
  },
]

export default function CostByFaculty() {
  const [includeAdditionalResources, setIncludeAdditionalResources] = useState(false)

  const formatCurrency = (value: number) => `Q${value.toLocaleString()}`

  const getTooltipContent = (payload: any, label: string, active: boolean) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload

      if (payload[0].dataKey === "faculty") {
        return (
          <div className="rounded-lg border border-green-300 bg-green-50 p-2 shadow-sm">
            <p className="font-bold text-green-800">{label}</p>
            <p className="text-sm">
              <span className="font-medium text-green-700">Presupuesto Asignado:</span>{' '}
              {formatCurrency(data.facultyDetails.assignedBudget)}
            </p>
            <p className="text-sm">
              <span className="font-medium text-green-700">Gasto Total:</span>{' '}
              {formatCurrency(data.facultyDetails.totalExpenses)}
            </p>
            <p className="text-sm">
              <span className="font-medium text-green-700">Gasto Eventos Aprobados:</span>{' '}
              {formatCurrency(data.facultyDetails.approvedEventsExpenses)}
            </p>
          </div>
        )
      }

      return (
        <div className="rounded-lg border border-green-300 bg-green-50 p-2 shadow-sm">
          <p className="font-bold text-green-800">{label}</p>
          {payload.map((entry: any, index: number) => {
            let details
            if (entry.dataKey === "umesContribution") {
              details = data.umesDetails
            } else if (entry.dataKey === "otherContributions") {
              details = data.otherDetails
            } else if (entry.dataKey === "additionalResources") {
              details = data.additionalDetails
            }

            return (
              <div key={index}>
                <p className="text-sm">
                  <span className="font-medium" style={{ color: entry.color }}>
                    {entry.name}:
                  </span>{' '}
                  {formatCurrency(entry.value)}
                </p>
                {details && Object.entries(details).map(([key, value]) => (
                  <p key={key} className="text-sm">
                    <span className="font-medium text-green-700">{key}:</span>{' '}
                    {formatCurrency(value as number)}
                  </p>
                ))}
              </div>
            )
          })}
        </div>
      )
    }
    return null
  }

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-green-700">Costos Totales por Facultad</CardTitle>
          <CardDescription className="text-green-600">Plan Operativo Anual (POA) - Universidad Mesoamericana</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <RadioGroup
              defaultValue="withoutAdditional"
              onValueChange={(value) => setIncludeAdditionalResources(value === "withAdditional")}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="withoutAdditional" id="withoutAdditional" />
                <Label htmlFor="withoutAdditional">Sin recursos adicionales</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="withAdditional" id="withAdditional" />
                <Label htmlFor="withAdditional">Con recursos adicionales</Label>
              </div>
            </RadioGroup>
          </div>
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
                  tick={({ x, y, payload }) => (
                    <g transform={`translate(${x},${y})`}>
                      <text
                        x={0}
                        y={0}
                        dy={16}
                        textAnchor="end"
                        fill="hsl(142, 76%, 36%)"
                        transform="rotate(-45)"
                        className="cursor-pointer"
                        onMouseEnter={(e) => {
                          const tooltip = document.getElementById('faculty-tooltip');
                          if (tooltip) {
                            const data = facultyData.find(item => item.faculty === payload.value);
                            if (data) {
                              tooltip.innerHTML = `
                                <div class="p-2 bg-green-50 border border-green-300 rounded-lg shadow-sm">
                                  <p class="font-bold text-green-800">${data.faculty}</p>
                                  <p class="text-sm"><span class="font-medium text-green-700">Presupuesto Asignado:</span> ${formatCurrency(data.facultyDetails.assignedBudget)}</p>
                                  <p class="text-sm"><span class="font-medium text-green-700">Gasto Total:</span> ${formatCurrency(data.facultyDetails.totalExpenses)}</p>
                                  <p class="text-sm"><span class="font-medium text-green-700">Gasto Eventos Aprobados:</span> ${formatCurrency(data.facultyDetails.approvedEventsExpenses)}</p>
                                </div>
                              `;
                              tooltip.style.display = 'block';
                              tooltip.style.left = `${e.pageX}px`;
                              tooltip.style.top = `${e.pageY}px`;
                            }
                          }
                        }}
                        onMouseLeave={() => {
                          const tooltip = document.getElementById('faculty-tooltip');
                          if (tooltip) {
                            tooltip.style.display = 'none';
                          }
                        }}
                      >
                        {payload.value}
                      </text>
                    </g>
                  )}
                  interval={0}
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
                <Tooltip content={({ active = false, payload, label }) => getTooltipContent(payload, label, active)} />
                <Legend
                  verticalAlign="top"
                  height={36}
                  wrapperStyle={{ paddingTop: '10px' }}
                />
                <Bar dataKey="umesContribution" stackId="a" fill="hsl(142, 76%, 36%)" name="Contribución UMES" />
                <Bar dataKey="otherContributions" stackId="a" fill="hsl(142, 50%, 60%)" name="Otras Contribuciones" />
                {includeAdditionalResources && (
                  <Bar dataKey="additionalResources" stackId="a" fill="hsl(142, 30%, 80%)" name="Recursos Adicionales" />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div
            id="faculty-tooltip"
            className="absolute hidden z-10"
            style={{ pointerEvents: 'none' }}
          />
        </CardContent>
      </Card>
    </div>
  )
}