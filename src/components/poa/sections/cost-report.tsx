'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Info, EyeOff, Eye, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useCurrentUser } from '@/hooks/use-current-user'
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface CostReportProps {
  facultyId: number;
  userId: number;
  rolId: number;
  poaId: number;
  isEditable: boolean;
}

interface EventApproval {
  approvalStatusId: number;
  // Otros campos que puedan ser necesarios
}

interface Event {
  eventId: number;
  name: string;
  totalCost: number;
  eventApprovals: EventApproval[];
  // Otros campos que puedan ser necesarios
}

interface FinancingSource {
  name: string;
  amount: number;
  percentageOfCategory: number;
  percentageOfTotalCost: number;
  color?: string;
  percentageOfSubcategory?: number; // Nuevo campo para porcentajes relativos
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

export function CostReport({ facultyId, userId, rolId, poaId, isEditable }: CostReportProps) {
  const [showDetails, setShowDetails] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)
  const user = useCurrentUser()

  const [data, setData] = useState<Data | null>(null)
  const [approvedEvents, setApprovedEvents] = useState<Event[]>([])

  // Función para formatear moneda
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(amount)
  }

  // Fetch de datos desde la API para Cost Report
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

  // Fetch de eventos aprobados
  useEffect(() => {
    const fetchApprovedEvents = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fullevent/poa/${poaId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.token}`
          },
        })
        if (!response.ok) {
          throw new Error(`Error al obtener eventos: ${response.statusText}`)
        }
        const events: Event[] = await response.json()
        const filteredEvents = events.filter(event => 
          event.eventApprovals.some(approval => approval.approvalStatusId === 1)
        )
        setApprovedEvents(filteredEvents)
      } catch (error) {
        console.error('Error al obtener eventos aprobados:', error)
      }
    }

    if (user?.token) {
      fetchApprovedEvents()
    }
  }, [user?.token, poaId])

  // Procesar los datos para obtener las fuentes de financiamiento
  const {
    presupuestoAnual,
    seExcede,
    fondosAdicionales,
    fondosExternos,
    costoTotal,
    financingSourcesWithColors,
    presupuestoAnualSource,
    fondosAdicionalesTotal,
    fondosExternosTotal,
    categoryStats
  } = useMemo(() => {
    if (!data) {
      return {
        presupuestoAnual: 0,
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
    const presupuestoAnualAmount = presupuestoAnualSource ? presupuestoAnualSource.amount : 0
    const presupuestoAsignado = data.facultyBudget
    const diferencia = presupuestoAsignado - presupuestoAnualAmount
    const seExcede = diferencia < 0

    // Fondos Adicionales (UMES sin Presupuesto Anual)
    const fondosAdicionales = presupuestoAnualData
      ? Object.values(presupuestoAnualData)
          .filter(source => source.name !== 'Presupuesto Anual')
          .map(source => ({ 
            ...source, 
            color: colors[(colorIndex++) % colors.length],
            // porcentaje relativo a fondos adicionales
            percentageOfSubcategory: 0, // Se calculará después
          }))
      : []

    // Total Fondos Adicionales
    const fondosAdicionalesTotal = fondosAdicionales.reduce((sum, source) => sum + source.amount, 0)

    // Calcular porcentaje relativo a fondos adicionales
    const fondosAdicionalesConPorcentaje = fondosAdicionales.map(source => ({
      ...source,
      percentageOfSubcategory: fondosAdicionalesTotal > 0 ? (source.amount / fondosAdicionalesTotal) * 100 : 0
    }))

    // Fondos Externos (Otra)
    const fondosExternosData = categoryStats['Otra']?.financingSources
    const fondosExternos = fondosExternosData
      ? Object.values(fondosExternosData).map(source => ({ 
          ...source, 
          color: colors[(colorIndex++) % colors.length],
          percentageOfSubcategory: 0, // Se calculará después
        }))
      : []

    // Total Fondos Externos
    const fondosExternosTotal = fondosExternos.reduce((sum, source) => sum + source.amount, 0)

    // Calcular porcentaje relativo a fondos externos
    const fondosExternosConPorcentaje = fondosExternos.map(source => ({
      ...source,
      percentageOfSubcategory: fondosExternosTotal > 0 ? (source.amount / fondosExternosTotal) * 100 : 0
    }))

    // Costo Total
    const costoTotal = data.totalCost

    // Todas las fuentes para el resumen total
    const financingSourcesWithColors = [
      ...(presupuestoAnualSource ? [{ ...presupuestoAnualSource, color: colors[(colorIndex++) % colors.length] }] : []),
      ...fondosAdicionalesConPorcentaje,
      ...fondosExternosConPorcentaje
    ]

    return {
      presupuestoAnual: presupuestoAnualAmount,
      seExcede,
      fondosAdicionales: fondosAdicionalesConPorcentaje,
      fondosExternos: fondosExternosConPorcentaje,
      costoTotal,
      financingSourcesWithColors,
      presupuestoAnualSource,
      fondosAdicionalesTotal,
      fondosExternosTotal,
      categoryStats
    }
  }, [data])

  // Función para renderizar una fuente de financiamiento
  interface FundingSourceProps {
    label: string;
    amount: number;
    percentageOfSubcategory: number;
  }

  const renderFundingSource = ({ label, amount, percentageOfSubcategory }: FundingSourceProps) => (
    <div className="flex justify-between items-center space-x-2">
      <span className="text-sm font-medium">{label}:</span>
      <div className="text-right">
        <span className="text-sm font-bold">{formatCurrency(amount)}</span>
        <div className="text-xs text-muted-foreground">
          {percentageOfSubcategory.toFixed(2)}%
        </div>
      </div>
    </div>
  )

  // Función para exportar a Excel
  const exportToExcel = () => {
    if (!data) {
      console.error('No hay datos para exportar.');
      return;
    }

    // Crear un nuevo libro de trabajo
    const wb = XLSX.utils.book_new();

    // Hoja 1: Estadísticas por Categoría
    const categoryData = Object.keys(data.categoryStats).map(category => {
      const financingSources = data.categoryStats[category].financingSources;
      const financingSourcesEntries = Object.entries(financingSources).map(([key, source]) => ({
        [`${key} - Monto`]: source.amount,
        [`${key} - % Total`]: source.percentageOfTotalCost
      }));

      // Combinar todos los objetos en uno solo
      const combined = financingSourcesEntries.reduce((acc, curr) => ({ ...acc, ...curr }), {});

      return {
        'Categoría': category,
        'Monto Total': data.categoryStats[category].totalAmount,
        'Porcentaje del Total': data.categoryStats[category].percentageOfTotal,
        ...combined
      };
    });

    const wsCategory = XLSX.utils.json_to_sheet(categoryData);
    XLSX.utils.book_append_sheet(wb, wsCategory, 'Estadísticas por Categoría');

    // Hoja 2: Presupuesto y Fondos
    const presupuestoData = [
      {
        'Presupuesto Anual': presupuestoAnual,
        'Total Fondos Adicionales': fondosAdicionalesTotal,
        'Total Fondos Externos': fondosExternosTotal,
        'Costo Total': costoTotal,
        'Se Excede': seExcede ? 'Sí' : 'No'
      },
    ];

    const wsPresupuesto = XLSX.utils.json_to_sheet(presupuestoData);
    XLSX.utils.book_append_sheet(wb, wsPresupuesto, 'Presupuesto y Fondos');

    // Hoja 3: Eventos Aprobados
    const eventosData = approvedEvents.map(event => ({
      'ID Evento': event.eventId,
      'Nombre del Evento': event.name,
      'Costo Total': event.totalCost,
    }));

    const wsEventos = XLSX.utils.json_to_sheet(eventosData);
    XLSX.utils.book_append_sheet(wb, wsEventos, 'Eventos Aprobados');

    // Generar el archivo Excel
    const wbout = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, 'Informe_de_Costos_POA.xlsx');
  };

  if (!data) {
    return <div>Cargando...</div>
  }

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
            {/* Botón de Exportar a Excel */}
            <Button 
              variant="default" 
              onClick={exportToExcel}
              className="ml-2"
            >
              Exportar a Excel
            </Button>
          </div>
        </div>
      </div>
      
      {!isMinimized && (
        <div className="bg-white p-4 rounded-b-lg shadow-md">
          {showDetails && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
              {/* Presupuesto Anual */}
              <Card className="h-full flex flex-col justify-center">
                <CardHeader className="text-center">
                  <CardTitle className="text-lg font-semibold">Costo total del POA (fondos facultad)</CardTitle>
                  <CardDescription>Presupuesto anual de la facultad</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center h-full">
                  <span className="text-4xl font-bold text-center">{formatCurrency(presupuestoAnual)}</span>
                </CardContent>
              </Card>

              {/* Fondos Adicionales */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Fondos adicionales de UMES</CardTitle>
                  <CardDescription>Fondos adicionales de UMES (NO provenientes del presupuesto anual de la facultad)</CardDescription>
                </CardHeader>
                <CardContent>
                  {fondosAdicionales.map((source) => (
                    <div key={source.name}>
                      {renderFundingSource({ 
                        label: source.name, 
                        amount: source.amount, 
                        percentageOfSubcategory: source.percentageOfSubcategory || 0
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
                  </div>
                </CardContent>
              </Card>

              {/* Fondos Externos */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Fondos de fuentes externas</CardTitle>
                </CardHeader>
                <CardContent>
                  {fondosExternos.map((source) => (
                    <div key={source.name}>
                      {renderFundingSource({ 
                        label: source.name, 
                        amount: source.amount, 
                        percentageOfSubcategory: source.percentageOfSubcategory || 0
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
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Resumen Total */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Total de aportes</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Nuevas Secciones Agregadas */}
              <div className="space-y-2 mb-4">
                {/* Presupuesto Anual */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Presupuesto Anual:</span>
                  <span className="text-sm font-bold text-green-600">{formatCurrency(presupuestoAnual)}</span>
                </div>
                {/* Fondos Adicionales */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total fondos adicionales:</span>
                  <span className="text-sm font-bold">{formatCurrency(fondosAdicionalesTotal)}</span>
                </div>
                {/* Fondos de Fuentes Externas */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total fondos de fuentes externas:</span>
                  <span className="text-sm font-bold">{formatCurrency(fondosExternosTotal)}</span>
                </div>
                {/* Separador */}
                <hr className="border-t border-gray-300" />
              </div>

              {/* Costo Total */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <span className="text-sm font-medium mb-2 md:mb-0">Costo total (fondos UMES y otras fuentes):</span>
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

          {/* Nueva Card para Eventos Aprobados */}
          <Card className="w-full mt-4">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Eventos Aprobados</CardTitle>
              <CardDescription>Listado de eventos aprobados con su costo total</CardDescription>
            </CardHeader>
            <CardContent>
              {approvedEvents.length === 0 ? (
                <p>No hay eventos aprobados para mostrar.</p>
              ) : (
                <div className="space-y-2">
                  {approvedEvents.map(event => (
                    <div key={event.eventId} className="flex justify-between items-center p-2 border rounded">
                      <span className="font-medium">{event.name}</span>
                      <span className="font-semibold">{formatCurrency(event.totalCost)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center text-sm text-gray-500 mt-4">
            <Info className="mr-2 h-4 w-4" />
            <span>Este informe muestra el costo del POA, los fondos adicionales, los fondos externos y la distribución total del presupuesto de los eventos de este POA.</span>
          </div>
        </div>
      )}
    </div>
  )
}
