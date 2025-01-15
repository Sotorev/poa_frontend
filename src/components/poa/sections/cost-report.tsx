'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Info, EyeOff, Eye, ChevronDown, ChevronUp, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useCurrentUser } from '@/hooks/use-current-user'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

interface CostReportProps {
  name: string
  isActive?: boolean
  poaId: number
}

interface EventApproval {
  approvalStatusId: number
}

interface Campus {
  campusId: number
  name: string
}

interface EventDate {
  eventDateId: number
  eventId: number
  startDate: string
  endDate: string
  isDeleted: boolean
}

interface Responsible {
  eventResponsibleId: number
  eventId: number
  responsibleRole: string
  isDeleted: boolean
  name: string
}

interface Event {
  eventId: number
  name: string
  type: string
  objective: string
  achievementIndicator: string
  eventNature: string
  totalCost: number
  campusId: number
  eventApprovals: EventApproval[]
  dates: EventDate[]
  responsibles: Responsible[]
  campus: Campus
}



interface FinancingSource {
  name: string
  amount: number
  percentageOfCategory: number
  percentageOfTotalCost: number
  color?: string
  percentageOfSubcategory?: number
}

interface CategoryStats {
  [key: string]: {
    totalAmount: number
    percentageOfTotal: number
    financingSources: {
      [key: string]: FinancingSource
    }
  }
}

interface Data {
  categoryStats: CategoryStats
  facultyBudget: number
  totalCost: number
}

