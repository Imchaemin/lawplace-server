import { BadRequestException, Injectable } from '@nestjs/common';
import { CompanyInvitationStatus } from '@prisma/client';
import { keyBy } from 'lodash';

import { CompanyEmployee, CompanyEmployeeSchema } from '@/entities/company';
import { PrismaService } from '@/prisma/services/prisma.service';

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}

  async getEmployees(companyId: string): Promise<CompanyEmployee[]> {
    if (!companyId)
      throw new BadRequestException({
        type: 'BAD_REQUEST',
        message: 'company id is required',
      });

    const employees = await this.prisma.user.findMany({
      where: {
        companyId,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const companyInvitations = await this.prisma.companyInvitation.findMany({
      where: {
        companyId,
      },
      select: {
        id: true,

        userName: true,
        userEmail: true,
        status: true,
      },
    });

    const companyInvitationsMap = keyBy(companyInvitations, 'userEmail');

    const res = employees.map(employee =>
      CompanyEmployeeSchema.parse({
        id: employee.id,
        name: employee.name,
        email: employee.email,
        status: companyInvitationsMap?.[employee.email]?.status || CompanyInvitationStatus.ACCEPTED,
      })
    );

    return res;
  }

  async deleteEmployee(companyId: string, employeeId: string): Promise<void> {
    if (!companyId || !employeeId)
      throw new BadRequestException({
        type: 'BAD_REQUEST',
        message: 'company id and employee id are required',
      });

    await this.prisma.user.update({
      where: {
        id: employeeId,
        companyId,
      },
      data: {
        companyId: null,
        companyRole: null,
      },
    });
  }
}
