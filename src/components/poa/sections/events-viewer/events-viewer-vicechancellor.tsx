// events-viewer-vicechancellor.tsx

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
      isDeleted: date.isDeleted,
      inicio: date.startDate,
      fin: date.endDate
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

const EventsViewerViceChancellorComponent: React.FC<SectionProps> = ({ name, isActive, poaId, facultyId, isEditable, userId }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [approvedEvents, setApprovedEvents] = useState<PlanningEvent[]>([]);
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

        // Filtrar solo los eventos aprobados
        setApprovedEvents(mappedEvents.filter(event => event.estado === 'aprobado'));
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
            <h2 className="text-xl font-semibold text-primary">Revisión de eventos</h2>
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
                  <h2 className="text-2xl font-bold mb-4 text-[#014A2D]">Eventos Aprobados</h2>
                  <EventTable
                    events={approvedEvents}
                    isPending={false}
                    showActions={false} // Ocultar la columna de acciones
                    onApprove={() => { }}
                    onReject={() => { }}
                    onRequestCorrection={() => { }}
                    onRevert={() => { }}
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

export default EventsViewerViceChancellorComponent;
