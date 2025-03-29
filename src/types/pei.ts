// src/types/pei.ts

export type Intervention = {
	interventionId?: number;
	name: string;
};

export interface Strategy {
	strategyId?: number; // IDs son opcionales
	tempId?: string;
	description: string;
	completionPercentage: number;
	assignedBudget: number;
	executedBudget: number;
	interventions: Intervention[];
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
	strategicObjective: StrategicObjective;
}

export interface PEI {
	peiId?: number; // IDs son opcionales
	tempId?: string;
	name: string;
	status: 'Activo' | 'Inactivo';
	strategicAreas: StrategicArea[];
	startYear: number;
	endYear: number;
}
