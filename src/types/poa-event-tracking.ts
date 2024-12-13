// /src/types/poa-event-tracking.ts

export type Aporte = {
  tipo: string;
  monto: string;
};

export type ExecutedEvent = {
  id: string;
  name: string;
  executionDates: Date[];
  aportesUmes: Aporte[];
  aportesOtros: Aporte[];
  archivosGastos?: File[];
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
