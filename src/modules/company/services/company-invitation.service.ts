import { Injectable } from '@nestjs/common';
import {
  CompanyInvitationStatus as PrismaCompanyInvitationStatus,
  CompanyRole as PrismaCompanyRole,
} from '@prisma/clients/client';

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

    await this.prisma.companyInvitation.create({
      data: {
        userName: inviteeName,
        userEmail: inviteeEmail,

        companyId: user.company.id,
        membershipRole: user.company.membership.role,
        companyRole: PrismaCompanyRole.COMPANY_LV1,

        status: PrismaCompanyInvitationStatus.PENDING,
      },
    });
  }
}
