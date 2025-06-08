import { Injectable } from '@nestjs/common';
import { CompanyRole, MembershipRole, UserRole } from '@prisma/client';
import { addMonths, addYears } from 'date-fns';
import { v4 as uuid } from 'uuid';

import { UserAuth } from '@/entities/user';
import { PrismaService } from '@/prisma/services/prisma.service';

import { AuthService } from './auth.service';

@Injectable()
export class AdminAuthService {
  constructor(private readonly prisma: PrismaService, private readonly authService: AuthService) {}

  async updateMembership(userId: string): Promise<UserAuth> {
    const office = await this.prisma.office.findUnique({
      where: { id: 'OFFICE_1' },
    });
    const createdCompanyMembership = await this.prisma.companyMembership.create({
      data: {
        id: uuid(),
        name: '프라이빗 오피스',
        role: MembershipRole.USER_LV2,
        startAt: new Date(),
        endAt: addYears(new Date(), 1),

        officeId: office.id,
      },
      select: {
        id: true,
        name: true,
        role: true,
        startAt: true,
        endAt: true,
        office: true,
      },
    });

    const createdCompany = await this.prisma.company.create({
      data: {
        id: uuid(),
        name: `테스트_로플레이스`,
        membershipId: createdCompanyMembership.id,
      },
      select: {
        id: true,
        name: true,
        membership: {
          select: {
            id: true,
            name: true,
            role: true,
            startAt: true,
            endAt: true,
            office: true,
          },
        },
      },
    });
    const credit = await this.prisma.credit.create({
      data: {
        id: uuid(),
        companyId: createdCompany.id,
        defaultCredit: 50,
        currentCredit: 50,
        lastRenewalAt: new Date(),
        nextRenewalAt: addMonths(new Date(), 1),
      },
    });

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        role: UserRole.ADMIN,

        creditId: credit.id,

        companyId: createdCompany.id,
        companyRole: CompanyRole.COMPANY_ADMIN,
      },
    });

    const { accessToken, refreshToken } = await this.authService.generateTokens(updated.id);
    return {
      id: updated.id,
      accessToken,
      refreshToken,
      termsAndConditionsAccepted: updated.termsAndConditionsAccepted,
    };
  }
}
