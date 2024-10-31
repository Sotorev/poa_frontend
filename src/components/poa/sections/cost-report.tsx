'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Info, EyeOff, Eye, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useCurrentUser } from '@/hooks/use-current-user'

export function CostReport() {
  const [showDetails, setShowDetails] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)
  const user = useCurrentUser()
  
  interface Data {
    categoryStats: {
      [key: string]: {
        financingSources: {
          [key: string]: {
            name: string;
            amount: number;
            percentageOfCategory: number;
            percentageOfTotalCost: number;
          }
        }
      }
    };
    facultyBudget: number;
    totalCost: number;
  }

  const [data, setData] = useState<Data | null>(null)

  // Función para formatear moneda
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(amount)
  }

  // Fetch de datos desde la API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/financing/poa/5`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.token}`
          },
        })
        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.statusText}`)
        }
        const jsonData = await response.json()
        setData(jsonData)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [user?.token])

  // Procesar los datos para obtener las fuentes de financiamiento
  const financingSourcesByName = useMemo(() => {
    if (!data) return {}

    const sourcesByName: { [key: string]: { name: string; amount: number; percentageOfCategory: number; percentageOfTotalCost: number } } = {}

    Object.keys(data.categoryStats).forEach(categoryKey => {
      const category = data.categoryStats[categoryKey]
      const financingSources = category.financingSources
      Object.keys(financingSources).forEach(sourceKey => {
        const source = financingSources[sourceKey]
        const name = source.name
        if (!sourcesByName[name]) {
          sourcesByName[name] = {
            name: name,
            amount: 0,
            percentageOfCategory: 0,
            percentageOfTotalCost: 0,
          }
        }
        sourcesByName[name].amount += source.amount
        sourcesByName[name].percentageOfCategory += source.percentageOfCategory
        sourcesByName[name].percentageOfTotalCost += source.percentageOfTotalCost
      })
    })

    return sourcesByName
  }, [data])

  // Datos específicos
  const presupuestoAnualData = financingSourcesByName['Presupuesto Anual'] || null
  const presupuestoAnual = presupuestoAnualData ? presupuestoAnualData.amount : 0
  const presupuestoAsignado = data ? data.facultyBudget : 0
  const costoTotal = data ? data.totalCost : 0
  const diferencia = presupuestoAsignado - presupuestoAnual
  const seExcede = diferencia < 0

  // Otras fuentes de financiamiento
  const otherFinancingSources = useMemo(() => {
    if (!financingSourcesByName) return []

    return Object.values(financingSourcesByName).filter(source => source.name !== 'Presupuesto Anual')
  }, [financingSourcesByName])

  // Colores para las fuentes de financiamiento
  const colors = ['#1f77b4', '#2ca02c', '#ff7f0e', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf']

  const financingSourcesWithColors = useMemo(() => {
    return Object.values(financingSourcesByName).map((source, index) => ({
      ...source,
      color: colors[index % colors.length],
    }))
  }, [financingSourcesByName])

  // Función para renderizar una fuente de financiamiento
  interface FundingSource {
    label: string;
    amount: number;
    percentageOfTotalCost: number;
  }

  const renderFundingSource = ({ label, amount, percentageOfTotalCost }: FundingSource) => (
    <div className="flex justify-between items-center space-x-2">
      <span className="text-sm font-medium">{label}:</span>
      <div className="text-right">
        <span className="text-sm font-bold">{formatCurrency(amount)}</span>
        <div className="text-xs text-muted-foreground">{percentageOfTotalCost.toFixed(2)}% del total</div>
      </div>
    </div>
  )

  if (!data) {
    return <div>Cargando...</div>
  }

  return (
    <div className="w-full">
      <div className="bg-green-50 p-4 rounded-t-lg shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Informe de Costos de Eventos del POA
          </h1>
          <div className="flex items-center space-x-2">
            {!isMinimized && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                {showDetails ? 'Ocultar detalles' : 'Mostrar detalles'}
              </Button>
            )}
            <Button 
              variant="ghost" 
              className="text-primary hover:text-primary hover:bg-green-100" 
              size="icon" 
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
      
      {!isMinimized && (
        <div className="bg-white p-4 rounded-b-lg shadow-md">
          {showDetails && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
              {/* Presupuesto Anual */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Presupuesto Anual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Presupuesto asignado:</span>
                    <span className="text-sm font-bold">{formatCurrency(presupuestoAsignado)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Presupuesto utilizado:</span>
                    <span className="text-sm font-bold">{formatCurrency(presupuestoAnual)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm font-medium">Diferencia:</span>
                    <span className={`text-sm font-bold ${seExcede ? 'text-red-500' : 'text-green-500'}`}>
                      {formatCurrency(diferencia)}
                    </span>
                  </div>
                  <div className="mt-2">
                    <Progress 
                      value={presupuestoAsignado !== 0 ? (presupuestoAnual / presupuestoAsignado) * 100 : 0} 
                      className="h-2"
                    />
                    <div className="text-xs text-right mt-1">
                      {presupuestoAsignado !== 0 ? ((presupuestoAnual / presupuestoAsignado) * 100).toFixed(2) : '0.00'}% del presupuesto asignado
                    </div>
                  </div>
                  {seExcede ? (
                    <div className="flex items-center text-red-500 mt-2">
                      <AlertCircle className="mr-2 h-4 w-4" />
                      <span className="text-sm">El presupuesto utilizado excede el asignado.</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-green-500 mt-2">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      <span className="text-sm">El presupuesto utilizado está dentro del asignado.</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Fondos Adicionales */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Fondos Adicionales</CardTitle>
                </CardHeader>
                <CardContent>
                  {otherFinancingSources.map((source) => (
                    <div key={source.name}>
                      {renderFundingSource({ label: source.name, amount: source.amount, percentageOfTotalCost: source.percentageOfTotalCost })}
                    </div>
                  ))}
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Total Fondos Adicionales:</span>
                      <span className="text-sm font-bold">
                        {formatCurrency(otherFinancingSources.reduce((sum, source) => sum + source.amount, 0))}
                      </span>
                    </div>
                    <Progress 
                      value={(otherFinancingSources.reduce((sum, source) => sum + source.amount, 0) / costoTotal) * 100} 
                      className="h-2"
                    />
                    <div className="text-xs text-right mt-1">
                      {((otherFinancingSources.reduce((sum, source) => sum + source.amount, 0) / costoTotal) * 100).toFixed(2)}% del total
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Espacio para más tarjetas si es necesario */}
            </div>
          )}

          {/* Resumen Total */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Resumen Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <span className="text-sm font-medium mb-2 md:mb-0">Costo total (todos los fondos):</span>
                <span className="text-lg font-bold">{formatCurrency(costoTotal)}</span>
              </div>
              <h4 className="text-sm font-semibold mb-2">Distribución del Presupuesto Total:</h4>
              <div className="w-full bg-gray-200 rounded-full h-6 dark:bg-gray-700 overflow-hidden mb-2">
                <div className="flex h-full">
                  {financingSourcesWithColors.map((source) => (
                    <div
                      key={source.name}
                      className="h-full"
                      style={{
                        width: `${source.percentageOfTotalCost}%`,
                        backgroundColor: source.color,
                      }}
                    ></div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                {financingSourcesWithColors.map((source) => (
                  <span key={source.name} className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: source.color }}></div>
                    {source.name} ({source.percentageOfTotalCost}%)
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center text-sm text-gray-500 mt-4">
            <Info className="mr-2 h-4 w-4" />
            <span>Este informe muestra el presupuesto asignado, los fondos adicionales y la distribución total del presupuesto del.</span>
          </div>
        </div>
      )}
    </div>
  )
}