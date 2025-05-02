import { createZodDto } from '@anatine/zod-nestjs';
import { CompanyRole, MembershipRole, UserRole } from '@prisma/client';
import { z } from 'zod';

// POST signin
export const SigninReqBodySchema = z.object({
  role: z.nativeEnum(UserRole),

  membership: z.nativeEnum(MembershipRole),

  companyRole: z.nativeEnum(CompanyRole).optional(),
  companyId: z.string().optional(),
});
export class SigninReqBodyDto extends createZodDto(SigninReqBodySchema) {}
