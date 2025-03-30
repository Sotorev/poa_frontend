import { z } from 'zod'
import { proposeAreaObjectiveStrategicSchema } from './schema.AreaObjectiveStrategic'

export type ProposeAreaObjectiveStrategic = z.infer<typeof proposeAreaObjectiveStrategicSchema>



