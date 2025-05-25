import { ZodValidationPipe } from '@anatine/zod-nestjs';
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RequestWithAuth } from '@/dtos/auth.dto';
import { UserTermsAndConditionsAcceptance } from '@/entities/user';
import { AuthGuard } from '@/guards/auth.guard';
import { PrivateCorsInterceptor } from '@/interceptors/cors.interceptor';

import { UserTermsConditionsService } from '../services/user-terms-conditions.service';

@ApiTags('USER')
@UseInterceptors(PrivateCorsInterceptor)
@Controller('user/terms-conditions')
@UsePipes(ZodValidationPipe)
export class UserTermsConditionsController {
  constructor(private readonly userTermsConditionsService: UserTermsConditionsService) {}

  @Get('')
  @UseGuards(AuthGuard)
  async getUserTermsAndConditionsAcceptance(
    @Req() req: RequestWithAuth
  ): Promise<UserTermsAndConditionsAcceptance[]> {
    return this.userTermsConditionsService.getUserTermsAndConditionsAcceptance(req.auth.sub);
  }

  @Post('acceptance')
  @UseGuards(AuthGuard)
  async acceptTermsAndConditions(
    @Req() req: RequestWithAuth,
    @Body() body: { termsAndConditionsId: string; acceptance: boolean }
  ): Promise<void> {
    return this.userTermsConditionsService.acceptTermsAndConditions(
      req.auth.sub,
      body.termsAndConditionsId,
      body.acceptance
    );
  }

  @Post('acceptance/batch')
  @UseGuards(AuthGuard)
  async acceptTermsAndConditionsBatch(
    @Req() req: RequestWithAuth,
    @Body() body: { termsAndConditions: { id: string; accepted: boolean }[] }
  ): Promise<void> {
    return this.userTermsConditionsService.acceptTermsAndConditionsBatch(
      req.auth.sub,
      body.termsAndConditions
    );
  }
}
