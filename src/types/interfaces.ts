// components/EventsViewer/interfaces.ts

// Interfaces para los datos de la API
/** Interface para fechas de eventos */
export interface ApiEventDate {
  eventDateId: number;
  eventId: number;
  startDate: string;
  endDate: string;
  isDeleted: boolean;
}

/** Interface para financiamiento de eventos */
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

/** Interface para responsables de eventos */
export interface ApiEventResponsible {
  eventResponsibleId: number;
  eventId: number;
  responsibleRole: 'Principal' | 'Ejecución' | 'Seguimiento';
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

/** Interface para objetivos estratégicos */
export interface ApiStrategicObjective {
  strategicObjectiveId: number;
  description: string;
  strategicAreaId: number;
  isDeleted: boolean;
  strategicArea: ApiStrategicArea;
}

/** Interface para estrategias */
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

/** Interface para detalles de costos */
export interface ApiCostDetail {
  costDetailId: number;
  eventId: number;
  filePath: string;
  fileName: string;
  isDeleted: boolean;
}

/** Interface para archivos */
export interface ApiFile {
  fileId: number;
  eventId: number;
  filePath: string;
  fileName: string;
  uploadedAt: string;
  isDeleted: boolean;
}

/**
 * Interfaz que define la estructura de la response de la API para un evento
 */
/** Interface que define la estructura principal de un evento en la API */
export interface ApiEvent {
  eventId: number;                           /** ID único del evento */
  name: string;                              /** Nombre del evento */
  type: string;                              /** Tipo de evento */
  poaId: number;                            /** ID del POA asociado */
  completionPercentage: number;              /** Porcentaje de completitud del evento */
  campusId: number;                          /** ID del campus donde se realiza */
  eventNature: string;                       /** Naturaleza o categoría del evento */
  isDeleted: boolean;                        /** Indica si el evento está eliminado */
  objective: string;                         /** Objetivo principal del evento */
  isDelayed: boolean;                        /** Indica si el evento está retrasado */
  achievementIndicator: string;              /** Indicador de logro o cumplimiento */
  purchaseTypeId: number;                    /** ID del tipo de compra asociado */
  totalCost: number;                         /** Costo total del evento */
  createdAt: string;                         /** Fecha de creación */
  updatedAt: string | null;                  /** Fecha de última actualización */
  userId: number;                            /** ID del usuario creador */
  statusId: number;                          /** ID del estado actual del evento (ejecutado, planificado, finalizado) */
  dates: ApiEventDate[];                     /** Fechas asociadas al evento */
  financings: ApiEventFinancing[];           /** Fuentes de financiamiento */
  responsibles: ApiEventResponsible[];       /** Responsables del evento */
  costDetails: ApiCostDetail[];              /** Detalles de costos */
  files: ApiFile[];                          /** Archivos adjuntos */
  campus: ApiCampus;                         /** Información del campus (sede) */
  interventions: ApiIntervention[];          /** Intervenciones asociadas */
  ods: ApiOds[];                            /** Objetivos de Desarrollo Sostenible */
  eventApprovals: ApiEventApproval[];        /** Aprobaciones del evento */
  user: ApiUser;                             /** Información del usuario creador */
  purchaseType: ApiPurchaseType;             /** Tipo de compra */
  institutionalResources: ApiInstitutionalResource[]; /** Recursos institucionales requeridos */
}

// Interfaces existentes
export interface DateInterval {
  inicio: string;
  fin: string;
}

/**
 * Interfaz que define la estructura de una fila de la tabla de eventos del POA
 */
export interface PlanningEvent {
  /** Identificador único del evento */
  id: string;
  /** Área estratégica asociada */
  areaEstrategica: string;
  /** Objetivo estratégico asociado */
  objetivoEstrategico: string;
  /** Estrategias relacionadas */
  estrategias: string;
  /** Intervención específica */
  intervencion: string;
  /** Objetivos de Desarrollo Sostenible relacionados */
  ods: string;
  /** Tipo de evento: puede ser actividad o proyecto */
  tipoEvento: 'actividad' | 'proyecto';
  /** Nombre del evento */
  evento: string;
  /** Objetivo principal del evento */
  objetivo: string;
  /** Intervalos de fechas del evento */
  fechas: DateInterval[];
  /** Costo total del evento */
  costoTotal: number;
  /** Aporte económico de UMES */
  aporteUMES: {
    "financingSourceId": number,
    "percentage": number,
    "amount": number
  }[];
  /** Aportes económicos de otras fuentes */
  aporteOtros: {
    "financingSourceId": number,
    "percentage": number,
    "amount": number
  }[];
  /** Clasificación del tipo de compra */
  tipoCompra: string;
  /** Detalles adicionales del evento */
  detalle: {
    id: number;
    name: string;
  }[];
  /** Responsables del evento */
  responsables: {
    /** Responsable principal del evento */
    principal: string;
    /** Responsable de la ejecución */
    ejecucion: string;
    /** Responsable del seguimiento */
    seguimiento: string;
  };
  /** Recursos necesarios para el evento */
  recursos: string;
  /** Indicadores de logro del evento */
  indicadorLogro: string;
  /** Detalles del proceso */
  detalleProceso: {
    id: number;
    name: string;
  }[];
  /** Comentarios del decano */
  comentarioDecano: string;
  /** Usuario que propuso el evento */
  propuestoPor: string;
  /** Fecha de creación del evento */
  fechaCreacion: string;
  /** Fecha de última edición */
  fechaEdicion: string;
  /** Estado actual del evento */
  estado: 'revision' | 'aprobado' | 'rechazado' | 'correccion';
  /** Estructura jerárquica de aportes al PEI */
  aportesPEI: {
    event: {
      /** ID del evento en PEI */
      eventId: number;
      /** Nombre del evento */
      name: string;
      /** Array de intervenciones */
      interventions: Array<{
        /** ID de la intervención */
        interventionId: number;
        /** Nombre de la intervención */
        name: string;
        /** Array de estrategias */
        strategies: Array<{
          /** ID de la estrategia */
          strategyId: number;
          /** Descripción de la estrategia */
          description: string;
          /** Objetivo estratégico */
          strategicObjective: {
            /** ID del objetivo estratégico */
            strategicObjectiveId: number;
            /** Descripción del objetivo estratégico */
            description: string;
            /** Área estratégica */
            strategicArea: {
              /** ID del área estratégica */
              strategicAreaId: number;
              /** Nombre del área estratégica */
              name: string;
            };
          };
        }>;
      }>;
    };
  };
  /** Campus donde se realiza el evento */
  campus: string;
  /** Naturaleza o tipo del evento */
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