export function CostReport({ name, isActive, poaId }: CostReportProps) {
  const [showDetails, setShowDetails] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)
  const user = useCurrentUser()
  const [data, setData] = useState<Data | null>(null)
  const [approvedEvents, setApprovedEvents] = useState<Event[]>([])
  const [sortField, setSortField] = useState<'name' | 'totalCost'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const eventsPerPage = 5

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(amount)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/financing/poa/${poaId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.token}`
          },
        })
        if (!response.ok) throw new Error(`Error fetching data: ${response.statusText}`)
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

  useEffect(() => {
    const fetchApprovedEvents = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fullevent/poa/${poaId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.token}`
          },
        })
        if (!response.ok) throw new Error(`Error al obtener eventos: ${response.statusText}`)
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

  const {
    presupuestoAnual,
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
    const presupuestoAnualData = categoryStats['UMES']?.financingSources
    const presupuestoAnualSource = presupuestoAnualData ? Object.values(presupuestoAnualData).find(source => source.name === 'Presupuesto Anual') : null
    const presupuestoAnualAmount = presupuestoAnualSource ? presupuestoAnualSource.amount : 0

    const fondosAdicionales = presupuestoAnualData
      ? Object.values(presupuestoAnualData)
        .filter(source => source.name !== 'Presupuesto Anual')
        .map(source => ({
          ...source,
          color: colors[(colorIndex++) % colors.length],
          percentageOfSubcategory: 0,
        }))
      : []

    const fondosAdicionalesTotal = fondosAdicionales.reduce((sum, source) => sum + source.amount, 0)

    const fondosAdicionalesConPorcentaje = fondosAdicionales.map(source => ({
      ...source,
      percentageOfSubcategory: fondosAdicionalesTotal > 0 ? (source.amount / fondosAdicionalesTotal) * 100 : 0
    }))

    const fondosExternosData = categoryStats['Otra']?.financingSources
    const fondosExternos = fondosExternosData
      ? Object.values(fondosExternosData).map(source => ({
        ...source,
        color: colors[(colorIndex++) % colors.length],
        percentageOfSubcategory: 0,
      }))
      : []

    const fondosExternosTotal = fondosExternos.reduce((sum, source) => sum + source.amount, 0)

    const fondosExternosConPorcentaje = fondosExternos.map(source => ({
      ...source,
      percentageOfSubcategory: fondosExternosTotal > 0 ? (source.amount / fondosExternosTotal) * 100 : 0
    }))

    const costoTotal = data.totalCost

    const financingSourcesWithColors = [
      ...(presupuestoAnualSource ? [{ ...presupuestoAnualSource, color: colors[(colorIndex++) % colors.length] }] : []),
      ...fondosAdicionalesConPorcentaje,
      ...fondosExternosConPorcentaje
    ]

    return {
      presupuestoAnual: presupuestoAnualAmount,
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

  interface FundingSourceProps {
    label: string
    amount: number
    percentageOfSubcategory: number
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

  const sortedApprovedEvents = useMemo(() => {
    const eventsCopy = [...approvedEvents]
    eventsCopy.sort((a, b) => {
      let comparison = 0
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name)
      } else if (sortField === 'totalCost') {
        comparison = a.totalCost - b.totalCost
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })
    return eventsCopy
  }, [approvedEvents, sortField, sortOrder])

  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * eventsPerPage
    return sortedApprovedEvents.slice(startIndex, startIndex + eventsPerPage)
  }, [sortedApprovedEvents, currentPage])

  const totalPages = Math.ceil(sortedApprovedEvents.length / eventsPerPage)

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1))
  }

  const handleSort = (field: 'name' | 'totalCost') => {
    if (sortField === field) {
      setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const exportToExcel = () => {
    if (!data) {
      console.error('No hay datos para exportar.')
      return
    }

    try {
      const wb = XLSX.utils.book_new()

      // Hoja 1: Estadísticas por Categoría
      const categoryData = Object.keys(data.categoryStats).flatMap(category => {
        const financingSources = data.categoryStats[category].financingSources
        return Object.values(financingSources).map(source => ({
          'Categoría': category,
          'Fuente de Financiamiento': source.name,
          'Monto (GTQ)': source.amount,
          '% Total': source.percentageOfTotalCost / 100,
        }))
      })

      const wsCategory = XLSX.utils.json_to_sheet(categoryData, { header: ['Categoría', 'Fuente de Financiamiento', 'Monto (GTQ)', '% Total'], skipHeader: false });

      // Ajustar ancho de columnas
      const categoryCols = calculateColumnWidths(categoryData, ['Categoría', 'Fuente de Financiamiento', 'Monto (GTQ)', '% Total']);
      wsCategory['!cols'] = categoryCols;

      // Formatear celdas en la hoja de Estadísticas por Categoría
      const rangeCategory = XLSX.utils.decode_range(wsCategory['!ref'] || 'A1:D1');
      for (let R = 1; R <= rangeCategory.e.r; ++R) { // Empezar en 1 para omitir encabezado
        const montoCellAddress = { c: 2, r: R }; // 'Monto (GTQ)' es la tercera columna (índice 2)
        const montoCellRef = XLSX.utils.encode_cell(montoCellAddress);
        if (wsCategory[montoCellRef]) {
          wsCategory[montoCellRef].t = 'n'; // Tipo numérico
          wsCategory[montoCellRef].z = '"GTQ"#,##0.00'; // Formato moneda GTQ
        }

        const porcentajeCellAddress = { c: 3, r: R }; // '% Total' es la cuarta columna (índice 3)
        const porcentajeCellRef = XLSX.utils.encode_cell(porcentajeCellAddress);
        if (wsCategory[porcentajeCellRef]) {
          wsCategory[porcentajeCellRef].t = 'n'; // Tipo numérico
          wsCategory[porcentajeCellRef].z = '0.00%'; // Formato porcentaje
        }
      }

      XLSX.utils.book_append_sheet(wb, wsCategory, 'Estadísticas por Categoría');

      // Hoja 2: Presupuesto y Fondos
      const presupuestoData = [{
        'Presupuesto Anual (GTQ)': presupuestoAnual,
        'Total Fondos Adicionales (GTQ)': fondosAdicionalesTotal,
        'Total Fondos Externos (GTQ)': fondosExternosTotal,
        'Costo Total (GTQ)': costoTotal,
      }]

      const wsPresupuesto = XLSX.utils.json_to_sheet(presupuestoData, { header: ['Presupuesto Anual (GTQ)', 'Total Fondos Adicionales (GTQ)', 'Total Fondos Externos (GTQ)', 'Costo Total (GTQ)'], skipHeader: false });

      // Ajustar ancho de columnas
      const presupuestoCols = calculateColumnWidths(presupuestoData, ['Presupuesto Anual (GTQ)', 'Total Fondos Adicionales (GTQ)', 'Total Fondos Externos (GTQ)', 'Costo Total (GTQ)']);
      wsPresupuesto['!cols'] = presupuestoCols;

      // Formatear celdas en la hoja de Presupuesto y Fondos
      const rangePresupuesto = XLSX.utils.decode_range(wsPresupuesto['!ref'] || 'A1:D1');
      for (let R = 1; R <= rangePresupuesto.e.r; ++R) { // Empezar en 1 para omitir encabezado
        for (let C = 0; C <= 3; C++) { // Columnas A a D
          const cellAddress = { c: C, r: R };
          const cellRef = XLSX.utils.encode_cell(cellAddress);
          if (wsPresupuesto[cellRef]) {
            wsPresupuesto[cellRef].t = 'n'; // Tipo numérico
            wsPresupuesto[cellRef].z = '"GTQ"#,##0.00'; // Formato moneda GTQ
          }
        }
      }

      XLSX.utils.book_append_sheet(wb, wsPresupuesto, 'Presupuesto y Fondos');

           // Hoja 3: Eventos Aprobados
           const eventosData = approvedEvents.map(event => ({
            'ID Evento': event.eventId,
            'Nombre del Evento': event.name,
            'Costo Total (GTQ)': event.totalCost,
            'Tipo de Evento': event.type,
            'Objetivo': event.objective,
            'Indicador de logro': event.achievementIndicator,
            'Naturaleza': event.eventNature,
            'Campus': event.campus.name,
            'Fecha de Inicio': event.dates.length > 0 ? event.dates[0].startDate : '',
            'Fecha de Fin': event.dates.length > 0 ? event.dates[0].endDate : '',
            'Responsables': event.responsibles.map(responsible => responsible.name).join(', ')
          }));
    
          const wsEventos = XLSX.utils.json_to_sheet(eventosData, { 
            header: [
            'ID Evento', 
            'Nombre del Evento',
            'Costo Total (GTQ)',
            'Tipo de Evento',
            'Objetivo',
            'Indicador de logro',
            'Naturaleza',
            'Campus',
            'Fecha de Inicio',
            'Fecha de Fin',
            'Responsables'], skipHeader: false });
    
          // Ajustar ancho de columnas
          const eventosCols = calculateColumnWidths(eventosData, [
            'ID Evento', 
            'Nombre del Evento',  
            'Costo Total (GTQ)',
            'Tipo de Evento',
            'Objetivo',
            'Indicador de logro',
            'Naturaleza',
            'Campus',
            'Fecha de Inicio',
            'Fecha de Fin',
            'Responsables']);
          wsEventos['!cols'] = eventosCols;
    
          // Formatear celdas en la hoja de Eventos Aprobados
          const rangeEventos = XLSX.utils.decode_range(wsEventos['!ref'] || 'A1:C1');
          for (let R = 1; R <= rangeEventos.e.r; ++R) { // Empezar en 1 para omitir encabezado
            const costoCellAddress = { c: 2, r: R }; // 'Costo Total (GTQ)' es la tercera columna (índice 2)
            const costoCellRef = XLSX.utils.encode_cell(costoCellAddress);
            if (wsEventos[costoCellRef]) {
              wsEventos[costoCellRef].t = 'n'; // Tipo numérico
              wsEventos[costoCellRef].z = '"GTQ"#,##0.00'; // Formato moneda GTQ
            }
          }
    
          XLSX.utils.book_append_sheet(wb, wsEventos, 'Eventos Aprobados');
    
          // Generar el archivo Excel
          const wbout = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
          const blob = new Blob([wbout], { type: 'application/octet-stream' });
          saveAs(blob, 'Informe_de_Costos_POA.xlsx');
        } catch (error) {
          console.error('Error al exportar a Excel:', error);
          alert('Hubo un error al generar el archivo Excel. Por favor, intenta nuevamente.')
        }
      };

  const calculateColumnWidths = (data: any[], headers: string[]) => {
    const colWidths = headers.map(header => header.length)
    data.forEach(row => {
      headers.forEach((header, i) => {
        const value = row[header]
        if (value !== undefined && value !== null) {
          const valueString = typeof value === 'number' ? value.toString() : value.toString()
          if (valueString.length > colWidths[i]) {
            colWidths[i] = valueString.length
          }
        }
      })
    })
    return colWidths.map(width => ({ wch: width + 2 }))
  }

  if (!data) {
    return <div>Cargando...</div>
  }

  return (
    <div id={name} className="mb-6">
      <Card className={`overflow-hidden ${isActive ? 'ring-2 ring-green-400' : ''}`}>
        <div className="p-4 bg-green-50 flex flex-wrap justify-between items-center">
          <h2 className="text-xl font-semibold text-primary mb-2 sm:mb-0">{name}</h2>
          <div className="flex items-center space-x-2">
            {!isMinimized && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="text-primary hover:text-primary hover:bg-green-100"
              >
                {showDetails ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                {showDetails ? 'Ocultar detalles' : 'Mostrar detalles'}
              </Button>
            )}
            <Button
              variant="default"
              onClick={exportToExcel}
              className="ml-2"
            >
              Exportar a Excel
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-primary hover:text-primary hover:bg-green-100"
            >
              {isMinimized ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <div className="p-6 bg-white">
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
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Presupuesto Anual:</span>
                    <span className="text-sm font-bold text-green-600">{formatCurrency(presupuestoAnual)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total fondos adicionales:</span>
                    <span className="text-sm font-bold">{formatCurrency(fondosAdicionalesTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total fondos de fuentes externas:</span>
                    <span className="text-sm font-bold">{formatCurrency(fondosExternosTotal)}</span>
                  </div>
                  <hr className="border-t border-gray-300" />
                </div>

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
                      />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  {financingSourcesWithColors.map((source) => (
                    <span key={source.name} className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-1" 
                        style={{ backgroundColor: source.color }}
                      />
                      {source.name} ({source.percentageOfTotalCost.toFixed(1)}%)
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Eventos Aprobados */}
            <Card className="w-full mt-4">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Eventos Aprobados</CardTitle>
                <CardDescription>Listado de eventos aprobados con su costo total</CardDescription>
              </CardHeader>
              <CardContent>
                {approvedEvents.length === 0 ? (
                  <p>No hay eventos aprobados para mostrar.</p>
                ) : (
                  <div className="space-y-4">
                    <div className="border-b pb-2 flex justify-between items-center">
                      <div className="flex items-center">
                        <button
                          className="flex items-center text-sm font-medium focus:outline-none"
                          onClick={() => handleSort('name')}
                        >
                          Nombre
                          {sortField === 'name' && (
                            sortOrder === 'asc' ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <div className="flex items-center">
                        <button
                          className="flex items-center text-sm font-medium focus:outline-none"
                          onClick={() => handleSort('totalCost')}
                        >
                          Costo Total
                          {sortField === 'totalCost' && (
                            sortOrder === 'asc' ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Lista de eventos paginada */}
                    <div className="space-y-2">
                      {paginatedEvents.map(event => (
                        <div key={event.eventId} className="flex justify-between items-center p-2 border rounded">
                          <span className="font-medium">{event.name}</span>
                          <span className="font-semibold">{formatCurrency(event.totalCost)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Controles de paginación */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-gray-500">
                        Mostrando {((currentPage - 1) * eventsPerPage) + 1} a {Math.min(currentPage * eventsPerPage, sortedApprovedEvents.length)} de {sortedApprovedEvents.length} eventos
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePreviousPage}
                          disabled={currentPage === 1}
                          className="text-primary hover:text-primary hover:bg-green-100"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Anterior
                        </Button>
                        <div className="text-sm font-medium">
                          Página {currentPage} de {totalPages}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleNextPage}
                          disabled={currentPage === totalPages}
                          className="text-primary hover:text-primary hover:bg-green-100"
                        >
                          Siguiente
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
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
      </Card>
    </div>
  )
}

