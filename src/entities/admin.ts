import { CompanyRole, MembershipRole } from '@prisma/client';
import { z } from 'zod';

import { DecimalSchema } from './decimal';

export const AdminCompanyMemberSchema = z.object({
  id: z.string(),
  name: z.string().optional().nullable(),

  credit: z
    .object({
      currentCredit: DecimalSchema,
      defaultCredit: DecimalSchema,
    })
    .optional()
    .nullable(),

  membership: z
    .object({
      id: z.string(),
      name: z.string(),
      role: z.nativeEnum(MembershipRole),

      startAt: z.date(),
      endAt: z.date(),
      capacity: z.number(),
    })
    .optional()
    .nullable(),

  employees: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        email: z.string(),
        companyRole: z.nativeEnum(CompanyRole),
      })
    )
    .optional()
    .nullable(),
});
export type AdminCompanyMember = z.infer<typeof AdminCompanyMemberSchema>;

export const AdminFreelancerSchema = z.object({
  id: z.string(),
  name: z.string().optional().nullable(),
  email: z.string().optional().nullable(),

  membership: z
    .object({
      id: z.string(),
      name: z.string(),
      role: z.nativeEnum(MembershipRole),

      startAt: z.date(),
      endAt: z.date(),
      capacity: z.number(),
    })
    .optional()
    .nullable(),

  credit: z
    .object({
      currentCredit: DecimalSchema,
      defaultCredit: DecimalSchema,
    })
    .optional()
    .nullable(),
});
export type AdminFreelancer = z.infer<typeof AdminFreelancerSchema>;
