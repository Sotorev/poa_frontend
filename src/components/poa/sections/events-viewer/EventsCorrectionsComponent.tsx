// events-corrections-component.tsx

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
      'Aprobado con Correcciones': 'correccion',
      'Solicitud de Correcciones': 'correccion' // Aseguramos que este estado se mapee correctamente
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
      aporteOtros: apiEvent.financings
        .filter(f => f.financingSourceId !== 1)
        .reduce((sum, f) => sum + f.amount, 0),
      tipoCompra: apiEvent.purchaseType,
      detalle: apiEvent.costDetailDocumentPath || '',
      responsables: {
        principal: apiEvent.responsibles.find(r => r.responsibleRole === 'Principal')?.name || '',
        ejecucion: apiEvent.responsibles.find(r => r.responsibleRole === 'Ejecución')?.name || '',
        seguimiento: apiEvent.responsibles.find(r => r.responsibleRole === 'Seguimiento')?.name || ''
      },
      recursos: apiEvent.resources.map(r => r.resourceId).join(', '), // Ajustado aquí
      indicadorLogro: apiEvent.achievementIndicator,
      detalleProceso: apiEvent.processDocumentPath || '',
      comentarioDecano: apiEvent.eventApprovals[0]?.comments || '', // Ajustado aquí
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
  

const EventsCorrectionsComponent: React.FC<SectionProps> = ({ name, isActive, poaId, facultyId, isEditable, userId }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [correctionEvents, setCorrectionEvents] = useState<PlanningEvent[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fullevent/poa/${poaId}`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        const data: ApiEvent[] = await response.json();
        const mappedEvents = data.map(event => mapApiEventToPlanningEvent(event));

        // Filtrar solo los eventos con estado 'correccion'
        setCorrectionEvents(mappedEvents.filter(event => event.estado === 'correccion'));
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Error al cargar los eventos');
      }
    };

    fetchData();
  }, [poaId]);

  return (
    <div id={name} className={`mb-6 ${isActive ? 'ring-2 ring-green-400' : ''}`}>
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300">
          <div className="p-4 bg-green-50 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Eventos con Solicitud de Correcciones</h2>
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
                  {correctionEvents.length > 0 ? (
                    <>
                      <h2 className="text-2xl font-bold mb-4 text-[#014A2D]">Eventos Pendientes de Correcciones</h2>
                      <EventTable
                        events={correctionEvents}
                        isPending={false}
                        showActions={false} // Puedes ajustar esto según tus necesidades
                        onApprove={() => {}}
                        onReject={() => {}}
                        onRequestCorrection={() => {}}
                        onRevert={() => {}}
                      />
                    </>
                  ) : (
                    <p>No hay eventos pendientes de correcciones.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventsCorrectionsComponent;
