import { ZodValidationPipe } from '@anatine/zod-nestjs';
import { Body, Controller, Post, Query, Res, UseInterceptors, UsePipes } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { PrivateCorsInterceptor } from '@/interceptors/cors.interceptor';

import { SigninReqBodyDto } from '../dtos/admin-auth.dto';
import { AdminAuthService } from '../services/admin-auth.service';

@ApiTags('AUTH')
@UseInterceptors(PrivateCorsInterceptor)
@Controller('admin/auth')
@UsePipes(ZodValidationPipe)
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('signup')
  async signup(
    @Query() query: { state: string },
    @Body() body: SigninReqBodyDto,
    @Res() res: Response
  ) {
    const { state } = query;

    const userAuth = await this.adminAuthService.signupAdmin(body);
    const { accessToken, refreshToken } = userAuth;

    const baseDeepLink = new URL(decodeURIComponent(state));
    const targetDeepLink = baseDeepLink;

    const redirectUrl = new URL(targetDeepLink);
    redirectUrl.searchParams.set('accessToken', accessToken);
    redirectUrl.searchParams.set('refreshToken', refreshToken);

    return res.redirect(redirectUrl.toString());
  }

  @Post('signin')
  async signin(
    @Query() query: { state: string },
    @Body() body: { email: string },
    @Res() res: Response
  ) {
    const { state } = query;

    const userAuth = await this.adminAuthService.signinWithPreset(body.email);
    const { accessToken, refreshToken } = userAuth;

    const baseDeepLink = new URL(decodeURIComponent(state));

    const redirectUrl = new URL(baseDeepLink);
    redirectUrl.searchParams.set('accessToken', accessToken);
    redirectUrl.searchParams.set('refreshToken', refreshToken);

    return res.redirect(redirectUrl.toString());
  }
}
