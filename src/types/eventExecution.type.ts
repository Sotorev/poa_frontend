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
  fechas: { fecha: string }[];
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
    endDate: string;
  }[];
  eventExecutionFinancings: eventExecutionFinancings[];
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
  | `fechas.${number}.fecha`
  | `aportesUmes.${number}.eventId`
  | `aportesUmes.${number}.amount`
  | `aportesUmes.${number}.percentage`
  | `aportesUmes.${number}.financingSourceId`
  | `aportesOtros.${number}.eventId`
  | `aportesOtros.${number}.amount`
  | `aportesOtros.${number}.percentage`
  | `aportesOtros.${number}.financingSourceId`;
