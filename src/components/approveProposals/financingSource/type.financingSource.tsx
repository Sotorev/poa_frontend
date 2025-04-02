import { z } from 'zod'
import { AreaObjectiveStrategicSchema, AreaObjectiveStrategicUpdateSchema, approveAreaObjectiveStrategicSchema, AreaObjectiveStrategicProposalSchema } from './schema.financingSource'

export type AreaObjectiveStrategicRequest = z.infer<typeof AreaObjectiveStrategicSchema>
export type AreaObjectiveStrategicUpdateRequest = z.infer<typeof AreaObjectiveStrategicUpdateSchema>
export type AreaObjectiveStrategicProposal = z.infer<typeof AreaObjectiveStrategicProposalSchema>
export type ApproveAreaObjectiveStrategic = z.infer<typeof approveAreaObjectiveStrategicSchema>

export interface AreaObjectiveStrategicProposalResponse {
    strategicAreaId: number
    name: string
    peiId: number
    strategicObjective: string
    isDeleted: boolean
    createdAt: string
    updatedAt: string
    status: string
    reasonForChange?: string
    user?: UserResponse
}

export interface UserResponse {
    userId: number
    firstName: string
    lastName: string
    email: string
}