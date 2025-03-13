import React, { createContext, useState, useEffect, ReactNode, useMemo } from 'react';

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
import { FullEventRequest, UpdateEventRequest } from './formView/schema.eventPlanningForm';

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
    setSelectedStrategicObjective: (strategicObjective: StrategicObjective) => void;
    selectedStrategicArea: StrategicArea | undefined;
    selectedStrategies: Strategy[] | undefined;
    setSelectedStrategies: (strategies: Strategy[]) => void;
    facultyId: number | null;
    setFacultyId: (facultyId: number) => void;
    poaId: number | null;
    setPoaId: (poaId: number) => void;
    eventEditing: UpdateEventRequest | undefined;
    handleEditEvent: (event: PlanningEvent) => void;
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
    setSelectedStrategicObjective: (_strategicObjective: StrategicObjective) => { },
    selectedStrategicArea: undefined,
    selectedStrategies: [],
    setSelectedStrategies: (_strategies: Strategy[]) => { },
    facultyId: null,
    setFacultyId: (_facultyId: number) => { },
    poaId: null,
    setPoaId: (_poaId: number) => { },
    eventEditing: undefined,
    handleEditEvent: (_event: PlanningEvent) => { },
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
        

        getPoaByFacultyAndYear(facultyId,  user.token).then(poa => {
            setPoaId(poa.poaId);
        });
    }, [facultyId, user?.token]);

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
        }));

        // Convertir los financiamientos (aporteUMES y aporteOtros)
        const financings = [
            ...event.aporteUMES.map(aporte => ({
                financingSourceId: aporte.financingSourceId,
                percentage: aporte.percentage,
                amount: aporte.amount
            })),
            ...event.aporteOtros.map(aporte => ({
                financingSourceId: aporte.financingSourceId,
                percentage: aporte.percentage,
                amount: aporte.amount
            }))
        ];

        // Configurar los responsables
        const responsibles: { responsibleRole: "Principal" | "Ejecución" | "Seguimiento"; name: string }[] = [];
        if (event.responsables.principal) {
            responsibles.push({
                responsibleRole: "Principal",
                name: event.responsables.principal
            });
        }
        if (event.responsables.ejecucion) {
            responsibles.push({
                responsibleRole: "Ejecución",
                name: event.responsables.ejecucion
            });
        }
        if (event.responsables.seguimiento) {
            responsibles.push({
                responsibleRole: "Seguimiento",
                name: event.responsables.seguimiento
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
        let odsArray: { ods: number }[] = [];
        if (event.ods) {
            const odsMatched = event.ods.split(',').map(o => odsList.find(ods => ods.name === o));
            odsArray = odsMatched.map(o => ({ ods: o?.odsId || 0 }));
        }

        // Configurar recursos
        let resourcesParsed: { resourceId: number }[] = [];
        if (event.recursos) {
            // Asumo que recursos es una lista de IDs separados por comas
            const resourcesMatched = event.recursos.split(',').map(r => resources.find(resource => resource.name === r));
            resourcesParsed = resourcesMatched.map(r => ({ resourceId: r?.resourceId || 0 }));
        }

        // Establecer el tipo de evento (Actividad o Proyecto)
        const type = event.tipoEvento === 'actividad' ? 'Actividad' : 'Proyecto';

        let processDocuments: File[] = [];
        let costDetailDocuments: File[] = [];
        try {
            // Descargar archivos adjuntos
            processDocuments = await Promise.all(
                event.detalleProceso.map((doc) =>
                    downloadFileAux(`/api/fullEvent/downloadEventFileById/${doc.id}`, doc.name, user?.token || '')
                )
            );

            costDetailDocuments = await Promise.all(
                event.detalle.map((doc) =>
                    downloadFileAux(`/api/fullEvent/downloadEventCostDetailDocumentById/${doc.id}`, doc.name, user?.token || '')
                )
            );
        } catch (error) {
            console.error('Error al descargar archivos adjuntos:', error);
        }

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
                purchaseTypeId: parseInt(event.tipoCompra, 10) || 1,
                totalCost: event.costoTotal,
                dates: dates,
                financings: financings,
                approvals: [],
                responsibles: responsibles,
                interventions: interventions,
                ods: odsArray,
                resources: resourcesParsed,
                userId: user?.userId || 0,
                costDetailDocuments: costDetailDocuments || [],
                processDocuments: processDocuments || []
            },
            eventId: parseInt(event.id, 10)
        }
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
                handleEditEvent
            }}
        >
            {children}
        </EventContext.Provider>
    );
};