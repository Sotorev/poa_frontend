import { z } from 'zod'
import { proposeAreaObjectiveStrategicSchema } from './schema.event'

export type ProposeAreaObjectiveStrategic = z.infer<typeof proposeAreaObjectiveStrategicSchema>



