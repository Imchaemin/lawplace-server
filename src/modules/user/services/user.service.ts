import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CompanyInvitationStatus, MembershipRole } from '@prisma/client';

import { UserSchema } from '@/entities/user';
import { getRoleLevel, parseRole } from '@/libs/membership';
import { PrismaService } from '@/prisma/services/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        role: true,
        email: true,
        name: true,
        phone: true,
        provider: true,
        termsAndConditionsAccepted: true,
        membership: {
          select: {
            id: true,
            name: true,
            role: true,
            startAt: true,
            endAt: true,
            office: {
              select: {
                id: true,
                name: true,
                description: true,
                address: true,
              },
            },
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            credit: true,
            membership: {
              select: {
                id: true,
                name: true,
                role: true,
                startAt: true,
                endAt: true,
                office: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    address: true,
                  },
                },
              },
            },
            _count: {
              select: {
                employees: true,
              },
            },
          },
        },
        companyRole: true,
        credit: {
          select: {
            id: true,
            defaultCredit: true,
            currentCredit: true,
            lastRenewalAt: true,
            nextRenewalAt: true,
          },
        },
      },
    });
    if (!user) throw new UnauthorizedException('User not found');

    const pendingCompanyInvitations = await this.prisma.companyInvitation.findMany({
      where: {
        companyId: user.company?.id,
        status: CompanyInvitationStatus.PENDING,
      },
    });

    const userMembershipRole = user?.membership?.role || MembershipRole.USER_LV0;
    const companyMembershipRole = user?.company?.membership?.role || MembershipRole.USER_LV0;
    const companyEmployeeCount = user?.company?._count.employees || 0;
    const companyPendingInvitationCount = pendingCompanyInvitations?.length || 0;

    const membershipLevel = Math.max(
      getRoleLevel(userMembershipRole),
      getRoleLevel(companyMembershipRole)
    );
    const currentMembership = parseRole(membershipLevel);
    const company = user?.company
      ? {
          ...user.company,
          employeeCount: companyEmployeeCount + companyPendingInvitationCount,
        }
      : null;

    const data = UserSchema.parse({
      ...user,
      currentMembership,
      company,
    });
    return data;
  }
}
