// src/types/pei.ts

export interface Strategy {
	strategyId?: number; // IDs son opcionales
	tempId?: string;
	description: string;
	completionPercentage: number;
	assignedBudget: number;
	executedBudget: number;
}

export interface StrategicObjective {
	strategicObjectiveId?: number; // IDs son opcionales
	tempId?: string;
	description: string;
	strategies: Strategy[];
}

export interface StrategicArea {
	strategicAreaId?: number; // IDs son opcionales
	tempId?: string;
	name: string;
	strategicobjective: StrategicObjective;
}

export interface PEI {
	peiId?: number; // IDs son opcionales
	tempId?: string;
	name: string;
	status: 'Active' | 'Inactive';
	strategicareas: StrategicArea[];
}
