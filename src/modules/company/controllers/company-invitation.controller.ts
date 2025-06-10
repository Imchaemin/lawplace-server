import { ZodValidationPipe } from '@anatine/zod-nestjs';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  CompanyRole as PrismaCompanyRole,
  MembershipRole as PrismaMembershipRole,
} from '@prisma/client';

import { RequestWithAuth } from '@/dtos/auth.dto';
import { AuthGuard } from '@/guards/auth.guard';
import { CompanyRole } from '@/guards/company-role.guard';
import { MembershipRole } from '@/guards/membership-role.guard';
import { PrivateCorsInterceptor } from '@/interceptors/cors.interceptor';

import { CompanyInvitationService } from '../services/company-invitation.service';

@ApiTags('COMPANY')
@UseInterceptors(PrivateCorsInterceptor)
@Controller('company')
@UsePipes(ZodValidationPipe)
export class CompanyInvitationController {
  constructor(private readonly companyInvitationService: CompanyInvitationService) {}

  @Get(':companyId/invitation/:companyInvitationId')
  @UseGuards(AuthGuard)
  async getInvitation(
    @Req() req: RequestWithAuth,
    @Param() param: { companyId: string; companyInvitationId: string }
  ) {
    return this.companyInvitationService.getInvitation(param.companyInvitationId);
  }

  @Post(':companyId/invite')
  @UseGuards(AuthGuard)
  @MembershipRole(PrismaMembershipRole.USER_LV1)
  @CompanyRole(PrismaCompanyRole.COMPANY_ADMIN)
  async invite(
    @Req() req: RequestWithAuth,
    @Body() body: { inviteeName: string; inviteeEmail: string }
  ) {
    return this.companyInvitationService.invite(req.auth.sub, body.inviteeName, body.inviteeEmail);
  }

  @Post(':companyId/accept')
  @UseGuards(AuthGuard)
  async accept(
    @Req() req: RequestWithAuth,
    @Param() param: { companyId: string },
    @Body() body: { companyInvitationId: string; acceptance: boolean }
  ) {
    return this.companyInvitationService.acceptInvitation(
      req.auth.sub,
      param.companyId,
      body.companyInvitationId,
      body.acceptance
    );
  }

  @Post(':companyId/accept-no-credential')
  async acceptNoCredential(
    @Param() param: { companyId: string },
    @Body()
    body: { email: string; name: string; companyRole: PrismaCompanyRole; acceptance: boolean }
  ) {
    return this.companyInvitationService.acceptInvitationNoCredential(
      param.companyId,
      body.email,
      body.name,
      body.acceptance
    );
  }
}
