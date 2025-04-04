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
  dates: { startDate: string; endDate: string }[];
  financings: eventExecutionFinancings[];
  statusId: number;
  eventApprovals: { approvalStatusId: number }[];
  costDetails?: ApiCostDetail[];
}

export interface FinancingSource {
  financingSourceId: number;
  name: string;
  category: string;
}

export interface eventExecutionFinancings {
  eventExecutionFinancingId: number;
  eventId: number;
  amount: number;
  percentage: number;
  financingSourceId: number;
};

export interface RequestEventExecution {
  eventId: number;
  eventExecutionDates: {
    eventId: number;
    startDate: string;
  }[];
  eventExecutionFinancings: eventExecutionFinancings[];
}

interface EventExecutionFile {
  fileId: number;
  fileName: string;
  filePath: string;
  uploadedAt: string;
}

interface ResponseEventExecutionDate {
  eventExecutionDateId: number;
  startDate: string;
  endDate: string;
  reasonForChange: string | null;
  isDeleted: boolean;
}

interface ResponseEventExecutionFinancing {
  eventExecutionFinancingId: number;
  financingSourceId: number;
  amount: number;
  percentage: number;
  reasonForChange: string | null;
  isDeleted: boolean;
}

interface EventResponsible {
  eventResponsibleId: number;
  responsibleRole: string;
  name: string;
}

export interface ResponseExecutedEvent {
  eventId: number;
  name: string;
  objective: string;
  campus: string;
  totalCost: number;
  eventExecutionDates: ResponseEventExecutionDate[];
  eventExecutionFinancings: ResponseEventExecutionFinancing[];
  eventExecutionFiles: EventExecutionFile[];
  eventResponsibles: EventResponsible[];
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
  eventExecutionDates: {
    eventExecutionDateId: number;
    startDate: string;
    reasonForChange: string;
    isDeleted: boolean;
  }[];
  eventExecutionFinancings: {
    eventExecutionFinancingId: number;
    financingSourceId: number;
    amount: number;
    percentage: number;
    reasonForChange: string;
    isDeleted: boolean;
  }[];
}
