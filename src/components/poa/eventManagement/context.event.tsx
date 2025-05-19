import React, { createContext, useState, useEffect, ReactNode, useMemo, useContext } from 'react';
import { PoaContext } from '@/contexts/PoaContext';

// Types
import { PurchaseType } from '@/types/PurchaseType'
import { Strategy } from '@/types/Strategy'
import { Intervention } from '@/types/Intervention'
import { ODS } from '@/types/ods'
import { Resource } from '@/types/Resource'
import { Campus } from '@/types/Campus'
import { FinancingSource } from '@/types/FinancingSource'
import { StrategicArea } from '@/types/StrategicArea'
import { StrategicObjective } from '@/types/StrategicObjective';

// Charge data
import {
    getStrategicAreas,
    getStrategicObjectives,
    getStrategies,
    getInterventions,
    getODS,
    getResources,
    getCampuses,
    getPurchaseTypes,
    downloadFileAux,
    getFacultyByUserId
    // Si existe, agregar getFinancingSources
} from './formView/service.eventPlanningForm'
import { useCurrentUser } from '@/hooks/use-current-user';
import { getFinancingSources, getPoaByFacultyAndYear } from './formView/service.eventPlanningForm'
import { PlanningEvent, Session } from './formView/type.eventPlanningForm';
import { UpdateEventRequest } from './formView/schema.eventPlanningForm';

interface EventContextProps {
    financingSources: FinancingSource[];
    strategicAreas: StrategicArea[];
    strategicObjectives: StrategicObjective[];
    strategics: Strategy[];
    interventions: Intervention[];
    odsList: ODS[];
    resources: Resource[];
    campuses: Campus[];
    purchaseTypes: PurchaseType[];
    loading: boolean;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    user: Session["user"] | undefined;
    selectedStrategicObjective: StrategicObjective | undefined;
    setSelectedStrategicObjective: (strategicObjective: StrategicObjective | undefined) => void;
    selectedStrategicArea: StrategicArea | undefined;
    selectedStrategies: Strategy[] | undefined;
    setSelectedStrategies: (strategies: Strategy[] | undefined) => void;
    facultyId: number | null;
    setFacultyId: (facultyId: number) => void;
    poaId: number | null;
    setPoaId: (poaId: number) => void;
    eventEditing: UpdateEventRequest | undefined;
    handleEditEvent: (event: PlanningEvent) => void;
    resetEventEditing: () => void;
}

export const EventContext = createContext<EventContextProps>({
    financingSources: [],
    strategicAreas: [],
    strategicObjectives: [],
    strategics: [],
    interventions: [],
    odsList: [],
    resources: [],
    campuses: [],
    purchaseTypes: [],
    loading: false,
    isOpen: false,
    setIsOpen: (_isOpen: boolean) => { },
    user: undefined,
    selectedStrategicObjective: undefined,
    setSelectedStrategicObjective: (_strategicObjective: StrategicObjective | undefined) => { },
    selectedStrategicArea: undefined,
    selectedStrategies: [],
    setSelectedStrategies: (_strategies: Strategy[] | undefined) => { },
    facultyId: null,
    setFacultyId: (_facultyId: number) => { },
    poaId: null,
    setPoaId: (_poaId: number) => { },
    eventEditing: undefined,
    handleEditEvent: (_event: PlanningEvent) => { },
    resetEventEditing: () => { },
});

interface ProviderProps {
    children: ReactNode;
}

