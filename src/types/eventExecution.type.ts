// src/types/eventExecution.type.ts

import { ApiCostDetail } from "./interfaces";

export interface FormValues {
  eventId: string;
  eventName: string;
  executionResponsible: string;
  campus: string;
  aportesUmes: eventExecutionFinancings[];
  aportesOtros: eventExecutionFinancings[];
  archivosGastos: File[];
  fechas: ResponseEventExecutionDate[];
}

export interface EventExecution {
  eventId: number;
  name: string;
  objective: string;
  campus: { name: string };
  responsibles: { responsibleRole: string; name: string }[];
  totalCost: number;
  dates: { startDate: string; endDate: string; statusId: number; eventDateId: number }[];
  financings: eventExecutionFinancings[];
  statusId: number[];
  eventApprovals: { approvalStatusId: number }[];
  costDetails?: ApiCostDetail[];
}

export interface FinancingSource {
  financingSourceId: number;
  name: string;
  category: string;
}

export interface eventExecutionFinancings {
  eventExecutionFinancingId: number
  eventId: number
  amount: number
  percentage: number
  financingSourceId: number
};

export interface EventDatesWithExecution {
  eventId: number
  eventDateId: number
  executionStartDate: string
}

export interface RequestEventExecution {
  eventId: number
  eventDatesWithExecution: EventDatesWithExecution[]
  eventExecutionFinancings: eventExecutionFinancings[]
}

interface EventExecutionFile {
  fileId: number;
  fileName: string;
  filePath: string;
  uploadedAt: string;
}

export interface ResponseEventExecutionDate {
  eventDateId: number
  startDate: string
  endDate: string
  executionStartDate: string
  executionEndDate: any
  reasonForChange: any
  statusId: number
  isEnabled?: boolean /** @info: no es respuesta de la API, es un campo que se agrega en el formulario, para indicar si la fecha se envia o no al backend */
}

export interface ResponseEventExecutionFinancing {
  eventExecutionFinancingId: number
  financingSourceId: number
  amount: number
  percentage: number
  reasonForChange: any
  isDeleted: boolean
}

export interface EventResponsible {
  eventResponsibleId: number
  responsibleRole: string
  name: string
}

export interface ResponseExecutedEvent {
  eventId: number
  name: string
  objective: string
  campus: string
  totalCost: number
  eventDates: ResponseEventExecutionDate[]
  eventExecutionFinancings: ResponseEventExecutionFinancing[]
  eventExecutionFiles: EventExecutionFile[]
  eventResponsibles: EventResponsible[]
}

export type Aporte = {
  tipo: string;
  monto: string;
};

// Definir un tipo para los nombres de campos válidos
export type FormFieldPaths =
  | "eventId"
  | "eventName"
  | "executionResponsible"
  | "campus"
  | "aportesUmes"
  | "aportesOtros"
  | "archivosGastos"
  | "fechas"
  | `fechas.${number}.startDate`
  | `fechas.${number}.executionStartDate`
  | `aportesUmes.${number}.eventId`
  | `aportesUmes.${number}.amount`
  | `aportesUmes.${number}.percentage`
  | `aportesUmes.${number}.financingSourceId`
  | `aportesOtros.${number}.eventId`
  | `aportesOtros.${number}.amount`
  | `aportesOtros.${number}.percentage`
  | `aportesOtros.${number}.financingSourceId`;

export interface UpdateEventExecutedPayload {
  eventId: number;
  eventDatesWithExecution: {
    eventId: number;
    eventDateId: number;
    executionStartDate: string;
  }[];
  eventExecutionFinancings: {
    eventExecutionFinancingId: number;
    eventId: number;
    amount: number;
    percentage: number;
    financingSourceId: number;
  }[];
}
