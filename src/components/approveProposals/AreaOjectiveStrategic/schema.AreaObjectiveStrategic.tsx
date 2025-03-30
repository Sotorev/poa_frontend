import z from 'zod'

export const proposeAreaObjectiveStrategicSchema = z.object({
    nameArea: z.string().min(1, { message: 'El área estratégica es requerida' }),
    nameObjective: z.string().min(1, { message: 'El objetivo estratégico es requerido' }),
})



