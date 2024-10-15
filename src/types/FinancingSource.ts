// src/types/FinancingSource.ts
export interface FinancingSource {
    financingSourceId: number;
    name: string;
    category: 'UMES' | 'Otra';
    isDeleted: boolean;
  }
  