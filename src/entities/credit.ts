import { CreditTransactionType } from '@prisma/clients/client';
import { z } from 'zod';

import { DecimalSchema } from './decimal';
import { UserSchema } from './user';

export const CreditSchema = z.object({
  id: z.string(),

  defaultCredit: DecimalSchema,
  currentCredit: DecimalSchema,

  lastRenewalAt: z.date(),
  nextRenewalAt: z.date().nullable(),
});
export type Credit = z.infer<typeof CreditSchema>;

export const CreditTransactionSchema = z.object({
  id: z.string(),

  credit: CreditSchema,
  user: UserSchema,

  name: z.string(),
  description: z.string().nullable(),

  amount: DecimalSchema,
  type: z.nativeEnum(CreditTransactionType),
});
export type CreditTransaction = z.infer<typeof CreditTransactionSchema>;
