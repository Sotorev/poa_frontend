// src/types/StrategicObjective.ts

import { StrategicArea } from "./StrategicArea";

export interface StrategicObjective {
    strategicObjectiveId: number;
    description: string;
    strategicAreaId: number;
    isDeleted: boolean;
    strategicArea?: StrategicArea;
  }
  