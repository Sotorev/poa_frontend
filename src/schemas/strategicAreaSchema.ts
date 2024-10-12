// schemas/strategicAreaSchema.ts
import { z } from 'zod';

export const strategicAreaSchema = z.object({
  areaEstrategica: z.string().nonempty({ message: 'El área estratégica es requerida' }),
});
