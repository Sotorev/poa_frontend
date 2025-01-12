// src/types/approvalStatus.ts

export interface RequestEventExecution {
    eventId: number;
    eventExecutionDates: RequestEventExecutionDate[];
    eventExecutionFinancings: RequestEventExecutionFinancing[];
}

export interface RequestEventExecutionDate {
    eventId: number;
    startDate: string;
    endDate: string;
}

export interface RequestEventExecutionFinancing {
    eventId: number;
    amount: number;
    percentage: number;
    financingSourceId: number;
}