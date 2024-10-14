"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, ChevronDown, ChevronUp, Edit, Info, Check, X, Download } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from '@/utils/formatCurrency';
import { useForm, SubmitHandler } from 'react-hook-form';

// Importar las interfaces definidas
// Puedes mover estas interfaces a un archivo separado si lo prefieres
interface DateEntry {
  eventDateId: number;
  eventId: number;
  startDate: string; // Formato ISO: "2023-12-31"
  endDate: string;   // Formato ISO: "2024-01-04"
  isDeleted: boolean;
}

interface Financing {
  eventFinancingId: number;
  eventId: number;
  financingSourceId: number;
  amount: number;
  percentage: number;
  isDeleted: boolean;
}

interface Responsible {
  eventResponsibleId: number;
  eventId: number;
  responsibleRole: string;
  isDeleted: boolean;
  name: string;
}

interface Intervencion {
  eventId?: number;
  name?: string;
  type?: string;
  submissionDate?: string | null;
  poaId?: number;
  statusId?: number;
  completionPercentage?: number;
  campusId?: number;
  eventNature?: string;
  isDeleted?: boolean;
  objective?: string;
  isDelayed?: boolean;
  achievementIndicator?: string;
  purchaseType?: string;
  totalCost?: number;
  processDocumentPath?: string | null;
  dates?: DateEntry[];
  financings?: Financing[];
  resources?: string[];
  responsibles?: Responsible[];
  feedbacks?: any[];      // Si tienes una estructura específica, puedes definirla
  costDetails?: any[];    // Si tienes una estructura específica, puedes definirla
}

interface SectionProps {
  name: string;
  isActive: boolean;
  poaId: string | null; // Incluir poaId en las props
}

interface FilterFormInputs {
  fechaInicio?: Date;
  fechaFin?: Date;
  area: string;
  estrategia: string;
}

