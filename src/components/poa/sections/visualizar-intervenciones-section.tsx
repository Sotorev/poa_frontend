"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Info, Check, X, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { formatCurrency } from '@/utils/formatCurrency';

// Definir las interfaces
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

interface Status {
  statusId: number;
  name: string;
  isDeleted: boolean;
}

interface Campus {
  campusId: number;
  name: string;
  city: string;
  department: string;
  isDeleted: boolean;
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
  status?: Status;        // Agregado para mapear el nombre del estado
  campus?: Campus;        // Agregado para mapear el nombre del campus
}

interface SectionProps {
  name: string;
  isActive: boolean;
  poaId: string | null; // Incluir poaId en las props
}

export function VisualizarIntervencionesSection({ name, isActive, poaId }: SectionProps) {
  console.log("POA ID:", poaId); // Imprimir el poaId para verificar
  const [isMinimized, setIsMinimized] = useState(false);

  const [intervenciones, setIntervenciones] = useState<Intervencion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<number | null>(null); // ID de la intervención que se está actualizando

  useEffect(() => {
    if (poaId !== null && poaId !== undefined) {
      fetchIntervenciones();
    }
  }, [poaId]);

  const fetchIntervenciones = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fullEvent/poa/${poaId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
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

  // Función para actualizar el statusId de una intervención
  const handleUpdateStatus = async (id: number, newStatusId: number) => {
    setUpdating(id); // Indicar que se está actualizando esta intervención
    setError(null); // Limpiar errores previos

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ statusId: newStatusId }),
      });

      if (!response.ok) {
        throw new Error(`Error al actualizar: ${response.statusText}`);
      }

      // Determinar el nombre del estado basado en el nuevo statusId
      let newStatusName = '';
      switch (newStatusId) {
        case 1:
          newStatusName = 'En revisión';
          break;
        case 3:
          newStatusName = 'Aprobado';
          break;
        case 4:
          newStatusName = 'Rechazado';
          break;
        default:
          newStatusName = 'Desconocido';
      }

      // Actualizar el estado localmente
      setIntervenciones(prevIntervenciones =>
        prevIntervenciones.map(intervencion =>
          intervencion.eventId === id
            ? { 
                ...intervencion, 
                statusId: newStatusId, 
                status: { 
                  ...intervencion.status, 
                  statusId: newStatusId, 
                  name: newStatusName 
                } 
              }
            : intervencion
        )
      );
    } catch (err) {
      if (err instanceof Error) {
        setError(`Error al actualizar la intervención ${id}: ${err.message}`);
      } else {
        setError(`Ocurrió un error desconocido al actualizar la intervención ${id}.`);
      }
    } finally {
      setUpdating(null); // Finalizar el estado de actualización
    }
  };

  // Filtrar intervenciones en Aprobadas y No Aprobadas
  const aprobadas = intervenciones.filter(intervencion => intervencion.statusId === 3); // statusId 3 = Aprobado
  const noAprobadas = intervenciones.filter(intervencion => intervencion.statusId === 1 || intervencion.statusId === 4); // statusId 1 o 4 = No Aprobado

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
          <TableHead>Nombre</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>% Completado</TableHead>
          <TableHead>Campus</TableHead>
          <TableHead>Naturaleza del Evento</TableHead>
          <TableHead>Objetivo</TableHead>
          <TableHead>Indicador de Logro</TableHead>
          <TableHead>Tipo de Compra</TableHead>
          <TableHead>Costo Total</TableHead>
          <TableHead>Fechas</TableHead>
          <TableHead>Financiamientos</TableHead>
          <TableHead>Responsables</TableHead>
          <TableHead>Documento del Proceso</TableHead>
          <TableHead>Comentarios</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {intervenciones.map(intervencion => (
          <TableRow key={intervencion.eventId}>
            <TableCell>{intervencion.name || '-'}</TableCell>
            <TableCell>{intervencion.type || '-'}</TableCell>
            <TableCell>{intervencion.status?.name || '-'}</TableCell> {/* Nombre del estado */}
            <TableCell>{intervencion.completionPercentage !== undefined ? `${intervencion.completionPercentage}%` : '-'}</TableCell>
            <TableCell>{intervencion.campus?.name || '-'}</TableCell> {/* Nombre del campus */}
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
              {intervencion.objective || '-'}
            </TableCell>
            <TableCell>
              {isAprobadas ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleUpdateStatus(intervencion.eventId || 0, 1)} // No Aprobar: statusId = 1
                  aria-label={`No Aprobar intervención ${intervencion.eventId || 'desconocido'}`}
                  disabled={updating === intervencion.eventId}
                >
                  {updating === intervencion.eventId ? '...' : <X className="h-4 w-4 text-red-500" />}
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleUpdateStatus(intervencion.eventId || 0, 3)} // Aprobar: statusId = 3
                    aria-label={`Aprobar intervención ${intervencion.eventId || 'desconocido'}`}
                    disabled={updating === intervencion.eventId}
                  >
                    {updating === intervencion.eventId ? '...' : <Check className="h-4 w-4 text-green-500" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleUpdateStatus(intervencion.eventId || 0, 4)} // No Aprobar: statusId = 4
                    aria-label={`No Aprobar intervención ${intervencion.eventId || 'desconocido'}`}
                    disabled={updating === intervencion.eventId}
                  >
                    {updating === intervencion.eventId ? '...' : <X className="h-4 w-4 text-red-500" />}
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
            {/* Botón de Editar Eliminado */}
            <Button variant="ghost" size="icon" onClick={() => setIsMinimized(!isMinimized)}>
              {isMinimized ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        {!isMinimized && (
          <div className="p-4 bg-white">
            {/* Formulario de Filtros Eliminado */}

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

            {/* Botón para guardar cambios Eliminado */}
            {/* {isEditing && (
              <Button onClick={handleSave} className="mt-4">
                Guardar Cambios
              </Button>
            )} */}

            <div className="mt-6 flex justify-end">
              {/* Puedes agregar más controles aquí si es necesario */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
