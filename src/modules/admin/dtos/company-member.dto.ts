import { z } from 'zod';

import { AdminCompanyMemberSchema, AdminFreelancerSchema } from '@/entities/admin';

export const AdminCompanyMemberResponseDto = z.object({
  companies: z.array(AdminCompanyMemberSchema),
  freelancers: z.array(AdminFreelancerSchema),
});
export type AdminCompanyMemberResponseDto = z.infer<typeof AdminCompanyMemberResponseDto>;

export const AdminCreateCompanyDto = z.object({
  type: z.enum(['company', 'freelancer']),
  membershipType: z.enum(['USER_LV0', 'USER_LV1', 'USER_LV2']),
  name: z.string(),
  representativeName: z.string(),
  representativeEmail: z.string(),
  capacity: z.string().transform(val => Number(val)),
  startDate: z.string(),
  endDate: z.string().optional().nullable(),
  defaultCredit: z.string().transform(val => Number(val)),
  currentCredit: z.string().transform(val => Number(val)),
});
export type AdminCreateCompanyDto = z.infer<typeof AdminCreateCompanyDto>;

export const AdminUpdateCompanyDto = z.object({
  companyId: z.string(),
  membershipType: z.enum(['USER_LV0', 'USER_LV1', 'USER_LV2']),
  name: z.string(),
  capacity: z.string().transform(val => Number(val)),
  startDate: z.string(),
  endDate: z.string().optional().nullable(),
  defaultCredit: z.string().transform(val => Number(val)),
  currentCredit: z.string().transform(val => Number(val)),
});
export type AdminUpdateCompanyDto = z.infer<typeof AdminUpdateCompanyDto>;

export const AdminAddCompanyMemberDto = z.object({
  name: z.string(),
  email: z.string(),
  role: z.enum(['COMPANY_ADMIN', 'COMPANY_MEMBER']),
});
export type AdminAddCompanyMemberDto = z.infer<typeof AdminAddCompanyMemberDto>;

export const AdminUpdateCompanyMemberDto = z.object({
  name: z.string(),
  email: z.string(),
  role: z.enum(['COMPANY_ADMIN', 'COMPANY_MEMBER']),
});
export type AdminUpdateCompanyMemberDto = z.infer<typeof AdminUpdateCompanyMemberDto>;
