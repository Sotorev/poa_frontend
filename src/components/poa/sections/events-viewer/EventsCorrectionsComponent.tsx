// src/components/poa/sections/events-viewer/EventsCorrectionsComponent.tsx

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Button } from "@/components/ui/button";
import { ChevronUp } from 'lucide-react';
import { PlanningEvent, SectionProps, ApiEvent } from '@/types/interfaces';
import EventTable from './EventTable';
import { useCurrentUser } from "@/hooks/use-current-user";

// Importar el componente de acciones de corrección
import { ActionButtonsCorrectionsComponent } from './action-buttons-corrections';

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
        tipoCompra: apiEvent.purchaseType?.name || '',
        detalle: apiEvent.costDetailDocumentPath || '',
        responsables: {
            principal: apiEvent.responsibles.find(r => r.responsibleRole === 'Principal')?.name || '',
            ejecucion: apiEvent.responsibles.find(r => r.responsibleRole === 'Ejecución')?.name || '',
            seguimiento: apiEvent.responsibles.find(r => r.responsibleRole === 'Seguimiento')?.name || ''
        },
        recursos: apiEvent.institutionalResources.map(r => r.name).join(', '),
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
        // Implementar lógica de edición, por ejemplo, redirigir a una página de edición
        console.log(`Editar evento con id: ${id}`);
        // Ejemplo:
        // navigate(`/events/edit/${id}`);
    };

    const handleDelete = (id: string) => {
        if (confirm('¿Estás seguro de que deseas eliminar este evento?')) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                },
            })
            .then(response => {
                if (response.ok) {
                    toast.success('Evento eliminado exitosamente');
                    // Actualizar el estado local para reflejar la eliminación
                    setEventsByStatus(prev => ({
                        revision: prev.revision.filter(event => event.id !== id),
                        aprobado: prev.aprobado.filter(event => event.id !== id),
                        rechazado: prev.rechazado.filter(event => event.id !== id),
                        correccion: prev.correccion.filter(event => event.id !== id)
                    }));
                } else {
                    toast.error('Error al eliminar el evento');
                }
            })
            .catch(error => {
                console.error('Error deleting event:', error);
                toast.error('Error al eliminar el evento');
            });
        }
    };

    // Componente reutilizable para cada sección de estado
    const RenderEventSection = (title: string, events: PlanningEvent[]) => (
        <div className="mb-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300">
                <div className="p-4 bg-green-50 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
                    <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => { /* manejar minimización */ }}>
                            <ChevronUp className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                {/* Manejar minimización si se implementa */}
                <div className="p-4 bg-white">
                    <div className="container mx-auto space-y-8">
                        <div>
                            {events.length > 0 ? (
                                <EventTable
                                    events={events}
                                    isPending={false}
                                    showComments={false}
                                    showActions={false}
                                    showCorrectionsActions={true}       // Activar acciones de corrección
                                    onEdit={handleEdit}                 // Pasar handler de edición
                                    onDelete={handleDelete}             // Pasar handler de eliminación
                                    onApprove={() => {}}
                                    onReject={() => {}}
                                    onRequestCorrection={() => {}}
                                    onRevert={() => {}}
                                />
                            ) : (
                                <p>No hay eventos en este estado.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div id={name} className={`mb-6 ${isActive ? 'ring-2 ring-green-400' : ''}`}>
            {/* Sección para Revisión */}
            {RenderEventSection('Eventos en Revisión', eventsByStatus.revision)}

            {/* Sección para Aprobados */}
            {RenderEventSection('Eventos Aprobados', eventsByStatus.aprobado)}

            {/* Sección para Rechazados */}
            {RenderEventSection('Eventos Rechazados', eventsByStatus.rechazado)}

            {/* Sección para Correcciones */}
            {RenderEventSection('Eventos con Solicitud de Correcciones', eventsByStatus.correccion)}
        </div>
    );
};

export default EventsCorrectionsComponent;
