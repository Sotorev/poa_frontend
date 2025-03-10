import React, { createContext, useState, useEffect, ReactNode } from 'react';

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
    getPurchaseTypes
    // Si existe, agregar getFinancingSources
} from './eventPlanningForm.service'
import { useCurrentUser } from '@/hooks/use-current-user';
import { getFinancingSources } from '@/services/apiService';

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
});

interface ProviderProps {
    children: ReactNode;
}

export const EventProvider = ({ children }: ProviderProps) => {
    const [financingSources, setFinancingSources] = useState<FinancingSource[]>([]);
    const [strategicAreas, setStrategicAreas] = useState<StrategicArea[]>([]);
    const [strategicObjectives, setStrategicObjectives] = useState<StrategicObjective[]>([]);
    const [strategics, setStrategics] = useState<Strategy[]>([]);
    const [interventions, setInterventions] = useState<Intervention[]>([]);
    const [odsList, setOdsList] = useState<ODS[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [campuses, setCampuses] = useState<Campus[]>([]);
    const [purchaseTypes, setPurchaseTypes] = useState<PurchaseType[]>([]);
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
            // Nota: Si dispones de una función para obtener financingSources, agrégala aquí.
            // Por ejemplo:
            // const responseFinancingSources = await getFinancingSources(user.token);
            // setFinancingSources(responseFinancingSources);

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
            }}
        >
            {children}
        </EventContext.Provider>
    );
};