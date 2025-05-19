import z from 'zod'

export const ResourcesSchema = z.object({
    name: z.string(),
    reasonForChange: z.string(),
    userId: z.number(),
    status: z.string(),
    createdAt: z.string(),
    updatedAt: z.string()
});

export const ResourcesProposalSchema = ResourcesSchema.omit({
    userId: true,
    status: true,
    createdAt: true,
    updatedAt: true,
});

export const ResourcesUpdateSchema = ResourcesSchema.partial();

export const approveResourcesSchema = z.object({
    status: z.enum(["Pendiente", "Aprobado", "Rechazado"]),
});



