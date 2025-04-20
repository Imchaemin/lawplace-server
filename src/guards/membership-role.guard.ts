import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { SetMetadata } from '@nestjs/common';
import { MembershipRole as PrismaMembershipRole, UserRole } from '@prisma/clients/client';

import { RequestWithAuth } from '@/dtos/auth.dto';

export const MembershipRole = (role: PrismaMembershipRole) => SetMetadata('role', role);

@Injectable()
export class MembershipGuard implements CanActivate {
  constructor() {}

  private getRoleLevel(role: PrismaMembershipRole): number {
    const roleLevels = {
      [PrismaMembershipRole.USER_LV0]: 0,
      [PrismaMembershipRole.USER_LV1]: 1,
      [PrismaMembershipRole.USER_LV2]: 2,
    };
    return roleLevels[role];
  }

  canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest<RequestWithAuth>();
    const { auth } = req;

    // admin always allowed
    if (auth.role === UserRole.ADMIN) return true;
    const requiredRole = Reflect.getMetadata('role', ctx.getHandler()) as PrismaMembershipRole;

    // no required role
    if (!requiredRole) return true;

    // user has no membership role
    const userMembershipRole = auth.userMembership?.role;
    const companyMembershipRole = auth.companyMembership?.role;

    if (!userMembershipRole && !companyMembershipRole) {
      throw new ForbiddenException({
        type: 'MEMBERSHIP_ROLE',
        message: 'membership required',
      });
    }
    const membershipLevel = Math.max(
      this.getRoleLevel(userMembershipRole || PrismaMembershipRole.USER_LV0),
      this.getRoleLevel(companyMembershipRole || PrismaMembershipRole.USER_LV0)
    );
    const requiredLevel = this.getRoleLevel(requiredRole);

    if (membershipLevel < requiredLevel) {
      throw new ForbiddenException({
        type: 'MEMBERSHIP_ROLE',
        message: `required membership role: ${requiredRole}`,
      });
    }

    return true;
  }
}
