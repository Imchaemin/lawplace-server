import { Injectable } from '@nestjs/common';
import { CompanyRole } from '@prisma/client';
import { add, set } from 'date-fns';

import { AdminCompanyMemberSchema, AdminFreelancerSchema } from '@/entities/admin';
import { PrismaService } from '@/prisma/services/prisma.service';

import {
  AdminAddCompanyMemberDto,
  AdminCompanyMemberResponseDto,
  AdminCreateCompanyDto,
  AdminUpdateCompanyDto,
  AdminUpdateCompanyMemberDto,
} from '../dtos/company-member.dto';

@Injectable()
export class AdminCompanyMemberService {
  constructor(private readonly prisma: PrismaService) {}

  async getCompanyMembers(): Promise<AdminCompanyMemberResponseDto> {
    const companyAndMembers = await this.prisma.company.findMany({
      select: {
        id: true,
        name: true,

        credit: {
          select: {
            currentCredit: true,
            defaultCredit: true,
          },
        },

        membership: {
          select: {
            id: true,
            name: true,
            role: true,

            startAt: true,
            endAt: true,
            capacity: true,
          },
        },

        employees: {
          select: {
            id: true,
            name: true,
            email: true,
            companyRole: true,
          },
        },
      },
    });

    const parsedCompanyAndMembers = companyAndMembers.map(company =>
      AdminCompanyMemberSchema.parse(company)
    );

    const freelancers = await this.prisma.user.findMany({
      where: {
        company: null,
      },
      select: {
        id: true,
        name: true,
        email: true,

        membership: {
          select: {
            id: true,
            name: true,
            role: true,

            startAt: true,
            endAt: true,
            capacity: true,
          },
        },

        credit: {
          select: {
            currentCredit: true,
            defaultCredit: true,
          },
        },
      },
    });

    const parsedFreelancers = freelancers.map(freelencer =>
      AdminFreelancerSchema.parse(freelencer)
    );

    return {
      companies: parsedCompanyAndMembers,
      freelancers: parsedFreelancers,
    };
  }

  async createCompany(data: AdminCreateCompanyDto): Promise<void> {
    const {
      membershipType,
      name,
      representativeName,
      representativeEmail,
      capacity,
      startDate,
      endDate,
      defaultCredit,
      currentCredit,
    } = data;

    const start = set(new Date(startDate), { minutes: 0, seconds: 0, milliseconds: 0 });
    const end = endDate
      ? set(new Date(endDate), { minutes: 0, seconds: 0, milliseconds: 0 })
      : add(start, { years: 1 });

    await this.prisma.$transaction(async tx => {
      const company = await tx.company.create({
        data: {
          name,
        },
      });
      const credit = await tx.credit.create({
        data: {
          companyId: company.id,

          currentCredit,
          defaultCredit,

          lastRenewalAt: start,
          nextRenewalAt: add(start, { months: 1 }),
        },
      });

      await tx.companyMembership.create({
        data: {
          company: {
            connect: { id: company.id },
          },

          name: name,
          role: membershipType,
          capacity: Number(capacity),

          startAt: start,
          endAt: end,

          office: {
            connect: { id: 'OFFICE_1' },
          },
        },
      });

      await tx.user.upsert({
        where: {
          email: representativeEmail,
        },
        update: {
          name: representativeName,

          companyId: company.id,
          companyRole: 'COMPANY_ADMIN',
          creditId: credit.id,
        },
        create: {
          email: representativeEmail,
          name: representativeName,

          companyId: company.id,
          companyRole: 'COMPANY_ADMIN',
          creditId: credit.id,
        },
      });
    });
  }

  async updateCompany(data: AdminUpdateCompanyDto): Promise<void> {
    const {
      companyId,
      membershipType,
      name,
      capacity,
      startDate,
      endDate,
      defaultCredit,
      currentCredit,
    } = data;

    const start = set(new Date(startDate), { minutes: 0, seconds: 0, milliseconds: 0 });
    const end = endDate
      ? set(new Date(endDate), { minutes: 0, seconds: 0, milliseconds: 0 })
      : add(start, { years: 1 });

    await this.prisma.$transaction(async tx => {
      const company = await tx.company.findUnique({
        where: { id: companyId },
        select: {
          id: true,
          membershipId: true,
          credit: {
            select: {
              id: true,
            },
          },
        },
      });

      if (company) {
        await tx.company.update({
          where: { id: companyId },
          data: { name },
        });
      }

      if (company?.credit.id) {
        await tx.credit.update({
          where: { id: company.credit.id },
          data: {
            currentCredit,
            defaultCredit,
          },
        });
      }

      const membershipName =
        membershipType === 'USER_LV0'
          ? '멤버십 없음'
          : membershipType === 'USER_LV1'
          ? '라운지 멤버십'
          : membershipType === 'USER_LV2'
          ? '프라이빗 오피스'
          : membershipType;

      if (company?.membershipId) {
        await tx.companyMembership.update({
          where: { id: company.membershipId },
          data: {
            name: membershipName,
            role: membershipType,
            capacity: Number(capacity),

            startAt: start,
            endAt: end,
          },
        });
      }
    });
  }

  async addCompanyMember(companyId: string, data: AdminAddCompanyMemberDto): Promise<void> {
    const { name, email, role } = data;

    await this.prisma.$transaction(async tx => {
      const company = await tx.company.findUnique({
        where: { id: companyId },
        select: {
          id: true,
          membershipId: true,
          credit: {
            select: {
              id: true,
            },
          },
        },
      });

      if (company) {
        await tx.user.upsert({
          where: { email },
          update: {
            name,
            companyId,
            companyRole: role as CompanyRole,
            creditId: company.credit.id,
          },
          create: {
            email,
            name,
            companyId,
            companyRole: role as CompanyRole,
            creditId: company.credit.id,
          },
        });
      }
    });
  }

  async updateCompanyMember(memberId: string, data: AdminUpdateCompanyMemberDto): Promise<void> {
    const { name, email, role } = data;

    await this.prisma.$transaction(async tx => {
      const user = await tx.user.findUnique({
        where: { id: memberId },
      });

      if (user) {
        await tx.user.upsert({
          where: { id: memberId },
          update: {
            name,
            email,
            companyRole: role as CompanyRole,
          },
          create: {
            email,
            name,
            companyRole: role as CompanyRole,
          },
        });
      }
    });
  }

  async deleteCompany(companyId: string): Promise<void> {
    await this.prisma.$transaction(async tx => {
      const companyMembers = await tx.user.findMany({
        where: { companyId },
      });

      await tx.user.updateMany({
        where: { id: { in: companyMembers.map(member => member.id) } },
        data: {
          companyId: null,
          companyRole: null,
          creditId: null,
          membershipId: null,
        },
      });
      await tx.company.delete({ where: { id: companyId } });
    });
  }

  async deleteCompanyMember(memberId: string): Promise<void> {
    await this.prisma.$transaction(async tx => {
      const currentUser = await tx.user.findUnique({
        where: { id: memberId },
        select: {
          companyId: true,
        },
      });

      if (currentUser?.companyId) {
        await tx.user.update({
          where: { id: memberId },
          data: {
            companyId: null,
            companyRole: null,
            creditId: null,
            membershipId: null,
          },
        });
      } else {
        await tx.user.delete({ where: { id: memberId } });
      }
    });
  }
}
