'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Info, Check, X, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';

// Interfaces
interface DateEntry {
  eventDateId: number;
  eventId: number;
  startDate: string;
  endDate: string;
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
  eventId: number;
  name: string;
  type: string;
  submissionDate: string | null;
  poaId: number;
  statusId: number;
  completionPercentage: number;
  campusId: number;
  eventNature: string;
  objective: string;
  isDelayed: boolean;
  achievementIndicator: string;
  purchaseType: string;
  totalCost: number;
  processDocumentPath: string | null;
  dates: DateEntry[];
  financings: Financing[];
  resources: string[];
  responsibles: Responsible[];
  feedbacks: any[];
  costDetails: any[];
  status: Status;
  campus: Campus;
}

interface SectionProps {
  name: string;
  isActive: boolean;
  poaId: number | null;
}

export function VisualizarIntervencionesSection({ name, isActive, poaId }: SectionProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [intervenciones, setIntervenciones] = useState<Intervencion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    if (poaId !== null) {
      fetchIntervenciones();
    }
  }, [poaId]);

  const fetchIntervenciones = async () => {
    if (poaId === null) return;
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
      setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, newStatusId: number) => {
    setUpdating(id);
    setError(null);

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

      const newStatusName = getStatusName(newStatusId);

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
      setError(err instanceof Error ? `Error al actualizar la intervención ${id}: ${err.message}` : `Ocurrió un error desconocido al actualizar la intervención ${id}.`);
    } finally {
      setUpdating(null);
    }
  };

  const getStatusName = (statusId: number): string => {
    switch (statusId) {
      case 1: return 'En revisión';
      case 3: return 'Aprobado';
      case 4: return 'Rechazado';
      default: return 'Desconocido';
    }
  };

  const aprobadas = intervenciones.filter(intervencion => intervencion.statusId === 3);
  const noAprobadas = intervenciones.filter(intervencion => intervencion.statusId === 1 || intervencion.statusId === 4);

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
            <TableCell>{intervencion.name}</TableCell>
            <TableCell>{intervencion.type}</TableCell>
            <TableCell>{intervencion.status.name}</TableCell>
            <TableCell>{`${intervencion.completionPercentage}%`}</TableCell>
            <TableCell>{intervencion.campus.name}</TableCell>
            <TableCell>{intervencion.eventNature}</TableCell>
            <TableCell>{intervencion.objective}</TableCell>
            <TableCell>{intervencion.achievementIndicator}</TableCell>
            <TableCell>{intervencion.purchaseType}</TableCell>
            <TableCell>{formatCurrency(intervencion.totalCost)}</TableCell>
            <TableCell>
              {intervencion.dates.map(date => `${format(new Date(date.startDate), 'dd/MM/yyyy')} - ${format(new Date(date.endDate), 'dd/MM/yyyy')}`).join(', ')}
            </TableCell>
            <TableCell>
              {intervencion.financings.map(financing => `${financing.amount} (${financing.percentage}%)`).join(', ')}
            </TableCell>
            <TableCell>
              {intervencion.responsibles.map(responsible => `${responsible.name} (${responsible.responsibleRole})`).join(', ')}
            </TableCell>
            <TableCell>
              {intervencion.processDocumentPath && (
                <Button variant="ghost" size="icon" onClick={() => window.open(intervencion.processDocumentPath || '', '_blank')}>
                  <Download className="h-4 w-4" />
                </Button>
              )}
            </TableCell>
            <TableCell>
              {intervencion.objective}
            </TableCell>
            <TableCell>
              {isAprobadas ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleUpdateStatus(intervencion.eventId, 1)}
                  aria-label={`No Aprobar intervención ${intervencion.eventId}`}
                  disabled={updating === intervencion.eventId}
                >
                  {updating === intervencion.eventId ? '...' : <X className="h-4 w-4 text-red-500" />}
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleUpdateStatus(intervencion.eventId, 3)}
                    aria-label={`Aprobar intervención ${intervencion.eventId}`}
                    disabled={updating === intervencion.eventId}
                  >
                    {updating === intervencion.eventId ? '...' : <Check className="h-4 w-4 text-green-500" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleUpdateStatus(intervencion.eventId, 4)}
                    aria-label={`No Aprobar intervención ${intervencion.eventId}`}
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
      <div className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ${isActive ? 'ring-2 ring-green-400' : ''}`}>
        <div className="p-4 bg-green-50 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">{name}</h2>
          <Button variant="ghost" size="icon" onClick={() => setIsMinimized(!isMinimized)}>
            {isMinimized ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>
        {!isMinimized && (
          <div className="p-4 bg-white">
            {loading ? (
              <p>Cargando intervenciones...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-2">Intervenciones No Aprobadas</h3>
                {noAprobadas.length > 0 ? renderTabla(noAprobadas, false) : <p>No hay intervenciones no aprobadas.</p>}

                <h3 className="text-lg font-semibold mt-6 mb-2">Intervenciones Aprobadas</h3>
                {aprobadas.length > 0 ? renderTabla(aprobadas, true) : <p>No hay intervenciones aprobadas.</p>}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}