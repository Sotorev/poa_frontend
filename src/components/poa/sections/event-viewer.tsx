'use client';

import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

// Definición de Interfaces
interface DateRange {
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

interface StrategicArea {
  strategicAreaId: number;
  name: string;
  peiId: number;
  isDeleted: boolean;
}

interface StrategicObjective {
  strategicObjectiveId: number;
  description: string;
  strategicAreaId: number;
  isDeleted: boolean;
  strategicArea: StrategicArea;
}

interface Strategy {
  strategyId: number;
  description: string;
  strategicObjectiveId: number;
  completionPercentage: number;
  assignedBudget: number;
  executedBudget: number | null;
  isDeleted: boolean;
  strategicObjective: StrategicObjective;
}

interface EventIntervention {
  eventId: number;
  interventionId: number;
  isDeleted: boolean;
}

interface Intervention {
  interventionId: number;
  name: string;
  isDeleted: boolean;
  strategyId: number;
  eventIntervention: EventIntervention;
  strategy: Strategy;
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
  currentStudentCount: number | null;
}

interface Event {
  eventId: number;
  name: string;
  type: string;
  submissionDate: string | null;
  poaId: number;
  statusId: number;
  completionPercentage: number;
  campusId: number;
  eventNature: string;
  isDeleted: boolean;
  objective: string;
  isDelayed: boolean;
  achievementIndicator: string;
  purchaseType: string;
  totalCost: number;
  processDocumentPath: string | null;
  dates: DateRange[];
  financings: Financing[];
  resources: string[];
  responsibles: Responsible[];
  feedbacks: any[]; // Ajusta según la estructura real
  costDetails: any[]; // Ajusta según la estructura real
  status: Status;
  campus: Campus;
  interventions: Intervention[];
}

interface SectionProps {
  name: string;
  isActive: boolean;
  poaId: number | null;
}

export function EventViewerComponent({ name, isActive, poaId }: SectionProps) {
  const [eventsInReview, setEventsInReview] = useState<Event[]>([]);
  const [approvedEvents, setApprovedEvents] = useState<Event[]>([]);
  const [rejectedEvents, setRejectedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener los eventos desde la API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fullEvent/poa/${poaId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data: Event[] = await response.json();

        // Clasificar los eventos según su statusId
        const inReview: Event[] = [];
        const approved: Event[] = [];
        const rejected: Event[] = [];

        data.forEach(event => {
          if (event.statusId === 5) { // statusId 5: En Revisión
            inReview.push(event);
          } else if (event.statusId === 1) { // statusId 1: Aprobado
            approved.push(event);
          } else if (event.statusId === 2) { // statusId 2: Rechazado
            rejected.push(event);
          }
        });

        setEventsInReview(inReview);
        setApprovedEvents(approved);
        setRejectedEvents(rejected);
      } catch (err: any) {
        setError(err.message || 'Error al obtener los eventos');
      } finally {
        setLoading(false);
      }
    };

    if (poaId !== null) {
      fetchEvents();
    }
  }, [poaId]);

  // Función para actualizar el estado del evento en el backend
  const updateEventStatus = async (eventId: number, newStatusId: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // Incluye aquí los encabezados de autenticación necesarios
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        credentials: 'include',
        body: JSON.stringify({ statusId: newStatusId }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Suponiendo que la respuesta del PUT devuelve el evento actualizado
      const updatedEvent: Event = await response.json();

      // Eliminar el evento de todas las categorías actuales
      setEventsInReview(prev => prev.filter(event => event.eventId !== eventId));
      setApprovedEvents(prev => prev.filter(event => event.eventId !== eventId));
      setRejectedEvents(prev => prev.filter(event => event.eventId !== eventId));

      // Agregar el evento a la nueva categoría según el nuevo statusId
      if (newStatusId === 5) {
        setEventsInReview(prev => [...prev, updatedEvent]);
      } else if (newStatusId === 1) {
        setApprovedEvents(prev => [...prev, updatedEvent]);
      } else if (newStatusId === 2) {
        setRejectedEvents(prev => [...prev, updatedEvent]);
      }

    } catch (err: any) {
      console.error(`Error al actualizar el estado del evento ${eventId}:`, err);
      // Opcional: Puedes mostrar una notificación al usuario
    }
  };

  // Funciones para manejar acciones
  const handleApprove = async (eventId: number) => {
    await updateEventStatus(eventId, 1); // statusId 1: Aprobado
  };

  const handleReject = async (eventId: number) => {
    await updateEventStatus(eventId, 2); // statusId 2: Rechazado
  };

  const handleMoveToReview = async (eventId: number) => {
    await updateEventStatus(eventId, 5); // statusId 5: En revisión
  };

  // Funciones de renderizado
  const renderMultipleItems = (items: string[] | undefined | null) => {
    if (!items || items.length === 0) {
      return <span>No aplica</span>;
    }
    return (
      <div className="space-y-1">
        {items.map((item, index) => (
          <div key={index}>{item}</div>
        ))}
      </div>
    );
  };

  const renderSingleItem = (item: string | number | null | undefined) => {
    return item !== null && item !== undefined && item !== '' ? item : 'No aplica';
  };

  const renderEventTable = (
    events: Event[],
    tableType: 'review' | 'approved' | 'rejected'
  ) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {/* Columnas de la tabla */}
            <TableHead className="w-48 min-w-[12rem]">Área Estratégica</TableHead>
            <TableHead className="w-48 min-w-[12rem]">Objetivo Estratégico</TableHead>
            <TableHead className="w-48 min-w-[12rem]">Estrategias</TableHead>
            <TableHead className="w-48 min-w-[12rem]">Intervención</TableHead>
            <TableHead className="w-48 min-w-[12rem]">Tipo de Evento</TableHead>
            <TableHead className="w-48 min-w-[12rem]">Evento</TableHead>
            <TableHead className="w-48 min-w-[12rem]">Objetivo del Evento</TableHead>
            <TableHead className="w-48 min-w-[12rem]">Naturaleza del Evento</TableHead>
            <TableHead className="w-48 min-w-[12rem]">Fechas</TableHead>
            <TableHead className="w-48 min-w-[12rem]">Costo Total</TableHead>
            <TableHead className="w-48 min-w-[12rem]">Aporte UMES</TableHead>
            <TableHead className="w-48 min-w-[12rem]">Aporte Otra Fuente</TableHead>
            <TableHead className="w-48 min-w-[12rem]">Tipo de Compra</TableHead>
            <TableHead className="w-48 min-w-[12rem]">Detalle de Costos</TableHead>
            <TableHead className="w-48 min-w-[12rem]">Responsables</TableHead>
            <TableHead className="w-48 min-w-[12rem]">Recursos</TableHead>
            <TableHead className="w-48 min-w-[12rem]">Indicador de Logro</TableHead>
            <TableHead className="w-48 min-w-[12rem]">Detalle de Planificación</TableHead>
            <TableHead className="w-48 min-w-[12rem]">Campus</TableHead>
            <TableHead className="w-48 min-w-[12rem]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.eventId}>
              {/* Área Estratégica */}
              <TableCell className="whitespace-normal">
                {event.interventions && event.interventions.length > 0
                  ? renderMultipleItems(
                      Array.from(new Set(
                        event.interventions.map(
                          (interv) => interv?.strategy?.strategicObjective?.strategicArea?.name
                        )
                      )).map(name => name || 'No aplica')
                    )
                  : 'No aplica'}
              </TableCell>

              {/* Objetivo Estratégico */}
              <TableCell className="whitespace-normal">
                {event.interventions && event.interventions.length > 0
                  ? renderMultipleItems(
                      Array.from(new Set(
                        event.interventions.map(
                          (interv) => interv?.strategy?.strategicObjective?.description
                        )
                      )).map(desc => desc || 'No aplica')
                    )
                  : 'No aplica'}
              </TableCell>

              {/* Estrategias */}
              <TableCell className="whitespace-normal">
                {event.interventions && event.interventions.length > 0
                  ? renderMultipleItems(
                      Array.from(new Set(
                        event.interventions.map(
                          (interv) => interv?.strategy?.description
                        )
                      )).map(desc => desc || 'No aplica')
                    )
                  : 'No aplica'}
              </TableCell>

              {/* Intervención */}
              <TableCell className="whitespace-normal">
                {event.interventions && event.interventions.length > 0
                  ? renderMultipleItems(
                      event.interventions.map((interv) => interv?.name || 'No aplica')
                    )
                  : 'No aplica'}
              </TableCell>

              {/* Tipo de Evento */}
              <TableCell className="whitespace-normal">
                {renderSingleItem(event.type)}
              </TableCell>

              {/* Evento */}
              <TableCell className="whitespace-normal">
                {renderSingleItem(event.name)}
              </TableCell>

              {/* Objetivo del Evento */}
              <TableCell className="whitespace-normal">
                {renderSingleItem(event.objective)}
              </TableCell>

              {/* Naturaleza del Evento */}
              <TableCell className="whitespace-normal">
                {renderSingleItem(event.eventNature)}
              </TableCell>

              {/* Fechas */}
              <TableCell className="whitespace-normal">
                {event.dates && event.dates.length > 0
                  ? event.dates.map((date) => (
                      <div key={date.eventDateId}>
                        {new Date(date.startDate).toLocaleDateString()} -{' '}
                        {new Date(date.endDate).toLocaleDateString()}
                      </div>
                    ))
                  : 'No aplica'}
              </TableCell>

              {/* Costo Total */}
              <TableCell className="whitespace-normal">
                {event.totalCost ? `Q${event.totalCost.toLocaleString()}` : 'No aplica'}
              </TableCell>

              {/* Aporte UMES */}
              <TableCell className="whitespace-normal">
                {event.financings && event.financings.length > 0
                  ? renderMultipleItems(
                      event.financings
                        .filter((fin) => fin.financingSourceId === 1)
                        .map(
                          (fin) =>
                            `Fuente ${fin.financingSourceId}: Q${fin.amount.toLocaleString()} (${fin.percentage}%)`
                        )
                    )
                  : 'No aplica'}
              </TableCell>

              {/* Aporte Otra Fuente */}
              <TableCell className="whitespace-normal">
                {event.financings && event.financings.length > 0
                  ? renderMultipleItems(
                      event.financings
                        .filter((fin) => fin.financingSourceId !== 1)
                        .map(
                          (fin) =>
                            `Fuente ${fin.financingSourceId}: Q${fin.amount.toLocaleString()} (${fin.percentage}%)`
                        )
                    )
                  : 'No aplica'}
              </TableCell>

              {/* Tipo de Compra */}
              <TableCell className="whitespace-normal">
                {renderSingleItem(event.purchaseType)}
              </TableCell>

              {/* Detalle de Costos */}
              <TableCell className="whitespace-normal">
                {event.costDetails && event.costDetails.length > 0
                  ? renderMultipleItems(
                      event.costDetails.map((cost, index) => `Detalle ${index + 1}`)
                    )
                  : 'No aplica'}
              </TableCell>

              {/* Responsables */}
              <TableCell className="whitespace-normal">
                {event.responsibles && event.responsibles.length > 0
                  ? renderMultipleItems(event.responsibles.map((r) => r.name))
                  : 'No aplica'}
              </TableCell>

              {/* Recursos */}
              <TableCell className="whitespace-normal">
                {event.resources && event.resources.length > 0
                  ? renderMultipleItems(event.resources)
                  : 'No aplica'}
              </TableCell>

              {/* Indicador de Logro */}
              <TableCell className="whitespace-normal">
                {renderSingleItem(event.achievementIndicator)}
              </TableCell>

              {/* Detalle de Planificación */}
              <TableCell className="whitespace-normal">
                {event.feedbacks && event.feedbacks.length > 0
                  ? 'Planificación en curso'
                  : 'No aplica'}
              </TableCell>

              {/* Campus */}
              <TableCell className="whitespace-normal">
                {event.campus?.name ? event.campus.name : 'No aplica'}
              </TableCell>

              {/* Acciones */}
              <TableCell className="whitespace-normal">
                <div className="flex flex-col space-y-2">
                  {tableType === 'review' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleApprove(event.eventId)}
                      >
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="sr-only">Aprobar</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReject(event.eventId)}
                      >
                        <X className="h-4 w-4 text-red-500" />
                        <span className="sr-only">Rechazar</span>
                      </Button>
                    </>
                  )}
                  {(tableType === 'approved' || tableType === 'rejected') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveToReview(event.eventId)}
                    >
                      <X className="h-4 w-4 text-red-500" />
                      <span className="sr-only">Volver a revisión</span>
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  if (loading) {
    return <div className="p-4">Cargando eventos...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Visualizar eventos</h1>

      <div className="space-y-8">
        {/* Eventos en Revisión */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Eventos en Revisión</h2>
          {renderEventTable(eventsInReview, 'review')}
        </section>

        {/* Eventos Aprobados */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Eventos Aprobados</h2>
          {renderEventTable(approvedEvents, 'approved')}
        </section>

        {/* Eventos Rechazados */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Eventos Rechazados</h2>
          {renderEventTable(rejectedEvents, 'rejected')}
        </section>
      </div>
    </div>
  );
}
