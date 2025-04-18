"use client";

// events-viewer.tsx

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from 'lucide-react';
import { PlanningEvent, SectionProps, ApiEvent } from '@/types/interfaces';
import EventTable from './EventTable';
import { useCurrentUser } from '@/hooks/use-current-user';

// Función para mapear datos de la API a PlanningEvent
function mapApiEventToPlanningEvent(apiEvent: ApiEvent): PlanningEvent {
  const estadoMap: { [key: string]: 'revision' | 'aprobado' | 'rechazado' | 'correccion' } = {
    'Pendiente': 'revision',
    'Aprobado': 'aprobado',
    'Rechazado': 'rechazado',
    'Aprobado con Correcciones': 'correccion'
  };

  const estado = estadoMap[apiEvent.eventApprovals[0]?.approvalStatus?.name || 'Pendiente'] || 'revision';

  return {
    id: String(apiEvent.eventId),
    areaEstrategica: apiEvent.interventions[0]?.strategy?.strategicArea?.name || '',
    objetivoEstrategico: apiEvent.interventions[0]?.strategy?.strategicArea?.strategicObjective || '',
    estrategias: apiEvent.interventions[0]?.strategy?.description || '',
    intervencion: apiEvent.interventions[0]?.name || '',
    ods: apiEvent.ods.map(ods => ods.name).join(', '),
    tipoEvento: apiEvent.type === 'Actividad' ? 'actividad' : 'proyecto',
    evento: apiEvent.name,
    objetivo: apiEvent.objective,
    fechas: apiEvent.dates.map(date => ({
      eventDateId: date.eventDateId,
      inicio: date.startDate,
      fin: date.endDate,
      isDeleted: date.isDeleted
    })),
    costoTotal: apiEvent.totalCost,
    aporteUMES: apiEvent.financings
      .filter(f => [1, 4, 5, 7].includes(f.financingSourceId))
      .map(f => ({
        eventFinancingId: f.eventFinancingId,
        financingSourceId: f.financingSourceId,
        percentage: f.percentage,
        amount: f.amount,
        isDeleted: f.isDeleted
      })),
    aporteOtros: apiEvent.financings
      .filter(f => [2, 3, 6].includes(f.financingSourceId))
      .map(f => ({
        eventFinancingId: f.eventFinancingId,
        financingSourceId: f.financingSourceId,
        percentage: f.percentage,
        amount: f.amount,
        isDeleted: f.isDeleted
      })),
    tipoCompra: apiEvent.purchaseType?.name || '',
      detalle: apiEvent.costDetails.map(detail => ({
      costDetailId: detail.costDetailId,
      eventId: detail.eventId,
      filePath: detail.filePath,
      fileName: detail.fileName,
      isDeleted: detail.isDeleted
    })) || [], // Ajusta el nombre del campo según los datos reales
    responsables: apiEvent.responsibles.map(r => ({
      eventResponsibleId: r.eventResponsibleId,
      responsibleRole: r.responsibleRole,
      name: r.name
    })),
    recursos: apiEvent.institutionalResources.map(r => r.name).join(', '),
    indicadorLogro: apiEvent.achievementIndicator,
    detalleProceso: apiEvent.files?.map(file => ({
      fileId: file.fileId,
      eventId: apiEvent.eventId,
      filePath: file.filePath,
      fileName: file.fileName,
      uploadedAt: file.uploadedAt,
      isDeleted: file.isDeleted
    })) || [],
    comentarioDecano: '', // Ajusta según los datos reales
    propuestoPor: `${apiEvent.user.firstName} ${apiEvent.user.lastName}`,
    fechaCreacion: apiEvent.createdAt,
    fechaEdicion: apiEvent.updatedAt || '',
    estado: estado,
    aportesPEI: {
      event: {
        eventId: apiEvent.eventId,
        name: apiEvent.name,
        interventions: apiEvent.interventions.map(intervention => ({
          interventionId: intervention.interventionId,
          name: intervention.name,
          strategies: [{
            strategyId: intervention.strategy.strategyId,
            description: intervention.strategy.description,
            strategicObjective: {
              strategicObjectiveId: intervention.strategy.strategicArea.strategicAreaId,
              description: intervention.strategy.strategicArea.strategicObjective,
              strategicArea: {
                strategicAreaId: intervention.strategy.strategicArea.strategicAreaId,
                name: intervention.strategy.strategicArea.name
              }
            }
          }]
        }))
      }
    },
    campus: apiEvent.campus.name,
    naturalezaEvento: apiEvent.eventNature
  };
}