export function VisualizarIntervencionesSection({ name, isActive, poaId }: SectionProps) {
  console.log("POA ID:", poaId); // Imprimir el poaId para verificar
  const [isMinimized, setIsMinimized] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [intervenciones, setIntervenciones] = useState<Intervencion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Configuración de react-hook-form sin validación
  const { register, handleSubmit, watch, setValue } = useForm<FilterFormInputs>({
    defaultValues: {
      area: "all",
      estrategia: "all",
    },
  });

  // Manejo de los filtros aplicados
  const [filters, setFilters] = useState<FilterFormInputs>({
    fechaInicio: undefined,
    fechaFin: undefined,
    area: "all",
    estrategia: "all",
  });

  useEffect(() => {
    if (poaId !== null && poaId !== undefined) {
      fetchIntervenciones();
    }
  }, [poaId]);
  

  const fetchIntervenciones = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Consultando intervenciones para POA ID:", poaId); // Imprimir el poaId para verificar
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fullevent/poa/${poaId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.statusText}`);
      }

      const data: Intervencion[] = await response.json();

      setIntervenciones(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error desconocido.');
      }
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (data: FilterFormInputs) => {
    setFilters(data);
  };

  const onSubmit: SubmitHandler<FilterFormInputs> = (data) => {
    applyFilters(data);
  };

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    setIsEditing(false);
    // Aquí iría la lógica para guardar los datos en el backend
  };

  const handleApproveReject = (id: number, action: 'aprobado' | 'rechazado' | 'revision') => {
    setIntervenciones(intervenciones.map(intervencion =>
      intervencion.eventId === id ? { ...intervencion, statusId: action === 'aprobado' ? 2 : action === 'rechazado' ? 3 : 1 } : intervencion
    ));
  };

  const handleCommentChange = (id: number, comment: string) => {
    setIntervenciones(intervenciones.map(intervencion =>
      intervencion.eventId === id ? { ...intervencion, objective: comment } : intervencion
    ));
  };

  // Filtrado de intervenciones según los filtros aplicados
  const filteredIntervenciones = intervenciones.filter(intervencion => {
    const cumpleFechaInicio = filters.fechaInicio ? new Date(intervencion.dates?.[0]?.startDate || 0) >= filters.fechaInicio : true;
    const cumpleFechaFin = filters.fechaFin ? new Date(intervencion.dates?.[0]?.endDate || 0) <= filters.fechaFin : true;
    const cumpleArea = filters.area !== "all" ? intervencion.eventNature === filters.area : true;
    const cumpleEstrategia = filters.estrategia !== "all" ? (intervencion.responsibles?.some(r => r.responsibleRole === filters.estrategia)) : true;
    return cumpleFechaInicio && cumpleFechaFin && cumpleArea && cumpleEstrategia;
  });

  const aprobadas = filteredIntervenciones.filter(intervencion => intervencion.statusId === 2); // Asumiendo statusId 2 = aprobado
  const noAprobadas = filteredIntervenciones.filter(intervencion => intervencion.statusId !== 2);

  // Función para renderizar información adicional en las columnas
  const renderColumnInfo = (title: string, content: string) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <Info className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <h3 className="font-semibold">{title}</h3>
        <p>{content}</p>
      </PopoverContent>
    </Popover>
  );

  // Función para renderizar la tabla de intervenciones
  const renderTabla = (intervenciones: Intervencion[], isAprobadas: boolean) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Event ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>POA ID</TableHead>
          <TableHead>Status ID</TableHead>
          <TableHead>Completion %</TableHead>
          <TableHead>Campus ID</TableHead>
          <TableHead>Event Nature</TableHead>
          <TableHead>Objective</TableHead>
          <TableHead>Achievement Indicator</TableHead>
          <TableHead>Purchase Type</TableHead>
          <TableHead>Total Cost</TableHead>
          <TableHead>Dates</TableHead>
          <TableHead>Financings</TableHead>
          <TableHead>Responsibles</TableHead>
          <TableHead>Process Document</TableHead>
          <TableHead>Comments</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {intervenciones.map(intervencion => (
          <TableRow key={intervencion.eventId}>
            <TableCell>{intervencion.eventId || '-'}</TableCell>
            <TableCell>{intervencion.name || '-'}</TableCell>
            <TableCell>{intervencion.type || '-'}</TableCell>
            <TableCell>{intervencion.poaId || '-'}</TableCell>
            <TableCell>{intervencion.statusId || '-'}</TableCell>
            <TableCell>{intervencion.completionPercentage !== undefined ? `${intervencion.completionPercentage}%` : '-'}</TableCell>
            <TableCell>{intervencion.campusId || '-'}</TableCell>
            <TableCell>{intervencion.eventNature || '-'}</TableCell>
            <TableCell>{intervencion.objective || '-'}</TableCell>
            <TableCell>{intervencion.achievementIndicator || '-'}</TableCell>
            <TableCell>{intervencion.purchaseType || '-'}</TableCell>
            <TableCell>{intervencion.totalCost !== undefined ? formatCurrency(intervencion.totalCost) : '-'}</TableCell>
            <TableCell>
              {intervencion.dates && intervencion.dates.length > 0
                ? intervencion.dates.map(date => `${format(new Date(date.startDate), 'dd/MM/yyyy')} - ${format(new Date(date.endDate), 'dd/MM/yyyy')}`).join(', ')
                : '-'}
            </TableCell>
            <TableCell>
              {intervencion.financings && intervencion.financings.length > 0
                ? intervencion.financings.map(financing => `${financing.amount} (${financing.percentage}%)`).join(', ')
                : '-'}
            </TableCell>
            <TableCell>
              {intervencion.responsibles && intervencion.responsibles.length > 0
                ? intervencion.responsibles.map(responsible => `${responsible.name} (${responsible.responsibleRole})`).join(', ')
                : '-'}
            </TableCell>
            <TableCell>
              {intervencion.processDocumentPath ? (
                <Button variant="ghost" size="icon" onClick={() => window.open(intervencion.processDocumentPath, '_blank')}>
                  <Download className="h-4 w-4" />
                </Button>
              ) : '-'}
            </TableCell>
            <TableCell>
              {/* Aquí puedes mapear otros campos como comentarios si existen */}
              {intervencion.objective || '-'}
            </TableCell>
            <TableCell>
              {isAprobadas ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleApproveReject(intervencion.eventId || 0, 'revision')}
                  aria-label={`Desaprobar intervención ${intervencion.eventId || 'desconocido'}`}
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleApproveReject(intervencion.eventId || 0, 'aprobado')}
                    aria-label={`Aprobar intervención ${intervencion.eventId || 'desconocido'}`}
                  >
                    <Check className="h-4 w-4 text-green-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleApproveReject(intervencion.eventId || 0, 'rechazado')}
                    aria-label={`Rechazar intervención ${intervencion.eventId || 'desconocido'}`}
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div id={name} className="mb-6">
      <div
        className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ${
          isActive ? 'ring-2 ring-green-400' : ''
        }`}
      >
        <div className="p-4 bg-green-50 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">{name}</h2>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? "Cancelar" : "Editar"}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsMinimized(!isMinimized)}>
              {isMinimized ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        {!isMinimized && (
          <div className="p-4 bg-white">
            {/* Formulario de filtros */}
            <form onSubmit={handleSubmit(onSubmit)} className="mb-4 flex flex-wrap gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    type="button"
                    className={`w-[280px] justify-start text-left font-normal ${
                      !watch('fechaInicio') && "text-muted-foreground"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.fechaInicio ? format(filters.fechaInicio, "PPP", { locale: es }) : <span>Fecha Inicio</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.fechaInicio}
                    onSelect={(date) => {
                      setValue('fechaInicio', date || undefined);
                      applyFilters({ ...filters, fechaInicio: date || undefined });
                    }}
                    locale={es}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    type="button"
                    className={`w-[280px] justify-start text-left font-normal ${
                      !watch('fechaFin') && "text-muted-foreground"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.fechaFin ? format(filters.fechaFin, "PPP", { locale: es }) : <span>Fecha Fin</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.fechaFin}
                    onSelect={(date) => {
                      setValue('fechaFin', date || undefined);
                      applyFilters({ ...filters, fechaFin: date || undefined });
                    }}
                    locale={es}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Select
                value={filters.area}
                onValueChange={(value) => {
                  setValue('area', value);
                  applyFilters({ ...filters, area: value });
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrar por Área" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las áreas</SelectItem>
                  <SelectItem value="Planificado">Planificado</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                  {/* Agrega más áreas según sea necesario */}
                </SelectContent>
              </Select>
              <Select
                value={filters.estrategia}
                onValueChange={(value) => {
                  setValue('estrategia', value);
                  applyFilters({ ...filters, estrategia: value });
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrar por Estrategia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las estrategias</SelectItem>
                  <SelectItem value="Principal">Principal</SelectItem>
                  <SelectItem value="Secundario">Secundario</SelectItem>
                  {/* Agrega más estrategias según sea necesario */}
                </SelectContent>
              </Select>
              <Button type="submit">Aplicar Filtros</Button>
            </form>

            {/* Estado de carga y errores */}
            {loading ? (
              <p>Cargando intervenciones...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <>
                {/* Intervenciones No Aprobadas */}
                <h3 className="text-lg font-semibold mb-2">Intervenciones No Aprobadas</h3>
                {noAprobadas.length > 0 ? renderTabla(noAprobadas, false) : <p>No hay intervenciones no aprobadas.</p>}

                {/* Intervenciones Aprobadas */}
                <h3 className="text-lg font-semibold mt-6 mb-2">Intervenciones Aprobadas</h3>
                {aprobadas.length > 0 ? renderTabla(aprobadas, true) : <p>No hay intervenciones aprobadas.</p>}
              </>
            )}

            {/* Botón para guardar cambios si está en modo edición */}
            {isEditing && (
              <Button onClick={handleSave} className="mt-4">
                Guardar Cambios
              </Button>
            )}

            <div className="mt-6 flex justify-end">
              {/* Puedes agregar más controles aquí si es necesario */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
