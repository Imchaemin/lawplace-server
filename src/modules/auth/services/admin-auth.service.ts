import { BadRequestException, Injectable } from '@nestjs/common';
import { CompanyRole, MembershipRole } from '@prisma/client';
import { addMonths, addYears, set } from 'date-fns';
import { v4 as uuid } from 'uuid';

import { UserAuth } from '@/entities/user';
import { PrismaService } from '@/prisma/services/prisma.service';

import { SigninReqBodyDto } from '../dtos/admin-auth.dto';
import { AuthService } from './auth.service';

@Injectable()
export class AdminAuthService {
  constructor(private readonly prisma: PrismaService, private readonly authService: AuthService) {}

  async signupAdmin({
    role,
    companyId,
    companyRole,
    membership,
  }: SigninReqBodyDto): Promise<UserAuth> {
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const randomEmail = `admin-${randomSuffix}@example.com`;

    const now = set(new Date(), { minutes: 0, seconds: 0, milliseconds: 0 });
    const endAt = addYears(now, 1);

    const membershipName =
      membership === MembershipRole.USER_LV0
        ? '멤버십 없음'
        : membership === MembershipRole.USER_LV1
        ? '라운지 멤버십'
        : '프라이빗 오피스';

    const office = await this.prisma.office.findFirst();
    const createdOffice = office
      ? office
      : await this.prisma.office.create({
          data: {
            id: uuid(),
            name: '지점 1',
            address: '서울특별시 강남구 테헤란로 1길 100 도아빌딩 999층',
          },
        });

    const createdCompanyMembership =
      companyRole === CompanyRole.COMPANY_ADMIN
        ? await this.prisma.companyMembership.create({
            data: {
              id: uuid(),
              name: membershipName,
              role: membership,
              startAt: now,
              endAt,

              officeId: createdOffice.id,
            },
            select: {
              id: true,
              name: true,
              role: true,
              startAt: true,
              endAt: true,
              office: true,
            },
          })
        : undefined;
    const createdUserMembership =
      companyRole === CompanyRole.COMPANY_ADMIN || companyId
        ? undefined
        : await this.prisma.userMembership.create({
            data: {
              id: uuid(),
              name: membershipName,
              role: membership,
              startAt: now,
              endAt,

              officeId: createdOffice.id,
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

    const createdCompany =
      companyRole === CompanyRole.COMPANY_ADMIN
        ? await this.prisma.company.create({
            data: {
              id: uuid(),
              name: `테스트 회사 - ${randomSuffix}`,
              membershipId: createdCompanyMembership?.id,
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
          })
        : undefined;

    const foundCompany = companyId
      ? await this.prisma.company.findUnique({
          where: { id: companyId },
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
        })
      : undefined;
    const company = foundCompany || createdCompany;

    const credit = await this.prisma.credit.create({
      data: {
        id: uuid(),
        companyId: company?.id,
        defaultCredit: 100,
        currentCredit: 100,
        lastRenewalAt: now,
        nextRenewalAt: addMonths(now, 1),
      },
    });
    const createdUser = await this.prisma.user.create({
      data: {
        id: uuid(),

        email: randomEmail,
        name: `admin-${randomSuffix}`,
        phone: '01012345678',

        role,

        termsAndConditionsAccepted: false,
        provider: 'email',

        creditId: credit.id,

        membershipId: createdUserMembership?.id,
        companyId: createdCompany?.id,
        companyRole: companyRole || CompanyRole.COMPANY_LV1,
      },
    });

    const { accessToken, refreshToken } = await this.authService.generateTokens(createdUser.id);
    return {
      id: createdUser.id,
      accessToken,
      refreshToken,
      termsAndConditionsAccepted: createdUser.termsAndConditionsAccepted,
    };
  }

  async signinWithPreset(email: string): Promise<UserAuth> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        termsAndConditionsAccepted: true,
      },
    });
    if (!user) {
      throw new BadRequestException({
        type: 'BAD_REQUEST',
        message: 'user not found',
      });
    }

    const { accessToken, refreshToken } = await this.authService.generateTokens(user.id);

    return {
      id: user.id,
      accessToken,
      refreshToken,
      termsAndConditionsAccepted: user.termsAndConditionsAccepted,
    };
  }
}
