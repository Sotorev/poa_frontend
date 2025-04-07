import { FilaPlanificacionForm } from "./schema.eventPlanningForm";

interface DatePair {
  start: Date;
  end: Date;
}

export interface FilaPlanificacion extends FilaPlanificacionForm {
  id: string;
  estado: "planificado" | "aprobado" | "rechazado";
  comentarioDecano: string;
  fechas: DatePair[];
  fechaProyecto: DatePair;
  entityId: number | null;
}

export interface FilaError {
  [key: string]: string;
}

export interface DateInterval {
  inicio: string;
  fin: string;
}

export interface PlanningEvent {
  id: string /** Identificador único del evento */;
  areaEstrategica: string;
  objetivoEstrategico: string;
  estrategias: string;
  intervencion: string;
  ods: string;
  tipoEvento: "actividad" | "proyecto";
  evento: string /** Nombre del evento */;
  objetivo: string /** Objetivo principal del evento */;
  fechas: DateInterval[];
  costoTotal: number;
  aporteUMES: {
    financingSourceId: number;
    percentage: number;
    amount: number;
  }[];
  aporteOtros: {
    financingSourceId: number;
    percentage: number;
    amount: number;
  }[];
  tipoCompra: string;

  /** Responsables del evento */
  responsables: {
    principal: string;
    ejecucion: string;
    seguimiento: string;
  };
  recursos: string /** Recursos necesarios para el evento como el departamento de publicidad, coro, etc*/;
  indicadorLogro: string;
  detalleProceso: {
    fileId: number;
    eventId: number;
    filePath: string;
    fileName: string;
    uploadedAt: string;
    isDeleted: boolean;
  }[];
  detalle: {
    costDetailId: number;
    eventId: number;
    filePath: string;
    fileName: string;
    isDeleted: boolean;
  }[];
  comentarioDecano: string;
  propuestoPor: string;
  fechaCreacion: string;
  fechaEdicion: string;
  estado: "revision" | "aprobado" | "rechazado" | "correccion";
  aportesPEI: {
    event: {
      eventId: number;
      name: string /** Nombre del evento */;
      interventions: Array<{
        interventionId: number;
        name: string /** Nombre de la intervención */;
        strategies: Array<{
          strategyId: number;
          description: string /** Descripción de la estrategia */;
          strategicObjective: {
            strategicObjectiveId: number;
            description: string;
            strategicArea: {
              strategicAreaId: number;
              name: string /** Nombre del área estratégica */;
            };
          };
        }>;
      }>;
    };
  };
  campus: string /** Campus donde se realiza el evento */;
  naturalezaEvento: string /** Si esta planificado el evento o es un evento extraordinario */;
}

// Updated Types
export interface ResponseFullEvent {
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
  totalCost: number;
  createdAt: string;
  updatedAt: string | null;
  userId: number;
  statusId: number;
  dates: Array<{
    eventDateId: number;
    eventId: number;
    startDate: string;
    endDate: string;
    isDeleted: boolean;
  }>;
  financings: Array<{
    eventFinancingId: number;
    eventId: number;
    financingSourceId: number;
    amount: number;
    percentage: number;
    isDeleted: boolean;
  }>;
  responsibles: Array<{
    eventResponsibleId: number;
    eventId: number;
    responsibleRole: string;
    isDeleted: boolean;
    name: string;
  }>;
  costDetails: Array<{
    costDetailId: number;
    eventId: number;
    filePath: string;
    fileName: string;
    isDeleted: boolean;
  }>;
  files: Array<{
    fileId: number;
    eventId: number;
    filePath: string;
    fileName: string;
    uploadedAt: string;
    isDeleted: boolean;
  }>;
  campus: {
    campusId: number;
    name: string;
    city: string;
    department: string;
    isDeleted: boolean;
    currentStudentCount: number | null;
  };
  interventions: Array<{
    interventionId: number;
    name: string;
    isDeleted: boolean;
    strategyId: number;
    status: "Aprobado" | "Pendiente" | "Rechazado";
    eventIntervention: {
      eventId: number;
      interventionId: number;
      isDeleted: boolean;
    };
    strategy: {
      strategyId: number;
      description: string;
      strategicObjectiveId: number;
      completionPercentage: number;
      assignedBudget: number;
      executedBudget: number | null;
      isDeleted: boolean;
      strategicObjective: {
        strategicObjectiveId: number;
        description: string;
        strategicAreaId: number;
        isDeleted: boolean;
        strategicArea: {
          strategicAreaId: number;
          name: string;
          peiId: number;
          isDeleted: boolean;
        };
      };
    };
  }>;
  ods: Array<{
    odsId: number;
    name: string;
    description: string | null;
    isDeleted: boolean;
    sortNo: number;
    colorHex: string;
    event_ods: {
      eventId: number;
      odsId: number;
      isDeleted: boolean;
    };
  }>;
  eventApprovals: Array<{
    approvalId: number;
    eventId: number;
    approverUserId: number | null;
    approverRoleId: number | null;
    approvalStageId: number | null;
    approvalStatusId: number;
    approvalDate: string;
    isDeleted: boolean;
    approvalStage: {
      stageId: number;
      name: string;
      description: string;
      isDeleted: boolean;
    } | null;
    approvalStatus: {
      statusId: number;
      name: string;
      description: string;
      isDeleted: boolean;
    };
  }>;
  user: {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
    roleId: number;
    facultyId: number;
    isDeleted: boolean;
  };
  purchaseType: {
    purchaseTypeId: number;
    name: string;
    isDeleted: boolean;
  };
  institutionalResources: Array<{
    resourceId: number;
    name: string;
    event_resource: {
      eventResourceId: number;
      eventId: number;
      resourceId: number;
      isDeleted: boolean;
    };
  }>;
}

export interface Session {
  user: {
    userId: number;
    username: string;
    role: {
      roleName: string;
      roleId: number;
    };
    token: string;
    permissions: {
      permissionId: number;
      moduleName: string;
      action: string;
      description: string;
    }[];
  }
}

// Interfaz de errores para el modal
export interface ValidationErrors {
  hasErrors: boolean;
  errorList: {
    field: string;
    message: string;
  }[];
  phaseErrors?: {
    pei?: boolean;
    info?: boolean;
    finance?: boolean;
  };
}
