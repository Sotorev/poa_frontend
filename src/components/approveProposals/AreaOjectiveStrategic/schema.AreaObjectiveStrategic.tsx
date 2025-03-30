import z from 'zod'

export const proposeAreaObjectiveStrategicSchema = z.object({
    nameArea: z.string().min(1, { message: 'El área estratégica es requerida' }),
    nameObjective: z.string().min(1, { message: 'El objetivo estratégico es requerido' }),
})

export const approveAreaObjectiveStrategicSchema = z.object({
    id: z.number(),
    approved: z.boolean(),
    comments: z.string().optional(),
})

export const getAreaObjectiveStrategicProposalsSchema = z.array(
    z.object({
        id: z.number(),
        nameArea: z.string(),
        nameObjective: z.string(),
        status: z.enum(['pending', 'approved', 'rejected']),
        proposedBy: z.string(),
        proposedAt: z.string(),
    })
)



