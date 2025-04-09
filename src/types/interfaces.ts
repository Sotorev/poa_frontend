// components/EventsViewer/interfaces.ts

export interface ApiEventDate {
  eventDateId: number
  eventId: number
  startDate: string
  endDate: string
  isDeleted: boolean
  executionStartDate?: string
  executionEndDate: any
  statusId: number
  reasonForChange: any
}

export interface ApiEventFinancing {
  eventFinancingId: number
  eventId: number
  financingSourceId: number
  amount: number
  percentage: number
  isDeleted: boolean
}

export interface ApiEventResponsible {
  eventResponsibleId: number
  eventId: number
  responsibleRole: string
  isDeleted: boolean
  name: string
}

export interface ApiCostDetail {
  costDetailId: number
  eventId: number
  filePath: string
  fileName: string
  isDeleted: boolean
}

export interface ApiFile {
  fileId: number
  eventId: number
  filePath: string
  fileName: string
  uploadedAt: string
  isDeleted: boolean
}

export interface ApiCampus {
  campusId: number
  name: string
  city: string
  department: string
  isDeleted: boolean
  currentStudentCount?: number
}

export interface ApiIntervention {
  interventionId: number
  name: string
  isDeleted: boolean
  strategyId: number
  status: string
  createdAt: string
  updatedAt: string
  userId: any
  reasonForChange: any
  eventIntervention: ApiInterventionEventIntervention
  strategy: ApiStrategy
}

export interface ApiInterventionEventIntervention {
  eventId: number
  interventionId: number
  isDeleted: boolean
}

export interface ApiStrategy {
  strategyId: number
  description: string
  completionPercentage: number
  assignedBudget: number
  executedBudget?: number
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  userId: any
  status: string
  reasonForChange: any
  strategicAreaId: number
  strategicArea: StrategicArea
}

export interface StrategicArea {
  strategicAreaId: number
  name: string
  peiId: number
  strategicObjective: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  userId: any
  status: string
  reasonForChange: any
}

export interface ApiOds {
  odsId: number
  name: string
  description: any
  isDeleted: boolean
  sortNo: number
  colorHex: string
  event_ods: ApiOdsEventOds
}

export interface ApiOdsEventOds {
  eventId: number
  odsId: number
  isDeleted: boolean
}

export interface ApiEventApproval {
  approvalId: number
  eventId: number
  approverUserId?: number
  approverRoleId?: number
  approvalStageId?: number
  approvalStatusId: number
  approvalDate: string
  isDeleted: boolean
  approvalStage?: ApprovalStage
  approvalStatus: ApiApprovalStatus
}

export interface ApprovalStage {
  stageId: number
  name: string
  description: string
  isDeleted: boolean
}

export interface ApiApprovalStatus {
  statusId: number
  name: string
  description: string
  isDeleted: boolean
}

export interface ApiUser {
  userId: number
  firstName: string
  lastName: string
  email: string
  roleId: number
  facultyId: number
  username: string
  isDeleted: boolean
}

export interface ApiPurchaseType {
  purchaseTypeId: number
  name: string
  isDeleted: boolean
  userId: any
  createdAt: string
  updatedAt: string
  reasonForChange: any
  status: string
}

export interface ApiInstitutionalResource {
  resourceId: number
  name: string
  status: string
  userId?: number
  createdAt: string
  updatedAt: string
  reasonForChange: any
  isDeleted: boolean
  event_resource: ApiEventResource
}

export interface ApiEventResource {
  eventResourceId: number
  eventId: number
  resourceId: number
  isDeleted: boolean
}

/** Interface que define la estructura principal de un evento en la API */
export interface ApiEvent {
  eventId: number
  name: string
  type: string /* actividad o proyecto */
  poaId: number
  completionPercentage: number
  campusId: number
  eventNature: string /* planificado o no planificado */
  isDeleted: boolean
  objective: string
  isDelayed: boolean
  achievementIndicator: string
  purchaseTypeId: number
  totalCost: number
  createdAt: string
  updatedAt?: string
  userId: number
  dates: ApiEventDate[] 
  financings: ApiEventFinancing[]
  responsibles: ApiEventResponsible[]
  costDetails: ApiCostDetail[] /* Archivos de costos */
  files: ApiFile[] /* Archivos de planificacion */
  campus: ApiCampus
  interventions: ApiIntervention[]
  ods: ApiOds[]
  eventApprovals: ApiEventApproval[]
  user: ApiUser
  purchaseType: ApiPurchaseType
  institutionalResources: ApiInstitutionalResource[] /* Recursos institucionales como Publicidad, Coro, etc. */
}

export interface ApiStrategicArea {
  strategicAreaId: number;
  strategicObjective: string;
  name: string;
  peiId: number;
  isDeleted: boolean;
}


// Interfaces existentes
export interface DateInterval {
  eventDateId: number;
  inicio: string;
  fin: string;
  isDeleted: boolean;
}

/**
 * Interfaz que define la estructura de una fila de la tabla de eventos del POA
 */
export interface PlanningEvent {
  id: string; // Identificador único del evento
  areaEstrategica: string;
  objetivoEstrategico: string;
  estrategias: string;
  intervencion: string;
  ods: string;
  tipoEvento: "actividad" | "proyecto";
  evento: string; // Nombre del evento
  objetivo: string; // Objetivo principal del evento
  fechas: DateInterval[]; // Fechas de inicio y fin del evento
  costoTotal: number;
  aporteUMES: {
    eventFinancingId: number;
    financingSourceId: number;
    percentage: number;
    amount: number;
    isDeleted: boolean;
  }[];
  aporteOtros: {
    eventFinancingId: number;
    financingSourceId: number;
    percentage: number;
    amount: number;
    isDeleted: boolean;
  }[];
  tipoCompra: string;
  detalle: {
    costDetailId: number;
    eventId: number;
    filePath: string;
    fileName: string;
    isDeleted: boolean;
  }[];
  responsables: {
    eventResponsibleId: number;
    responsibleRole: string;
    name: string;
  }[];
  recursos: string;
  indicadorLogro: string;
  detalleProceso: {
    fileId: number;
    eventId: number;
    filePath: string;
    fileName: string;
    uploadedAt: string;
    isDeleted: boolean;
  }[];
  comentarioDecano: string;
  propuestoPor: string;
  fechaCreacion: string; // Fecha de creación del evento
  fechaEdicion: string; // Fecha de última edición del evento
  estado: "revision" | "aprobado" | "rechazado" | "correccion";
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
            description: string; // Descripción del objetivo estratégico
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
  naturalezaEvento: string; // Naturaleza del evento Planificado o No planificado
}

export interface SectionProps {
  name: string;
  isActive: boolean;
  poaId: number;
  facultyId: number;
  isEditable: boolean;
  userId: number;
}
