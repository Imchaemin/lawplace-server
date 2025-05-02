import { Injectable } from '@nestjs/common';
import {
  CompanyInvitationStatus as PrismaCompanyInvitationStatus,
  CompanyRole as PrismaCompanyRole,
} from '@prisma/client';

import { PrismaService } from '@/prisma/services/prisma.service';

@Injectable()
export class CompanyInvitationService {
  constructor(private readonly prisma: PrismaService) {}

  async invite(userId: string, inviteeName: string, inviteeEmail: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        company: {
          select: {
            id: true,
            name: true,
            membership: {
              select: {
                role: true,
              },
            },
          },
        },
      },
    });

    const companyInvite = await this.prisma.companyInvitation.create({
      data: {
        userName: inviteeName,
        userEmail: inviteeEmail,

        companyId: user.company.id,
        membershipRole: user.company.membership.role,
        companyRole: PrismaCompanyRole.COMPANY_LV1,

        status: PrismaCompanyInvitationStatus.PENDING,
      },
    });

    const invitee = await this.prisma.user.findUnique({
      where: {
        email: inviteeEmail,
      },
    });

    if (invitee) {
      const notificationCategory = await this.prisma.notificationCategory.findUnique({
        where: { name: 'company-invitation' },
      });
      await this.prisma.notification.create({
        data: {
          title: '회사 초대 알림',
          content: '회사 초대 알림',

          link: `/company/${user.company.id}/invitation/${companyInvite.id}`,
          metadata: { companyInvitationId: companyInvite.id },
          notificationCategoryId: notificationCategory?.id,

          target: invitee.id,
        },
      });
    }
  }
}