export const EventProvider = ({ children }: ProviderProps) => {
    // Data API
    const [financingSources, setFinancingSources] = useState<FinancingSource[]>([]);
    const [strategicAreas, setStrategicAreas] = useState<StrategicArea[]>([]);
    const [strategicObjectives, setStrategicObjectives] = useState<StrategicObjective[]>([]);
    const [strategics, setStrategics] = useState<Strategy[]>([]);
    const [interventions, setInterventions] = useState<Intervention[]>([]);
    const [odsList, setOdsList] = useState<ODS[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [campuses, setCampuses] = useState<Campus[]>([]);
    const [purchaseTypes, setPurchaseTypes] = useState<PurchaseType[]>([]);

    // Event
    const [eventEditing, setEventEditing] = useState<UpdateEventRequest | undefined>(undefined);
    const [facultyId, setFacultyId] = useState<number | null>(null)
    const [poaId, setPoaId] = useState<number | null>(null)

    // Selected data
    const [selectedStrategicObjective, setSelectedStrategicObjective] = useState<StrategicObjective>()
    const selectedStrategicArea = useMemo(() => {
        return selectedStrategicObjective
            ? strategicAreas.find(area => area.strategicAreaId === selectedStrategicObjective.strategicAreaId)
            : undefined;
    }, [selectedStrategicObjective, strategicAreas])
    const [selectedStrategies, setSelectedStrategies] = useState<Strategy[]>()

    // Load, error, and close States
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false);

    // Obtener el usuario desde el contexto de autenticación
    const user = useCurrentUser();
    // Get the selected year from POA context
    const { selectedYear } = useContext(PoaContext);

    // Estado para controlar el diálogo de propuesta
    

    /**
    * Effect hook to fetch initial data required for the planning form
    * 
    * Fetches and sets the following data:
    * - Strategic Areas
    * - Strategic Objectives  
    * - Strategies
    * - Interventions
    * - ODS (Sustainable Development Goals)
    * - Resources
    * - Campuses
    * - Purchase Types
    * 
    */
    useEffect(() => {
        setLoading(true);
        if (!user?.token) return;

        const fetchData = async () => {

            const responseStrategicAreas = await getStrategicAreas(user.token);
            setStrategicAreas(responseStrategicAreas);

            const responseStrategicObjectives = await getStrategicObjectives(user.token);
            setStrategicObjectives(responseStrategicObjectives);

            const responseEstrategias = await getStrategies(user.token);
            setStrategics(responseEstrategias);

            const responseIntervenciones = await getInterventions(user.token);
            setInterventions(responseIntervenciones);

            const responseODS = await getODS(user.token);
            setOdsList(responseODS);

            const responseRecursos = await getResources(user.token);
            setResources(responseRecursos);

            const responseCampuses = await getCampuses(user.token);
            setCampuses(responseCampuses);

            const responsePurchaseTypes = await getPurchaseTypes(user.token);
            setPurchaseTypes(responsePurchaseTypes);

            const responseFinancingSources = await getFinancingSources(user.token);
            setFinancingSources(responseFinancingSources);

            setLoading(false);
        };

        fetchData();
    }, [user?.token]);

    useEffect(() => {
        if (!facultyId || !user?.token) return;
        getPoaByFacultyAndYear(facultyId, user.token, selectedYear).then(poa => {
            setPoaId(poa.poaId);
        });
    }, [facultyId, user?.token, selectedYear]);

    useEffect(() => {
        if (!user?.userId) return;
        getFacultyByUserId(user.userId, user.token).then(facultyId => {
            setFacultyId(facultyId);
        });
    }, [user?.userId, user?.token]);

    const parseUpdateEventRequest = async (event: PlanningEvent): Promise<UpdateEventRequest> => {

        // Convertir las fechas de PlanningEvent a formato para FullEventRequest
        const dates = event.fechas.map(fecha => ({
            startDate: fecha.inicio || new Date(fecha.inicio).toISOString().split('T')[0],
            endDate: fecha.fin || new Date(fecha.fin).toISOString().split('T')[0],
            eventDateId: fecha.eventDateId || 0
        }));

        // Convertir los financiamientos (aporteUMES y aporteOtros)
        const financings = [
            ...event.aporteUMES.map(aporte => ({
                eventFinancingId: aporte.eventFinancingId,
                financingSourceId: aporte.financingSourceId,
                percentage: aporte.percentage,
                amount: aporte.amount
            })),
            ...event.aporteOtros.map(aporte => ({
                eventFinancingId: aporte.eventFinancingId,
                financingSourceId: aporte.financingSourceId,
                percentage: aporte.percentage,
                amount: aporte.amount
            }))
        ];

        // Configurar los responsables
        const responsibles: { responsibleRole: "Principal" | "Ejecución" | "Seguimiento"; name: string; eventResponsibleId: number }[] = [];
        if (event.responsables.find(r => r.responsibleRole === "Principal")) {
            responsibles.push({
                responsibleRole: "Principal",
                name: event.responsables.find(r => r.responsibleRole === "Principal")?.name || '',
                eventResponsibleId: event.responsables.find(r => r.responsibleRole === "Principal")?.eventResponsibleId || 0
            });
        }
        if (event.responsables.find(r => r.responsibleRole === "Ejecución")) {
            responsibles.push({
                responsibleRole: "Ejecución",
                name: event.responsables.find(r => r.responsibleRole === "Ejecución")?.name || '',
                eventResponsibleId: event.responsables.find(r => r.responsibleRole === "Ejecución")?.eventResponsibleId || 0
            });
        }
        if (event.responsables.find(r => r.responsibleRole === "Seguimiento")) {
            responsibles.push({
                responsibleRole: "Seguimiento",
                name: event.responsables.find(r => r.responsibleRole === "Seguimiento")?.name || '',
                eventResponsibleId: event.responsables.find(r => r.responsibleRole === "Seguimiento")?.eventResponsibleId || 0
            });
        }

        // Configurar intervenciones
        let interventions: { intervention: number }[] = [];
        if (event.aportesPEI && event.aportesPEI.event && event.aportesPEI.event.interventions) {
            interventions = event.aportesPEI.event.interventions.map(intervencion => ({
                intervention: intervencion.interventionId
            }));
        }

        // Configurar ODS
        // Asumo que el campo ods contiene IDs separados por comas
        const odsArray: { ods: number }[] = [];

        // Verificar que event.ods es una cadena no vacía y que odsList está disponible y no vacío.
        if (event.ods && typeof event.ods === 'string' && event.ods.trim() !== '') {
            if (typeof odsList !== 'undefined' && odsList && odsList.length > 0) {
                let currentOdsSegment = event.ods.trim();

                // Ordenar la lista de ODS por la longitud de sus nombres en orden descendente.
                // Esto es crucial para que los nombres más largos (ej: "Paz, justicia e instituciones sólidas")
                // se intenten hacer coincidir antes que nombres más cortos que podrían ser subcadenas.
                const sortedOdsList = [...odsList].sort((a, b) => {
                    const nameA = a.name || "";
                    const nameB = b.name || "";
                    return nameB.length - nameA.length;
                });

                while (currentOdsSegment.length > 0) {
                    let foundMatchInIteration = false;
                    for (const odsItem of sortedOdsList) {
                        // Asegurar que odsItem.name es una cadena antes de llamar a startsWith
                        if (odsItem && typeof odsItem.name === 'string' && currentOdsSegment.startsWith(odsItem.name)) {
                            odsArray.push({ ods: odsItem.odsId });

                            const remainingAfterMatch = currentOdsSegment.substring(odsItem.name.length);

                            // Eliminar el separador (coma y el espacio que típicamente le sigue)
                            if (remainingAfterMatch.startsWith(', ')) {
                                currentOdsSegment = remainingAfterMatch.substring(2).trim();
                            } else if (remainingAfterMatch.startsWith(',')) {
                                // Manejar el caso donde solo hay una coma sin espacio después
                                currentOdsSegment = remainingAfterMatch.substring(1).trim();
                            } else {
                                // Si no hay coma, significa que era el último elemento o la cadena termina.
                                currentOdsSegment = remainingAfterMatch.trim();
                            }

                            foundMatchInIteration = true;
                            // Romper el bucle interno para reiniciar la búsqueda con la cadena actualizada.
                            break;
                        }
                    }

                    // Si en una iteración completa no se encontró ninguna coincidencia,
                    // pero la cadena aún tiene contenido, significa que hay una parte no parseable.
                    if (!foundMatchInIteration && currentOdsSegment.length > 0) {
                        // console.warn(`Advertencia: Segmento de ODS no parseable en event.ods: "${currentOdsSegment}"`);
                        // Detener el parseo para evitar bucles infinitos con entradas mal formadas.
                        break;
                    }
                }
            } else {
                // console.warn('La lista de ODS (odsList) está vacía o no está disponible. No se pueden parsear los nombres de ODS desde event.ods.');
            }
        } else {
            // event.ods es null, undefined, no es una cadena, o es una cadena vacía/espacios en blanco.
            // odsArray permanecerá vacío, lo cual es el comportamiento correcto.
        }

        let purchaceTypesParsed: { purchaseTypeId: number }[] = [];
        if (event.tipoCompra) {
            // Asumo que tipoCompra es una lista de IDs separados por comas
            const purchaseTypesMatched = event.tipoCompra.split(',').map(r => purchaseTypes.find(resource => resource.name === r));
            purchaceTypesParsed = purchaseTypesMatched.map(r => ({ purchaseTypeId: r?.purchaseTypeId || 0 }));
        }

        // Configurar recursos
        let resourcesParsed: { resourceId: number }[] = [];
        if (event.recursos) {
            // Asumo que recursos es una lista de IDs separados por comas
            const resourcesMatched = event.recursos.split(',').map(r => resources.find(resource => resource.name === r.trim()));
            resourcesParsed = resourcesMatched.map(r => ({ resourceId: r?.resourceId || 0 }));
        }

        // Establecer el tipo de evento (Actividad o Proyecto)
        const type = event.tipoEvento === 'actividad' ? 'Actividad' : 'Proyecto';

        return {
            data: {
                name: event.evento,
                type: type as 'Actividad' | 'Proyecto',
                poaId: typeof event.id === 'string' ? parseInt(event.id, 10) : 0,
                statusId: event.estado === 'aprobado' ? 2 : event.estado === 'rechazado' ? 3 : event.estado === 'correccion' ? 4 : 1,
                completionPercentage: 0,
                campusId: parseInt(event.campus, 10) || 1,
                objective: event.objetivo,
                eventNature: event.naturalezaEvento || "Planificado",
                isDelayed: false,
                achievementIndicator: event.indicadorLogro,
                purchaseTypeId: purchaceTypesParsed.length > 0 ? purchaceTypesParsed[0].purchaseTypeId : 0,
                totalCost: event.costoTotal,
                dates: dates,
                financings: financings,
                approvals: [],
                responsibles: responsibles,
                interventions: interventions,
                ods: odsArray,
                resources: resourcesParsed,
                userId: user?.userId || 0,
                costDetailDocuments: event.detalle.map(file => ({ costDetailId: file.costDetailId, name: file.fileName, isDeleted: false })),
                processDocuments: event.detalleProceso.map(file => ({ fileId: file.fileId, name: file.fileName, isDeleted: false }))
            },
            eventId: parseInt(event.id, 10)
        }
    };

    // Función para resetear el estado de edición
    const resetEventEditing = () => {
        setEventEditing(undefined);
        setSelectedStrategicObjective(undefined);
        setSelectedStrategies(undefined);
    };

    // Función para manejar la edición de un evento (Actualizar)
    const handleEditEvent = async (event: PlanningEvent) => {

        // Parsear el evento para UpdateEventRequest
        setSelectedStrategicObjective(strategicObjectives.find(objective => objective.description === event.objetivoEstrategico));
        setSelectedStrategies(strategics.filter(strategy => strategy.description === event.estrategias));
        setEventEditing(await parseUpdateEventRequest(event));

        // Abrir el modal
        setIsOpen(true);
    };

    return (
        <EventContext.Provider
            value={{
                financingSources,
                strategicAreas,
                strategicObjectives,
                strategics,
                interventions,
                odsList,
                resources,
                campuses,
                purchaseTypes,
                loading,
                isOpen,
                setIsOpen,
                user,
                eventEditing,
                facultyId,
                setFacultyId,
                poaId,
                setPoaId,
                selectedStrategicObjective,
                setSelectedStrategicObjective,
                selectedStrategicArea,
                selectedStrategies,
                setSelectedStrategies,
                handleEditEvent,
                resetEventEditing,
            }}
        >
            {children}
        </EventContext.Provider>
    );
};