import z from 'zod'

export const PurchaseTypeSchema = z.object({
    name: z.string().min(1, { message: 'El nombre es requerido' }),
    reasonForChange: z.string().min(1, { message: 'La razón para cambiar es requerida' }),
    userId: z.number().min(1, { message: 'El ID del usuario es requerido' }),
    status: z.enum(["Pendiente", "Aprobado", "Rechazado"]),
    createdAt: z.string(),
    updatedAt: z.string()
});

export const PurchaseTypeProposalSchema = PurchaseTypeSchema.omit({
    userId: true,
    status: true,
    createdAt: true,
    updatedAt: true,
});

export const PurchaseTypeUpdateSchema = PurchaseTypeSchema.partial();

export const approvePurchaseTypeSchema = z.object({
    status: z.enum(["Pendiente", "Aprobado", "Rechazado"]),
});



