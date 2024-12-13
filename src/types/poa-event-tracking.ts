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

