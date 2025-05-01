import { ZodValidationPipe } from '@anatine/zod-nestjs';
import { Body, Controller, Post, Req, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  CompanyRole as PrismaCompanyRole,
  MembershipRole as PrismaMembershipRole,
} from '@prisma/clients/client';

import { RequestWithAuth } from '@/dtos/auth.dto';
import { AuthGuard } from '@/guards/auth.guard';
import { CompanyRole } from '@/guards/company-role.guard';
import { MembershipRole } from '@/guards/membership-role.guard';
import { PrivateCorsInterceptor } from '@/interceptors/cors.interceptor';

import { CompanyInvitationService } from '../services/company-invitation.service';

@ApiTags('COMPANY')
@UseInterceptors(PrivateCorsInterceptor)
@Controller('company/invitation')
@UsePipes(ZodValidationPipe)
export class CompanyInvitationController {
  constructor(private readonly companyInvitationService: CompanyInvitationService) {}

  @Post('invite')
  @UseGuards(AuthGuard)
  @MembershipRole(PrismaMembershipRole.USER_LV1)
  @CompanyRole(PrismaCompanyRole.COMPANY_ADMIN)
  async invite(
    @Req() req: RequestWithAuth,
    @Body() body: { inviteeName: string; inviteeEmail: string }
  ) {
    return this.companyInvitationService.invite(req.auth.sub, body.inviteeName, body.inviteeEmail);
  }
}
