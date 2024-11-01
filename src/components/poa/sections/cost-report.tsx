'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Info, ChevronDown, ChevronUp } from "lucide-react"
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/financing/poa/${poaId}`, {
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
  }, [user?.token, poaId])

  // Procesar los datos para obtener las fuentes de financiamiento
  const {
    costoTotal,
    financingSourcesWithColors
  } = useMemo(() => {
    if (!data) {
      return {
        costoTotal: 0,
        financingSourcesWithColors: [] as FinancingSource[],
      }
    }

    const colors = ['#1f77b4', '#2ca02c', '#ff7f0e', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf']
    let colorIndex = 0

    const categoryStats = data.categoryStats

    // Presupuesto Anual
    const presupuestoAnualData = categoryStats['UMES']?.financingSources
    const presupuestoAnualSource = presupuestoAnualData ? Object.values(presupuestoAnualData).find(source => source.name === 'Presupuesto Anual') : null

    // Fondos Adicionales
    const fondosAdicionales = presupuestoAnualData
      ? Object.values(presupuestoAnualData)
          .filter(source => source.name !== 'Presupuesto Anual')
          .map(source => ({ ...source, color: colors[(colorIndex++) % colors.length] }))
      : []

    // Fondos Externos
    const fondosExternosData = categoryStats['Otra']?.financingSources
    const fondosExternos = fondosExternosData
      ? Object.values(fondosExternosData).map(source => ({ ...source, color: colors[(colorIndex++) % colors.length] }))
      : []

    // Todas las fuentes para el resumen total
    const financingSourcesWithColors = [
      ...(presupuestoAnualSource ? [{ ...presupuestoAnualSource, color: colors[(colorIndex++) % colors.length] }] : []),
      ...fondosAdicionales,
      ...fondosExternos
    ]

    return {
      costoTotal: data.totalCost,
      financingSourcesWithColors,
    }
  }, [data])

  if (!data) {
    return <div>Cargando...</div>
  }

  return (
    <div className="w-full">
      <div className="bg-green-50 p-4 rounded-t-lg shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Informe de Costos de Eventos del POA</h1>
          <div className="flex items-center space-x-2">
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
                    {source.name} ({source.percentageOfTotalCost}% - {formatCurrency(source.amount)})
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center text-sm text-gray-500 mt-4">
            <Info className="mr-2 h-4 w-4" />
            <span>Este informe muestra la distribución total del presupuesto de los eventos de este POA.</span>
          </div>
        </div>
      )}
    </div>
  )
}
