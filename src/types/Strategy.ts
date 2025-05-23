// src/types/Strategy.ts

export interface Strategy {
    strategyId: number;
    description: string;
    strategicAreaId: number;
    completionPercentage: number;
    assignedBudget: number;
    executedBudget: number;
    isDeleted: boolean;
    isCustom?: boolean;
  }
  
  export interface CreateStrategyInput {
    description: string;
    strategicObjectiveId: number;
    completionPercentage: number;
    assignedBudget: number;
    executedBudget: number;
  }
  
  export interface UpdateStrategyInput {
    strategyId: number;
    description?: string;
    strategicAreaId?: number;
    completionPercentage?: number;
    assignedBudget?: number;
    executedBudget?: number;
  }
  