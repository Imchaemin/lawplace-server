import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CompanyInvitationStatus as PrismaCompanyInvitationStatus,
  CompanyRole as PrismaCompanyRole,
} from '@prisma/client';

import { CompanyInvitation, CompanyInvitationSchema } from '@/entities/company';
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
                startAt: true,
                endAt: true,
              },
            },
          },
        },
      },
    });

    const companyInvite = await this.prisma.companyInvitation.upsert({
      where: {
        companyId_userEmail: {
          companyId: user.company.id,
          userEmail: inviteeEmail,
        },
      },
      update: {},
      create: {
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
        where: { name: 'MEMBERSHIP_INVITATION' },
      });
      await this.prisma.notification.create({
        data: {
          title: '회사 초대 알림',
          content: '회사 초대 알림',

          link: `/company/${user.company.id}/invitation/${companyInvite.id}`,
          metadata: {
            companyId: user.company.id,
            companyName: user.company.name,
            companyInvitationId: companyInvite.id,

            membershipRole: user.company.membership.role,
            membershipStartAt: user.company.membership.startAt,
            membershipEndAt: user.company.membership.endAt,
          },
          notificationCategoryId: notificationCategory?.id,

          target: invitee.id,
        },
      });
    }

    // TODO: 초대 메일 발송
  }

  async getInvitation(companyId: string, userId: string): Promise<CompanyInvitation> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    const companyInvitation = await this.prisma.companyInvitation.findUnique({
      where: { companyId_userEmail: { companyId, userEmail: user.email } },
      select: {
        id: true,

        userName: true,
        userEmail: true,
        userPhone: true,

        company: {
          select: {
            id: true,
            name: true,
            _count: {
              select: {
                employees: true,
              },
            },
            credit: {
              select: {
                id: true,
                defaultCredit: true,
                currentCredit: true,
                lastRenewalAt: true,
                nextRenewalAt: true,
              },
            },
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
          },
        },

        membershipRole: true,
        companyRole: true,

        status: true,
        message: true,
      },
    });

    return CompanyInvitationSchema.parse({
      ...companyInvitation,
      company: {
        ...companyInvitation.company,
        employeeCount: companyInvitation.company._count.employees,
      },
    });
  }

  async acceptInvitation(userId: string, companyId: string, acceptance: boolean): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
      },
    });
    const companyInvitation = await this.prisma.companyInvitation.findUnique({
      where: { companyId_userEmail: { companyId, userEmail: user.email } },
    });
    if (!companyInvitation) {
      throw new NotFoundException('Company invitation not found');
    }

    await this.prisma.companyInvitation.update({
      where: { id: companyInvitation.id },
      data: {
        status: acceptance
          ? PrismaCompanyInvitationStatus.ACCEPTED
          : PrismaCompanyInvitationStatus.REJECTED,
      },
    });

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: {
        credit: {
          select: {
            id: true,
          },
        },
      },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        companyId,
        companyRole: companyInvitation.companyRole,
        creditId: company.credit.id,
      },
    });
  }
}
