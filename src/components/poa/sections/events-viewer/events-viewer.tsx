import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from 'lucide-react';
import { PlanningEvent, SectionProps, ApiEvent } from '@/types/interfaces';
import EventTable from './EventTable';

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
    areaEstrategica: apiEvent.interventions[0]?.strategy?.strategicObjective?.strategicArea?.name || '',
    objetivoEstrategico: apiEvent.interventions[0]?.strategy?.strategicObjective?.description || '',
    estrategias: apiEvent.interventions[0]?.strategy?.description || '',
    intervencion: apiEvent.interventions[0]?.name || '',
    ods: apiEvent.ods.map(ods => ods.name).join(', '),
    tipoEvento: apiEvent.type === 'Actividad' ? 'actividad' : 'proyecto',
    evento: apiEvent.name,
    objetivo: apiEvent.objective,
    fechas: apiEvent.dates.map(date => ({
      inicio: date.startDate,
      fin: date.endDate
    })),
    costoTotal: apiEvent.totalCost,
    aporteUMES: apiEvent.financings.find(f => f.financingSourceId === 1)?.amount || 0,
    aporteOtros: apiEvent.financings.filter(f => f.financingSourceId !== 1).reduce((sum, f) => sum + f.amount, 0),
    tipoCompra: apiEvent.purchaseType,
    detalle: apiEvent.costDetailDocumentPath || '', // Ajusta el nombre del campo según los datos reales
    responsables: {
      principal: apiEvent.responsibles.find(r => r.responsibleRole === 'Principal')?.name || '',
      ejecucion: apiEvent.responsibles.find(r => r.responsibleRole === 'Ejecución')?.name || '',
      seguimiento: apiEvent.responsibles.find(r => r.responsibleRole === 'Seguimiento')?.name || ''
    },
    recursos: apiEvent.resources.map(r => `Recurso ${r.resourceId}`).join(', '), // Ajusta según los datos reales
    indicadorLogro: apiEvent.achievementIndicator,
    detalleProceso: apiEvent.processDocumentPath || '',
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
              strategicObjectiveId: intervention.strategy.strategicObjective.strategicObjectiveId,
              description: intervention.strategy.strategicObjective.description,
              strategicArea: {
                strategicAreaId: intervention.strategy.strategicObjective.strategicArea.strategicAreaId,
                name: intervention.strategy.strategicObjective.strategicArea.name
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fullevent/poa/${poaId}`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
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
  }, [poaId]);

  const updateEventStatus = async (eventId: number, approvalStatusId: number, comments: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/approvals/event/${eventId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, userId, approvalStatusId, comments })
      });

      if (!response.ok) throw new Error(`Error: ${response.statusText}`);

      toast.success('Estado del evento actualizado correctamente');
      // Refrescar los datos después de la actualización
      const refreshedData = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fullevent/poa/${poaId}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
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
    const comments = window.prompt('Ingrese los comentarios para el rechazo del evento:', 'Evento rechazado');
    if (comments !== null) {
      updateEventStatus(Number(id), 2, comments);
    }
  };

  const requestCorrection = (id: string) => {
    const comments = window.prompt('Ingrese los comentarios para solicitar correcciones:', 'Evento aprobado con correcciones');
    if (comments !== null) {
      updateEventStatus(Number(id), 3, comments);
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
            <h2 className="text-xl font-semibold text-gray-800">Revisión de eventos</h2>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={() => setIsMinimized(!isMinimized)}>
                {isMinimized ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          {!isMinimized && (
            <div className="p-4 bg-white">
              <div className="container mx-auto space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-[#014A2D]">Eventos Pendientes</h2>
                  <EventTable
                    events={eventsInReview}
                    isPending={true}
                    onApprove={approveEvent}
                    onReject={rejectEvent}
                    onRequestCorrection={requestCorrection}
                    onRevert={revertToPending}
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-[#014A2D]">Eventos Aprobados</h2>
                  <EventTable
                    events={approvedEvents}
                    isPending={false}
                    onApprove={approveEvent}
                    onReject={rejectEvent}
                    onRequestCorrection={requestCorrection}
                    onRevert={revertToPending}
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-[#014A2D]">Eventos Rechazados</h2>
                  <EventTable
                    events={rejectedEvents}
                    isPending={false}
                    onApprove={approveEvent}
                    onReject={rejectEvent}
                    onRequestCorrection={requestCorrection}
                    onRevert={revertToPending}
                    showCorrectionsButton={false}
                    showComments={true}
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-[#014A2D]">Eventos con Solicitud de Correcciones</h2>
                  <EventTable
                    events={eventsWithCorrections}
                    isPending={false}
                    onApprove={approveEvent}
                    onReject={rejectEvent}
                    onRequestCorrection={requestCorrection}
                    onRevert={revertToPending}
                    showCorrectionsButton={false}
                    showComments={true}
                  />
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
