import z from 'zod'

export const AreaObjectiveStrategicSchema = z.object({
    name: z.string().min(1, { message: 'El área estratégica es requerida' }),
    peiId: z.number().min(1, { message: 'El ID de la PEI es requerido' }),
    strategicObjective: z.string().min(1, { message: 'El objetivo estratégico es requerido' }),
    userId: z.number().min(1, { message: 'El ID del usuario es requerido' }),
    status: z.enum(["Pendiente", "Aprobado", "Rechazado"]),
    reasonForChange: z.string().min(1, { message: 'La razón para cambiar es requerida' }),
});

export const AreaObjectiveStrategicUpdateSchema = AreaObjectiveStrategicSchema.partial();

export const approveAreaObjectiveStrategicSchema = z.object({
    status: z.enum(["Pendiente", "Aprobado", "Rechazado"]),
});



