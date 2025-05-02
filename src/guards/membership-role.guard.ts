import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { SetMetadata } from '@nestjs/common';
import { MembershipRole as PrismaMembershipRole, UserRole } from '@prisma/client';

import { RequestWithAuth } from '@/dtos/auth.dto';
import { getRoleLevel } from '@/libs/membership';
import { PrismaService } from '@/prisma/services/prisma.service';

export const MembershipRole = (role: PrismaMembershipRole) => SetMetadata('role', role);

@Injectable()
export class MembershipGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest<RequestWithAuth>();
    const { auth } = req;

    const user = await this.prisma.user.findUnique({
      where: { id: auth.sub },
      select: {
        role: true,
        membership: true,
        company: {
          select: {
            membership: true,
          },
        },
      },
    });

    // admin always allowed
    if (user.role === UserRole.ADMIN) return true;
    const requiredRole = Reflect.getMetadata('role', ctx.getHandler()) as PrismaMembershipRole;

    // no required role
    if (!requiredRole) return true;

    // user has no membership role
    const userMembershipRole = user.membership;
    const companyMembershipRole = user.company?.membership;

    if (!userMembershipRole && !companyMembershipRole) {
      throw new ForbiddenException({
        type: 'MEMBERSHIP_ROLE',
        message: 'membership required',
      });
    }
    const membershipLevel = Math.max(
      getRoleLevel(userMembershipRole?.role || PrismaMembershipRole.USER_LV0),
      getRoleLevel(companyMembershipRole?.role || PrismaMembershipRole.USER_LV0)
    );
    const requiredLevel = getRoleLevel(requiredRole);

    if (membershipLevel < requiredLevel) {
      throw new ForbiddenException({
        type: 'MEMBERSHIP_ROLE',
        message: `required membership role: ${requiredRole}`,
      });
    }

    return true;
  }
}
