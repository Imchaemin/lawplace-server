import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { SetMetadata } from '@nestjs/common';
import { CompanyRole as PrismaCompanyRole, UserRole } from '@prisma/clients/client';

import { RequestWithAuth } from '@/dtos/auth.dto';

export const CompanyRole = (role: PrismaCompanyRole) => SetMetadata('role', role);

@Injectable()
export class CompanyRoleGuard implements CanActivate {
  constructor() {}

  private getRoleLevel(role: PrismaCompanyRole): number {
    const roleLevels = {
      [PrismaCompanyRole.COMPANY_LV0]: 0,
      [PrismaCompanyRole.COMPANY_LV1]: 1,
      [PrismaCompanyRole.COMPANY_ADMIN]: 999,
    };
    return roleLevels[role];
  }

  canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest<RequestWithAuth>();
    const { auth } = req;

    // admin always allowed
    if (auth.role === UserRole.ADMIN) return true;
    const requiredRole = Reflect.getMetadata('role', ctx.getHandler()) as PrismaCompanyRole;

    // no required role
    if (!requiredRole) return true;

    // user has no company role
    if (!auth.companyMembership) {
      throw new ForbiddenException({
        type: 'COMPANY_ROLE',
        message: 'company membership required',
      });
    }

    // user level is not enough
    const userLevel = this.getRoleLevel(auth.companyRole || PrismaCompanyRole.COMPANY_LV0);
    const requiredLevel = this.getRoleLevel(requiredRole);

    if (userLevel < requiredLevel) {
      throw new ForbiddenException({
        type: 'COMPANY_ROLE',
        message: `required company role: ${requiredRole}`,
      });
    }

    return true;
  }
}
