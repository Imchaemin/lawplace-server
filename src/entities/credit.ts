import { z } from 'zod';

import { DecimalSchema } from './decimal';

export const CreditSchema = z.object({
  id: z.string(),

  defaultCredit: DecimalSchema,
  currentCredit: DecimalSchema,

  lastRenewalAt: z.date(),
  nextRenewalAt: z.date().nullable(),
});
export type Credit = z.infer<typeof CreditSchema>;
