import { CompanyInvitationStatus, CompanyRole, MembershipRole } from '@prisma/client';
import { z } from 'zod';

import { CreditSchema } from './credit';
import { CompanyMembershipSchema } from './membership';

export const CompanySchema = z.object({
  id: z.string(),

  name: z.string(),
  employeeCount: z.number(),
  credit: CreditSchema.nullable(),
  membership: CompanyMembershipSchema.nullable(),
});
export type Company = z.infer<typeof CompanySchema>;

export const CompanyInvitationSchema = z.object({
  id: z.string(),
  company: CompanySchema,

  userName: z.string(),
  userEmail: z.string(),
  userPhone: z.string().nullable().optional(),

  membershipRole: z.nativeEnum(MembershipRole),
  companyRole: z.nativeEnum(CompanyRole),

  status: z.nativeEnum(CompanyInvitationStatus),
  message: z.string().nullable(),
});
export type CompanyInvitation = z.infer<typeof CompanyInvitationSchema>;

export const CompanyEmployeeSchema = z.object({
  id: z.string(),

  name: z.string(),
  email: z.string(),

  status: z.nativeEnum(CompanyInvitationStatus),
  companyRole: z.nativeEnum(CompanyRole),
});
export type CompanyEmployee = z.infer<typeof CompanyEmployeeSchema>;
