import { z } from 'zod'
import { InterventionSchema, InterventionUpdateSchema, approveInterventionSchema, InterventionProposalSchema } from './schema.intervention'

export type InterventionRequest = z.infer<typeof InterventionSchema>
export type InterventionUpdateRequest = z.infer<typeof InterventionUpdateSchema>
export type InterventionProposal = z.infer<typeof InterventionProposalSchema>
export type ApproveIntervention = z.infer<typeof approveInterventionSchema>

export interface InterventionProposalResponse {
    interventionId: number
    name: string
    isDeleted: boolean
    strategyId: number
    status: string
    createdAt: string
    updatedAt: string
    userId: any
    reasonForChange: any
    user: any
}