const EventsViewerComponent: React.FC<SectionProps> = ({ name, isActive, poaId, facultyId, isEditable, userId }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [eventsInReview, setEventsInReview] = useState<PlanningEvent[]>([]);
  const [approvedEvents, setApprovedEvents] = useState<PlanningEvent[]>([]);
  const [rejectedEvents, setRejectedEvents] = useState<PlanningEvent[]>([]);
  const [eventsWithCorrections, setEventsWithCorrections] = useState<PlanningEvent[]>([]);
  const user = useCurrentUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fullevent/poa/${poaId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.token}`,
          },
        });
        const data: ApiEvent[] = await response.json();
        const mappedEvents = data.map(event => mapApiEventToPlanningEvent(event));

        // Separar eventos en diferentes estados
        setEventsInReview(mappedEvents.filter(event => event.estado === 'revision'));
        setApprovedEvents(mappedEvents.filter(event => event.estado === 'aprobado'));
        setRejectedEvents(mappedEvents.filter(event => event.estado === 'rechazado'));
        setEventsWithCorrections(mappedEvents.filter(event => event.estado === 'correccion'));
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Error al cargar los eventos');
      }
    };

    fetchData();
  }, [poaId, user?.token]);

  const updateEventStatus = async (eventId: number, approvalStatusId: number, comments: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/approvals/event/${eventId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ eventId, userId, approvalStatusId, comments })
      });

      if (!response.ok) throw new Error(`Error: ${response.statusText}`);

      toast.success('Estado del evento actualizado correctamente');
      // Refrescar los datos después de la actualización
      const refreshedData = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fullevent/poa/${poaId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
      });
      const refreshedEvents: ApiEvent[] = await refreshedData.json();
      const mappedRefreshedEvents = refreshedEvents.map(event => mapApiEventToPlanningEvent(event));

      setEventsInReview(mappedRefreshedEvents.filter(event => event.estado === 'revision'));
      setApprovedEvents(mappedRefreshedEvents.filter(event => event.estado === 'aprobado'));
      setRejectedEvents(mappedRefreshedEvents.filter(event => event.estado === 'rechazado'));
      setEventsWithCorrections(mappedRefreshedEvents.filter(event => event.estado === 'correccion'));
    } catch (error) {
      console.error('Error al actualizar el estado del evento:', error);
      toast.error('Error al actualizar el estado del evento. Por favor, intente de nuevo.');
    }
  };

  const approveEvent = (id: string) => {
    if (window.confirm('¿Estás seguro de aprobar este evento?')) {
      updateEventStatus(Number(id), 1, 'Evento aprobado');
    }
  };

  const rejectEvent = (id: string) => {
    if (window.confirm('¿Estás seguro de rechazar este evento?')) {
      updateEventStatus(Number(id), 2, 'Evento rechazado');
    }
  };

  const requestCorrection = (id: string) => {
    if (window.confirm('¿Estás seguro de solicitar correcciones para este evento?')) {
      updateEventStatus(Number(id), 3, 'Evento aprobado con correcciones');
    }
  };

  const revertToPending = (id: string) => {
    if (window.confirm('¿Estás seguro de regresar este evento a pendiente?')) {
      updateEventStatus(Number(id), 4, 'Regresado a pendiente');
    }
  };

  return (
    <div id={name} className={`mb-6 ${isActive ? 'ring-2 ring-green-400' : ''}`}>
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300">
          <div className="p-4 bg-green-50 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-primary">Revisión de eventos</h2>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" className="text-primary hover:text-primary hover:bg-green-100" size="icon" onClick={() => setIsMinimized(!isMinimized)}>
                {isMinimized ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          {!isMinimized && (
            <div className="p-4 bg-white">
              <div className="container mx-auto space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-[#014A2D]">Eventos Pendientes</h2>
                  <div className="max-h-[500px] overflow-y-auto overflow-x-auto">
                    <EventTable
                      events={eventsInReview}
                      isPending={true}
                      onApprove={approveEvent}
                      onReject={rejectEvent}
                      onRequestCorrection={requestCorrection}
                      onRevert={revertToPending}
                    />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-[#014A2D]">Eventos Aprobados</h2>
                  <div className="max-h-[500px] overflow-y-auto overflow-x-auto">
                    <EventTable
                      events={approvedEvents}
                      isPending={false}
                      onApprove={approveEvent}
                      onReject={rejectEvent}
                      onRequestCorrection={requestCorrection}
                      onRevert={revertToPending}
                    />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-[#014A2D]">Eventos Rechazados</h2>
                  <div className="max-h-[500px] overflow-y-auto overflow-x-auto">
                    <EventTable
                      events={rejectedEvents}
                      isPending={false}
                      onApprove={approveEvent}
                      onReject={rejectEvent}
                      onRequestCorrection={requestCorrection}
                      onRevert={revertToPending}
                      showCorrectionsActions={false}
                      showComments={true}
                    />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-[#014A2D]">Eventos con Solicitud de Correcciones</h2>
                  <div className="max-h-[500px] overflow-y-auto overflow-x-auto">
                    <EventTable
                      events={eventsWithCorrections}
                      isPending={false}
                      onApprove={approveEvent}
                      onReject={rejectEvent}
                      onRequestCorrection={requestCorrection}
                      onRevert={revertToPending}
                      showCorrectionsActions={false}
                      showComments={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventsViewerComponent;
