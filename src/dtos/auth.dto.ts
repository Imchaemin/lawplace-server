import { CompanyRole, UserRole } from '@prisma/clients/client';
import { JwtPayload as DefaultJwtPayload } from 'jsonwebtoken';

import { CompanyMembership, UserMembership } from '@/entities/membership';

export type RequestWithAuth = Request & {
  auth?: JwtPayload;
};

export interface JwtPayload extends DefaultJwtPayload {
  sub: string;

  role: UserRole;
  termsAndConditionsAccepted: boolean;

  userMembership?: UserMembership;

  companyId?: string;
  companyMembership?: CompanyMembership;
  companyRole?: CompanyRole;
}
