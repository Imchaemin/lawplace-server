import { z } from 'zod';

import { AdminCompanyMemberSchema, AdminFreelancerSchema } from '@/entities/admin';

export const AdminCompanyMemberResponseDto = z.object({
  companies: z.array(AdminCompanyMemberSchema),
  freelancers: z.array(AdminFreelancerSchema),
});
export type AdminCompanyMemberResponseDto = z.infer<typeof AdminCompanyMemberResponseDto>;
