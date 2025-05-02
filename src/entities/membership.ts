import { MembershipRole } from '@prisma/client';
import { z } from 'zod';

export const OfficeSchema = z.object({
  id: z.string(),

  name: z.string(),
  description: z.string().nullable(),
  address: z.string(),
});
export type Office = z.infer<typeof OfficeSchema>;

export const UserMembershipSchema = z
  .object({
    id: z.string(),
    name: z.string().nullable(),
    role: z.nativeEnum(MembershipRole),
    startAt: z.date(),
    endAt: z.date(),
    office: OfficeSchema,
  })
  .transform(data => ({
    id: data.id,
    name: data.name,
    role: data.role,
    startAt: data.startAt,
    endAt: data.endAt,
    office: data.office,
  }));

export type UserMembership = z.infer<typeof UserMembershipSchema>;

export const CompanyMembershipSchema = z
  .object({
    id: z.string(),
    name: z.string().nullable(),
    role: z.nativeEnum(MembershipRole),
    startAt: z.date(),
    endAt: z.date(),
    office: OfficeSchema,
  })
  .transform(data => ({
    id: data.id,
    name: data.name,
    role: data.role,
    startAt: data.startAt,
    endAt: data.endAt,
    office: data.office,
  }));

export type CompanyMembership = z.infer<typeof CompanyMembershipSchema>;
