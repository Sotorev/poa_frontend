import { z } from 'zod'
import { PurchaseTypeSchema, PurchaseTypeUpdateSchema, approvePurchaseTypeSchema, PurchaseTypeProposalSchema } from './schema.purchaseType'

export type PurchaseTypeRequest = z.infer<typeof PurchaseTypeSchema>
export type PurchaseTypeUpdateRequest = z.infer<typeof PurchaseTypeUpdateSchema>
export type PurchaseTypeProposal = z.infer<typeof PurchaseTypeProposalSchema>
export type ApprovePurchaseType = z.infer<typeof approvePurchaseTypeSchema>

export interface PurchaseTypeProposalResponse {
    purchaseTypeId: number
    name: string
    isDeleted: boolean
    userId: number
    createdAt: string
    updatedAt: string
    reasonForChange: string
    status: string
    user: UserResponse
}

export interface UserResponse {
    userId: number
    firstName: string
    lastName: string
    email: string
}