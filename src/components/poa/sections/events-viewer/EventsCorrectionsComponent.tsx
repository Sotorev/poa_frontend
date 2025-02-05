// src/components/poa/sections/events-viewer/EventsCorrectionsComponent.tsx

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Button } from "@/components/ui/button";
import { ChevronUp } from 'lucide-react';
import { PlanningEvent, SectionProps as OriginalSectionProps, ApiEvent } from '@/types/interfaces';
import EventTable from './EventTable';
import { useCurrentUser } from "@/hooks/use-current-user";
import { deleteEvent } from '@/services/apiService';




// Modificar SectionProps para incluir onEditEvent
interface SectionProps extends OriginalSectionProps {
    onEditEvent: (event: PlanningEvent) => void;

}

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
        aporteUMES: apiEvent.financings
            .filter(f => [1, 4, 5, 7].includes(f.financingSourceId))
            .map(f => ({
                financingSourceId: f.financingSourceId,
                percentage: f.percentage,
                amount: f.amount
            })),
        aporteOtros: apiEvent.financings
            .filter(f => [2, 3, 6].includes(f.financingSourceId))
            .map(f => ({
                financingSourceId: f.financingSourceId,
                percentage: f.percentage,
                amount: f.amount
            })),
        tipoCompra: apiEvent.purchaseType?.name || '',
        detalle: apiEvent.costDetails?.map(detail => ({ id: detail.costDetailId, name: detail.fileName })) || [],
        responsables: {
            principal: apiEvent.responsibles.find(r => r.responsibleRole === 'Principal')?.name || '',
            ejecucion: apiEvent.responsibles.find(r => r.responsibleRole === 'Ejecución')?.name || '',
            seguimiento: apiEvent.responsibles.find(r => r.responsibleRole === 'Seguimiento')?.name || ''
        },
        recursos: apiEvent.institutionalResources.map(r => r.name).join(', '),
        indicadorLogro: apiEvent.achievementIndicator,
        detalleProceso: apiEvent.files?.map(file => ({ id: file.fileId, name: file.fileName })) || [],
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

const EventsCorrectionsComponent: React.FC<SectionProps> = ({ name, isActive, poaId, onEditEvent }) => {
    const [isMinimized, setIsMinimized] = useState(false);
    const [eventsByStatus, setEventsByStatus] = useState<{
        revision: PlanningEvent[];
        aprobado: PlanningEvent[];
        rechazado: PlanningEvent[];
        correccion: PlanningEvent[];
    }>({
        revision: [],
        aprobado: [],
        rechazado: [],
        correccion: []
    });

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
                if (!response.ok) {
                    throw new Error(`Error al obtener eventos: ${response.statusText}`);
                }
                const data: ApiEvent[] = await response.json();
                const mappedEvents = data.map(event => mapApiEventToPlanningEvent(event));

                // Clasificar los eventos según su estado
                const categorizedEvents = {
                    revision: mappedEvents.filter(event => event.estado === 'revision'),
                    aprobado: mappedEvents.filter(event => event.estado === 'aprobado'),
                    rechazado: mappedEvents.filter(event => event.estado === 'rechazado'),
                    correccion: mappedEvents.filter(event => event.estado === 'correccion')
                };

                setEventsByStatus(categorizedEvents);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Error al cargar los eventos');
            }
        };

        fetchData();
    }, [poaId, user?.token]);

    // Definir handlers para editar y eliminar
    const handleEdit = (id: string) => {
        // Buscar el evento en los eventos cargados
        const event =
            eventsByStatus.revision.find(event => event.id === id) ||
            eventsByStatus.aprobado.find(event => event.id === id) ||
            eventsByStatus.rechazado.find(event => event.id === id) ||
            eventsByStatus.correccion.find(event => event.id === id);

        if (event) {

            onEditEvent(event);
        } else {
            console.error(`Event with id ${id} not found.`);
            toast.error('Evento no encontrado.');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Estás seguro de que deseas eliminar este evento?')) {
            try {
                await deleteEvent(Number(id), user?.token || '');
                toast.success('Evento eliminado exitosamente');
                // Actualizar el estado local para reflejar la eliminación
                setEventsByStatus(prev => ({
                    revision: prev.revision.filter(event => event.id !== id),
                    aprobado: prev.aprobado.filter(event => event.id !== id),
                    rechazado: prev.rechazado.filter(event => event.id !== id),
                    correccion: prev.correccion.filter(event => event.id !== id)
                }));
            } catch (error) {
                console.error('Error al eliminar el evento:', error);
                toast.error('Error al eliminar el evento');
            }
        }
    };

    // Componente reutilizable para cada sección de estado
    const RenderEventSection = (title: string, events: PlanningEvent[], showCorrectionsActions: boolean) => (
        <div className="mb-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300">
                <div className="p-4 bg-green-50 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
                    <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => setIsMinimized(!isMinimized)}>
                            <ChevronUp className={`h-4 w-4 transform ${isMinimized ? 'rotate-180' : 'rotate-0'} transition-transform duration-300`} />
                        </Button>
                    </div>
                </div>
                {/* Manejar minimización */}
                {!isMinimized && (
                    <div className="p-4 bg-white">
                        <div className="container mx-auto space-y-8">
                            <div>
                                {events.length > 0 ? (
                                    <EventTable
                                        events={events}
                                        isPending={false}
                                        showComments={true}
                                        showActions={false}
                                        showCorrectionsActions={showCorrectionsActions} // Activar o desactivar acciones de corrección
                                        onEdit={showCorrectionsActions ? handleEdit : undefined} // Pasar handler de edición si aplica
                                        onDelete={showCorrectionsActions ? handleDelete : undefined} // Pasar handler de eliminación si aplica
                                        onApprove={() => { }}
                                        onReject={() => { }}
                                        onRequestCorrection={() => { }}
                                        onRevert={() => { }}
                                    />
                                ) : (
                                    <p>No hay eventos en este estado.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div id={name} className={`mb-6 ${isActive ? 'ring-2 ring-green-400' : ''}`}>
            {/* Sección para Revisión */}
            {RenderEventSection('Eventos en Revisión', eventsByStatus.revision, true)}

            {/* Sección para Aprobados */}
            {RenderEventSection('Eventos Aprobados', eventsByStatus.aprobado, false)} {/* No permitir acciones de corrección */}

            {/* Sección para Rechazados */}
            {RenderEventSection('Eventos Rechazados', eventsByStatus.rechazado, true)}

            {/* Sección para Correcciones */}
            {RenderEventSection('Eventos con Solicitud de Correcciones', eventsByStatus.correccion, true)}
        </div>
    );
};

export default EventsCorrectionsComponent;
