// src/types/Intervention.ts

export interface Intervention {
    interventionId: number;
    name: string;
    isDeleted: boolean;
    strategyId: number;
    isCustom?: boolean;
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
  