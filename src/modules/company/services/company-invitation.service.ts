import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CompanyInvitationStatus as PrismaCompanyInvitationStatus,
  CompanyRole,
  CompanyRole as PrismaCompanyRole,
} from '@prisma/client';
import { format } from 'date-fns';

import { FE_URL } from '@/constants';
import { CompanyInvitation, CompanyInvitationSchema } from '@/entities/company';
import { sendInviteCompanyMail } from '@/libs/mail';
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
        where: { name: 'COMPANY_INVITATION' },
      });
      await this.prisma.notification.create({
        data: {
          title: '회사 초대 알림',
          content: '회사 초대 알림',

          link: '',
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

    await sendInviteCompanyMail(
      inviteeEmail,
      `${user.company.name}에서 로플레이스 멤버십에 초대했어요.`,
      user.company.name,
      inviteeEmail,
      user.company.membership.role,
      format(user.company.membership.startAt, 'yyyy-MM-dd'),
      format(user.company.membership.endAt, 'yyyy-MM-dd'),
      `${FE_URL}/accept-invitation?companyId=${user.company.id}&email=${inviteeEmail}&name=${inviteeName}&companyRole=${user.company.membership.role}&acceptance=true`
    );
  }

  async getInvitation(companyInvitationId: string): Promise<CompanyInvitation> {
    const companyInvitation = await this.prisma.companyInvitation.findUnique({
      where: { id: companyInvitationId },
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

  async acceptInvitation(
    userId: string,
    companyId: string,
    companyInvitationId: string,
    acceptance: boolean
  ): Promise<void> {
    const companyInvitation = await this.prisma.companyInvitation.findUnique({
      where: { id: companyInvitationId },
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
    const companyAdmins = await this.prisma.user.findMany({
      where: {
        companyId,
        companyRole: PrismaCompanyRole.COMPANY_ADMIN,
      },
      select: {
        id: true,
      },
    });

    if (acceptance) {
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

      await Promise.all(
        companyAdmins.map(admin =>
          this.prisma.notification.create({
            data: {
              title: '멤버 추가',
              content: `${companyInvitation.userName}님이 멤버로 추가되었습니다.`,
              notificationCategoryId: 'ADD_MEMBER',
              target: admin.id,
            },
          })
        )
      );
    } else {
      await Promise.all(
        companyAdmins.map(admin =>
          this.prisma.notification.create({
            data: {
              title: '멤버 초대 거절',
              content: `${companyInvitation.userName}님이 멤버초대를 거절했습니다.`,
              notificationCategoryId: 'ADD_MEMBER',
              target: admin.id,
            },
          })
        )
      );
    }
  }

  async acceptInvitationNoCredential(
    companyId: string,

    email: string,
    name: string,

    acceptance: boolean
  ): Promise<void> {
    const companyInvitation = await this.prisma.companyInvitation.findUnique({
      where: { companyId_userEmail: { companyId, userEmail: email } },
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

    await this.prisma.user.upsert({
      where: { email },
      update: {
        name,
        companyId,
        companyRole: CompanyRole.COMPANY_LV1,
        creditId: company.credit.id,
      },
      create: {
        email,
        name,
        companyId,
        companyRole: CompanyRole.COMPANY_LV1,
        creditId: company.credit.id,
      },
    });

    const companyAdmins = await this.prisma.user.findMany({
      where: {
        companyId,
        companyRole: PrismaCompanyRole.COMPANY_ADMIN,
      },
      select: {
        id: true,
      },
    });
    await Promise.all(
      companyAdmins.map(admin =>
        this.prisma.notification.create({
          data: {
            title: '멤버 추가',
            content: `${name}님이 멤버로 추가되었습니다.`,
            notificationCategoryId: 'ADD_MEMBER',
            target: admin.id,
          },
        })
      )
    );
  }
}
