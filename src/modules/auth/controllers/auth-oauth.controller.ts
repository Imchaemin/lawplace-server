import { BadRequestException, Controller, Get, Query, Res } from '@nestjs/common';
import { UserRole } from '@prisma/clients/client';
import { Response } from 'express';

import { AuthService } from '../services/auth.service';
import { AuthOauthService } from '../services/auth-oauth.service';

@Controller('auth')
export class AuthOauthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authOauthService: AuthOauthService
  ) {}

  @Get('google/callback')
  async googleCallback(
    @Query('code') code: string, // Google OAuth code
    @Query('state') state: string, // FE redirect url
    @Res() res: Response
  ) {
    if (!code) {
      throw new BadRequestException({
        type: 'BAD_REQUEST',
        message: 'authorization code missing',
      });
    }

    const googleTokens = await this.authOauthService.exchangeGoogleCode(code);
    const userAuth = await this.authService.signinup(googleTokens.id_token);
    const { termsAndConditionsAccepted, accessToken, refreshToken, role } = userAuth;

    const baseDeepLink = new URL(decodeURIComponent(state));
    const targetDeepLink =
      role === UserRole.USER && !termsAndConditionsAccepted ? `lawplace://terms` : baseDeepLink;

    const redirectUrl = new URL(targetDeepLink);
    redirectUrl.searchParams.set('accessToken', accessToken);
    redirectUrl.searchParams.set('refreshToken', refreshToken);

    return res.redirect(redirectUrl.toString());
  }

  @Get('apple/callback')
  async appleCallback(
    @Query('code') code: string, // Apple OAuth code
    @Query('state') state: string, // FE redirect url
    @Res() res: Response
  ) {
    if (!code) {
      throw new BadRequestException({
        type: 'BAD_REQUEST',
        message: 'authorization code missing',
      });
    }

    const appleTokens = await this.authOauthService.exchangeAppleCode(code);
    const userAuth = await this.authService.signinup(appleTokens.id_token);
    const { termsAndConditionsAccepted, accessToken, refreshToken, role } = userAuth;

    const baseDeepLink = new URL(decodeURIComponent(state));
    const targetDeepLink =
      role === UserRole.USER && !termsAndConditionsAccepted ? `lawplace://terms` : baseDeepLink;

    const redirectUrl = new URL(targetDeepLink);
    redirectUrl.searchParams.set('accessToken', accessToken);
    redirectUrl.searchParams.set('refreshToken', refreshToken);

    return res.redirect(redirectUrl.toString());
  }
}
