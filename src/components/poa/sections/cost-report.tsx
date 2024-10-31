'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Info, EyeOff, Eye, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useCurrentUser } from '@/hooks/use-current-user'

interface CostReportProps {
  facultyId: number;
  userId: number;
  rolId: number;
  poaId: number;
  isEditable: boolean;
}

export function CostReport({ facultyId, userId, rolId, poaId, isEditable }: CostReportProps) {
  const [showDetails, setShowDetails] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)
  const user = useCurrentUser()
  
  interface FinancingSource {
    name: string;
    amount: number;
    percentageOfCategory: number;
    percentageOfTotalCost: number;
    color?: string;
  }

  interface CategoryStats {
    [key: string]: {
      totalAmount: number;
      percentageOfTotal: number;
      financingSources: {
        [key: string]: FinancingSource
      }
    }
  }

  interface Data {
    categoryStats: CategoryStats;
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/financing/poa/${facultyId}`, {
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

    if (user?.token) {
      fetchData()
    }
  }, [user?.token])

  // Procesar los datos para obtener las fuentes de financiamiento
  const {
    presupuestoAsignado,
    presupuestoAnual,
    diferencia,
    seExcede,
    fondosAdicionales,
    fondosExternos,
    costoTotal,
    financingSourcesWithColors,
    presupuestoAnualSource, // Añadido aquí
    fondosAdicionalesTotal,
    fondosExternosTotal,
    categoryStats
  } = useMemo(() => {
    if (!data) {
      return {
        presupuestoAsignado: 0,
        presupuestoAnual: 0,
        diferencia: 0,
        seExcede: false,
        fondosAdicionales: [] as FinancingSource[],
        fondosExternos: [] as FinancingSource[],
        costoTotal: 0,
        financingSourcesWithColors: [] as FinancingSource[],
        presupuestoAnualSource: null as FinancingSource | null,
        fondosAdicionalesTotal: 0,
        fondosExternosTotal: 0,
        categoryStats: {} as CategoryStats,
      }
    }

    const colors = ['#1f77b4', '#2ca02c', '#ff7f0e', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf']
    let colorIndex = 0

    const categoryStats = data.categoryStats

    // Datos del Presupuesto Anual
    const presupuestoAnualData = categoryStats['UMES']?.financingSources
    const presupuestoAnualSource = presupuestoAnualData ? Object.values(presupuestoAnualData).find(source => source.name === 'Presupuesto Anual') : null
    const presupuestoAnual = presupuestoAnualSource ? presupuestoAnualSource.amount : 0
    const presupuestoAsignado = data.facultyBudget
    const diferencia = presupuestoAsignado - presupuestoAnual
    const seExcede = diferencia < 0

    // Fondos Adicionales (UMES sin Presupuesto Anual)
    const fondosAdicionales = presupuestoAnualData
      ? Object.values(presupuestoAnualData)
          .filter(source => source.name !== 'Presupuesto Anual')
          .map(source => ({ ...source, color: colors[(colorIndex++) % colors.length] }))
      : []

    // Total Fondos Adicionales
    const fondosAdicionalesTotal = fondosAdicionales.reduce((sum, source) => sum + source.amount, 0)

    // Fondos Externos (Otra)
    const fondosExternosData = categoryStats['Otra']?.financingSources
    const fondosExternos = fondosExternosData
      ? Object.values(fondosExternosData).map(source => ({ ...source, color: colors[(colorIndex++) % colors.length] }))
      : []

    // Total Fondos Externos
    const fondosExternosTotal = fondosExternos.reduce((sum, source) => sum + source.amount, 0)

    // Costo Total
    const costoTotal = data.totalCost

    // Todas las fuentes para el resumen total
    const financingSourcesWithColors = [
      ...(presupuestoAnualSource ? [{ ...presupuestoAnualSource, color: colors[(colorIndex++) % colors.length] }] : []),
      ...fondosAdicionales,
      ...fondosExternos
    ]

    return {
      presupuestoAsignado,
      presupuestoAnual,
      diferencia,
      seExcede,
      fondosAdicionales,
      fondosExternos,
      costoTotal,
      financingSourcesWithColors,
      presupuestoAnualSource, // Incluido en el retorno
      fondosAdicionalesTotal,
      fondosExternosTotal,
      categoryStats
    }
  }, [data])

  // Función para renderizar una fuente de financiamiento
  interface FundingSourceProps {
    label: string;
    amount: number;
    percentageOfCategory: number;
    percentageOfTotalCost: number;
  }

  const renderFundingSource = ({ label, amount, percentageOfCategory, percentageOfTotalCost }: FundingSourceProps) => (
    <div className="flex justify-between items-center space-x-2">
      <span className="text-sm font-medium">{label}:</span>
      <div className="text-right">
        <span className="text-sm font-bold">{formatCurrency(amount)}</span>
        <div className="text-xs text-muted-foreground">
          {percentageOfTotalCost}% del total
        </div>
      </div>
    </div>
  )

  if (!data) {
    return <div>Cargando...</div>
  }

  // const { categoryStats } = data

  return (
    <div className="w-full">
      <div className="bg-green-50 p-4 rounded-t-lg shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Informe de Costos de Eventos del POA</h1>
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
                      value={presupuestoAnualSource ? presupuestoAnualSource.percentageOfCategory : 0} 
                      className="h-2"
                    />
                    <div className="text-xs text-right mt-1">
                      {presupuestoAnualSource ? presupuestoAnualSource.percentageOfTotalCost : '0.00'}% del total de costos
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
                  {fondosAdicionales.map((source) => (
                    <div key={source.name}>
                      {renderFundingSource({ 
                        label: source.name, 
                        amount: source.amount, 
                        percentageOfCategory: source.percentageOfCategory, 
                        percentageOfTotalCost: source.percentageOfTotalCost 
                      })}
                    </div>
                  ))}
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Total Fondos Adicionales:</span>
                      <span className="text-sm font-bold">
                        {formatCurrency(fondosAdicionalesTotal)}
                      </span>
                    </div>
                    <Progress 
                      value={categoryStats['UMES']?.percentageOfTotal || 0} 
                      className="h-2"
                    />
                    <div className="text-xs text-right mt-1">
                      {categoryStats['UMES']?.percentageOfTotal || '0.00'}% del total
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Fondos Externos */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Fondos de Fuentes Externas</CardTitle>
                </CardHeader>
                <CardContent>
                  {fondosExternos.map((source) => (
                    <div key={source.name}>
                      {renderFundingSource({ 
                        label: source.name, 
                        amount: source.amount, 
                        percentageOfCategory: source.percentageOfCategory, 
                        percentageOfTotalCost: source.percentageOfTotalCost 
                      })}
                    </div>
                  ))}
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Total Fondos Externos:</span>
                      <span className="text-sm font-bold">
                        {formatCurrency(fondosExternosTotal)}
                      </span>
                    </div>
                    <Progress 
                      value={categoryStats['Otra']?.percentageOfTotal || 0} 
                      className="h-2"
                    />
                    <div className="text-xs text-right mt-1">
                      {categoryStats['Otra']?.percentageOfTotal || '0.00'}% del total
                    </div>
                  </div>
                </CardContent>
              </Card>
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
            <span>Este informe muestra el presupuesto asignado, los fondos adicionales, los fondos externos y la distribución total del presupuesto de los eventos de este POA.</span>
          </div>
        </div>
      )}
    </div>
  )
}
