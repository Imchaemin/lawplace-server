import { Injectable } from '@nestjs/common';

import { AdminCompanyMemberSchema, AdminFreelancerSchema } from '@/entities/admin';
import { PrismaService } from '@/prisma/services/prisma.service';

import { AdminCompanyMemberResponseDto } from '../dtos/company-member.dto';

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
}
