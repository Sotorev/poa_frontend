import z from 'zod'

export const InterventionSchema = z.object({
    name: z.string(),
    userId: z.number(),
    strategyId: z.number(),
    status: z.enum(["Pendiente", "Aprobado", "Rechazado"]),
    reasonForChange: z.string().optional()
});

export const InterventionProposalSchema = InterventionSchema.omit({
    userId: true,
    status: true,
});

export const InterventionUpdateSchema = InterventionSchema.partial().extend({
    interventionId: z.number()
});

export const approveInterventionSchema = z.object({
    status: z.enum(["Pendiente", "Aprobado", "Rechazado"]),
});



