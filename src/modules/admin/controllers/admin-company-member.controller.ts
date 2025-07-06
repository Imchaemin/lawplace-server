import { ZodValidationPipe } from '@anatine/zod-nestjs';
import { Controller, Get, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthGuard } from '@/guards/auth.guard';
import { AdminGuard } from '@/guards/user-role.guard';
import { PrivateCorsInterceptor } from '@/interceptors/cors.interceptor';

import { AdminCompanyMemberResponseDto } from '../dtos/company-member.dto';
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
}
