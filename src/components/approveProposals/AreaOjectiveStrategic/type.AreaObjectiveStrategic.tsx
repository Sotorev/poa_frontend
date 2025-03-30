import { z } from 'zod'
import { proposeAreaObjectiveStrategicSchema, approveAreaObjectiveStrategicSchema } from './schema.AreaObjectiveStrategic'

export type ProposeAreaObjectiveStrategic = z.infer<typeof proposeAreaObjectiveStrategicSchema>

export interface AreaObjectiveStrategicProposal {
    id: number;
    nameArea: string;
    nameObjective: string;
    status: 'pending' | 'approved' | 'rejected';
    proposedBy: string;
    proposedAt: string;
}

export type ApproveAreaObjectiveStrategic = z.infer<typeof approveAreaObjectiveStrategicSchema>



