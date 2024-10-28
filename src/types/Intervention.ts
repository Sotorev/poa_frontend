// src/types/Intervention.ts

export interface Intervention {
    interventionId: number;
    name: string;
    strategyId: number;
    isDeleted?: boolean;
  }
  
  export interface CreateInterventionInput {
    name: string;
    strategyId: number;
  }
  
  export interface UpdateInterventionInput {
    interventionId: number;
    name?: string;
    strategyId?: number;
    isDeleted?: boolean;
  }
  