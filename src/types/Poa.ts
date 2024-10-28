// src/types/Poa.ts

export interface Poa {
    poaId: number;
    year: string; // O puedes utilizar Date si prefieres
    facultyId: number;
    userId: number | null;
    submissionDate?: string;
    status?: string;
    completionPercentage?: number;
    assignedBudget?: number;
    executedBudget?: number;
    peiId: number;
    submissionStatus?: string;
    isDeleted?: boolean;
  }
  