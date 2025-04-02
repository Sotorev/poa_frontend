import { z } from 'zod'
import { StrategySchema, StrategyUpdateSchema, approveStrategySchema, StrategyProposalSchema } from './schema.strategy'

export type StrategyRequest = z.infer<typeof StrategySchema>
export type StrategyUpdateRequest = z.infer<typeof StrategyUpdateSchema>
export type StrategyProposal = z.infer<typeof StrategyProposalSchema>
export type ApproveStrategy = z.infer<typeof approveStrategySchema>

export interface StrategyProposalResponse {
    strategyId: number
    description: string
    completionPercentage: number
    assignedBudget: number
    executedBudget?: number
    isDeleted: boolean
    createdAt: string
    updatedAt: string
    status: string
    reasonForChange: string
    strategicAreaId: number
    user: UserResponse
}

export interface UserResponse {
    userId: number
    firstName: string
    lastName: string
    email: string
}