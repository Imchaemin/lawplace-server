import { TermsAndConditionsType } from '@prisma/client';
import { z } from 'zod';

export const TermsAndConditionsSchema = z.object({
  id: z.string(),

  type: z.nativeEnum(TermsAndConditionsType),
  required: z.boolean(),
});
export type TermsAndConditions = z.infer<typeof TermsAndConditionsSchema>;
