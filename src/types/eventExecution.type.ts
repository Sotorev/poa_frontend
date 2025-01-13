// src/types/eventExecution.type.ts

import { ApiCostDetail } from "./interfaces";

export interface FormValues {
  eventId: string;
  eventName: string;
  executionResponsible: string;
  campus: string;
  aportesUmes: { tipo: string; monto: string }[];
  aportesOtros: { tipo: string; monto: string }[];
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
  financings: { financingSourceId: number; amount: number }[];
  statusId: number;
  eventApprovals: { approvalStatusId: number }[];
  costDetails?: ApiCostDetail[];
}

export interface FinancingSource {
  financingSourceId: number;
  name: string;
  category: string;
}

export interface RequestEventExecution {
  eventId: number;
  eventExecutionDates: {
    eventId: number;
    startDate: string;
    endDate: string;
  }[];
  eventExecutionFinancings: {
    eventId: number;
    amount: number;
    percentage: number;
    financingSourceId: number;
  }[];
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
  | `aportesUmes.${number}.tipo`
  | `aportesUmes.${number}.monto`
  | `aportesOtros.${number}.tipo`
  | `aportesOtros.${number}.monto`
  | `fechas.${number}.fecha`;
