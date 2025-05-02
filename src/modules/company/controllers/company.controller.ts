import { ZodValidationPipe } from '@anatine/zod-nestjs';
import {
  Controller,
  Delete,
  Get,
  Param,
  Req,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CompanyRole as PrismaCompanyRole } from '@prisma/client';

import { RequestWithAuth } from '@/dtos/auth.dto';
import { AuthGuard } from '@/guards/auth.guard';
import { CompanyRole } from '@/guards/company-role.guard';
import { PrivateCorsInterceptor } from '@/interceptors/cors.interceptor';

import { CompanyService } from '../services/company.service';

@ApiTags('COMPANY')
@UseInterceptors(PrivateCorsInterceptor)
@Controller('company')
@UsePipes(ZodValidationPipe)
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get(':companyId/employees')
  @UseGuards(AuthGuard)
  @CompanyRole(PrismaCompanyRole.COMPANY_LV1)
  async getEmployees(@Param() params: { companyId: string }) {
    return this.companyService.getEmployees(params.companyId);
  }

  @Delete(':companyId/employees/:employeeId')
  @UseGuards(AuthGuard)
  @CompanyRole(PrismaCompanyRole.COMPANY_ADMIN)
  async deleteEmployee(@Req() req: RequestWithAuth, @Param() params: { employeeId: string }) {
    return this.companyService.deleteEmployee(req.auth.companyId, params.employeeId);
  }
}
