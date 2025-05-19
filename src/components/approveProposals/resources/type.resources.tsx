import { z } from 'zod'
import { ResourcesSchema, ResourcesUpdateSchema, approveResourcesSchema, ResourcesProposalSchema } from './schema.resources'

export type ResourcesRequest = z.infer<typeof ResourcesSchema>
export type ResourcesUpdateRequest = z.infer<typeof ResourcesUpdateSchema>
export type ResourcesProposal = z.infer<typeof ResourcesProposalSchema>
export type ApproveResources = z.infer<typeof approveResourcesSchema>

export interface ResourcesProposalResponse {
    resourceId: number
    name: string
    status: string
    userId?: number
    createdAt: string
    updatedAt: string
    reasonForChange: string
    isDeleted: boolean
    user?: UserResponse
}

export interface UserResponse {
    userId: number
    firstName: string
    lastName: string
    email: string
}