import { ZodValidationPipe } from '@anatine/zod-nestjs';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthGuard } from '@/guards/auth.guard';
import { AdminGuard } from '@/guards/user-role.guard';
import { PrivateCorsInterceptor } from '@/interceptors/cors.interceptor';

import {
  AdminAddCompanyMemberDto,
  AdminCompanyMemberResponseDto,
  AdminCreateCompanyDto,
  AdminUpdateCompanyDto,
  AdminUpdateCompanyMemberDto,
} from '../dtos/company-member.dto';
import { AdminCompanyMemberService } from '../services/admin-company-member.service';

@ApiTags('ADMIN')
@UseInterceptors(PrivateCorsInterceptor)
@Controller('admin/company-member')
@UsePipes(ZodValidationPipe)
export class AdminCompanyMemberController {
  constructor(private readonly adminCompanyMemberService: AdminCompanyMemberService) {}

  @Get()
  @UseGuards(AuthGuard, AdminGuard)
  async getCompanyMembers(): Promise<AdminCompanyMemberResponseDto> {
    return this.adminCompanyMemberService.getCompanyMembers();
  }

  @Post()
  @UseGuards(AuthGuard, AdminGuard)
  async createCompany(@Body() data: AdminCreateCompanyDto): Promise<void> {
    return this.adminCompanyMemberService.createCompany(data);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, AdminGuard)
  async updateCompany(@Param('id') id: string, @Body() data: AdminUpdateCompanyDto): Promise<void> {
    return this.adminCompanyMemberService.updateCompany({ ...data, companyId: id });
  }

  @Post(':id/member')
  @UseGuards(AuthGuard, AdminGuard)
  async addCompanyMember(
    @Param('id') id: string,
    @Body() data: AdminAddCompanyMemberDto
  ): Promise<void> {
    return this.adminCompanyMemberService.addCompanyMember(id, data);
  }

  @Patch(':id/member/:memberId')
  @UseGuards(AuthGuard, AdminGuard)
  async updateCompanyMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body() data: AdminUpdateCompanyMemberDto
  ): Promise<void> {
    return this.adminCompanyMemberService.updateCompanyMember(memberId, data);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AdminGuard)
  async deleteCompany(@Param('id') id: string): Promise<void> {
    return this.adminCompanyMemberService.deleteCompany(id);
  }

  @Delete('/member/:memberId')
  @UseGuards(AuthGuard, AdminGuard)
  async deleteCompanyMember(@Param('memberId') memberId: string): Promise<void> {
    return this.adminCompanyMemberService.deleteCompanyMember(memberId);
  }
}
