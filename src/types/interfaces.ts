// components/EventsViewer/interfaces.ts

// Interfaces para los datos de la API
export interface ApiEventDate {
  eventDateId: number;
  eventId: number;
  startDate: string;
  endDate: string;
  isDeleted: boolean;
}

export interface ApiEventFinancing {
  eventFinancingId: number;
  eventId: number;
  financingSourceId: number;
  amount: number;
  percentage: number;
  isDeleted: boolean;
}

export interface ApiPurchaseType {
  purchaseTypeId: number;
  name: string;
  isDeleted: boolean;
}

export interface ApiInstitutionalResource {
  resourceId: number;
  name: string;
  event_resource: ApiEventResource;
}

export interface ApiEventResource {
  eventResourceId: number;
  eventId: number;
  resourceId: number;
  isDeleted: boolean;
}

export interface ApiEventResponsible {
  eventResponsibleId: number;
  eventId: number;
  responsibleRole: string;
  isDeleted: boolean;
  name: string;
}

export interface ApiCampus {
  campusId: number;
  name: string;
  city: string;
  department: string;
  isDeleted: boolean;
  currentStudentCount: number | null;
}

export interface ApiStrategicArea {
  strategicAreaId: number;
  name: string;
  peiId: number;
  isDeleted: boolean;
}

export interface ApiStrategicObjective {
  strategicObjectiveId: number;
  description: string;
  strategicAreaId: number;
  isDeleted: boolean;
  strategicArea: ApiStrategicArea;
}

export interface ApiStrategy {
  strategyId: number;
  description: string;
  strategicObjectiveId: number;
  completionPercentage: number;
  assignedBudget: number;
  executedBudget: number | null;
  isDeleted: boolean;
  strategicObjective: ApiStrategicObjective;
}

export interface ApiInterventionEventIntervention {
  eventId: number;
  interventionId: number;
  isDeleted: boolean;
}

export interface ApiIntervention {
  interventionId: number;
  name: string;
  isDeleted: boolean;
  strategyId: number;
  eventIntervention: ApiInterventionEventIntervention;
  strategy: ApiStrategy;
}

export interface ApiOdsEventOds {
  eventId: number;
  odsId: number;
  isDeleted: boolean;
}

export interface ApiOds {
  odsId: number;
  name: string;
  description: string | null;
  isDeleted: boolean;
  sortNo: number;
  colorHex: string;
  event_ods: ApiOdsEventOds;
}

export interface ApiApprovalStatus {
  statusId: number;
  name: string;
  description: string;
  isDeleted: boolean;
}

export interface ApiEventApproval {
  approvalId: number;
  eventId: number;
  approverUserId: number | null;
  approverRoleId: number;
  approvalStageId: number | null;
  approvalStatusId: number;
  comments: string;
  approvalDate: string;
  isDeleted: boolean;
  approvalStage: any | null;
  approvalStatus: ApiApprovalStatus;
}

export interface ApiUser {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  roleId: number;
  facultyId: number;
  isDeleted: boolean;
}

export interface ApiEvent {
  eventId: number;
  name: string;
  type: string;
  poaId: number;
  completionPercentage: number;
  campusId: number;
  eventNature: string;
  isDeleted: boolean;
  objective: string;
  isDelayed: boolean;
  achievementIndicator: string;
  purchaseTypeId: number;
  purchaseType: ApiPurchaseType;
  totalCost: number;
  processDocumentPath: string | null;
  costDetailDocumentPath?: string | null;
  createdAt: string;
  updatedAt: string | null;
  userId: number;
  dates: ApiEventDate[];
  financings: ApiEventFinancing[];
  responsibles: ApiEventResponsible[];
  costDetails: any[];
  campus: ApiCampus;
  interventions: ApiIntervention[];
  ods: ApiOds[];
  eventApprovals: ApiEventApproval[];
  user: ApiUser;
  institutionalResources: ApiInstitutionalResource[];
}

// Interfaces existentes
export interface DateInterval {
  inicio: string;
  fin: string;
}

export interface PlanningEvent {
  id: string;
  areaEstrategica: string;
  objetivoEstrategico: string;
  estrategias: string;
  intervencion: string;
  ods: string;
  tipoEvento: 'actividad' | 'proyecto';
  evento: string;
  objetivo: string;
  fechas: DateInterval[];
  costoTotal: number;
  aporteUMES: number;
  aporteOtros: number;
  tipoCompra: string;
  detalle: string;
  responsables: {
    principal: string;
    ejecucion: string;
    seguimiento: string;
  };
  recursos: string;
  indicadorLogro: string;
  detalleProceso: string;
  comentarioDecano: string;
  propuestoPor: string;
  fechaCreacion: string;
  fechaEdicion: string;
  estado: 'revision' | 'aprobado' | 'rechazado' | 'correccion';
  aportesPEI: {
    event: {
      eventId: number;
      name: string;
      interventions: Array<{
        interventionId: number;
        name: string;
        strategies: Array<{
          strategyId: number;
          description: string;
          strategicObjective: {
            strategicObjectiveId: number;
            description: string;
            strategicArea: {
              strategicAreaId: number;
              name: string;
            };
          };
        }>;
      }>;
    };
  };
  campus: string;
  naturalezaEvento: string;
}

export interface SectionProps {
  name: string;
  isActive: boolean;
  poaId: number;
  facultyId: number;
  isEditable: boolean;
  userId: number;
}
