import { BadRequestException, Controller, Get, Query, Res } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Response } from 'express';

import { PrismaService } from '@/prisma/services/prisma.service';

import { AuthService } from '../services/auth.service';
import { AuthOauthService } from '../services/auth-oauth.service';

@Controller('auth')
export class AuthOauthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authOauthService: AuthOauthService,
    private readonly prisma: PrismaService
  ) {}

  @Get('google/callback')
  async googleCallback(
    @Query()
    query: {
      code: string; // Google OAuth code
      state: string; // FE redirect url
    },
    @Res() res: Response
  ) {
    const { code, state } = query;
    if (!code) {
      throw new BadRequestException({
        type: 'BAD_REQUEST',
        message: 'authorization code missing',
      });
    }

    const googleTokens = await this.authOauthService.exchangeGoogleCode(code);
    const userAuth = await this.authService.signinup(googleTokens.id_token);
    const { accessToken, refreshToken } = userAuth;

    const user = await this.prisma.user.findUnique({
      where: { id: userAuth.id },
      select: {
        termsAndConditionsAccepted: true,
        role: true,
      },
    });

    const baseDeepLink = new URL(decodeURIComponent(state));
    const targetDeepLink =
      user.role === UserRole.USER && !user.termsAndConditionsAccepted
        ? `lawplace://terms`
        : baseDeepLink;

    const redirectUrl = new URL(targetDeepLink);
    redirectUrl.searchParams.set('accessToken', accessToken);
    redirectUrl.searchParams.set('refreshToken', refreshToken);

    return res.redirect(redirectUrl.toString());
  }

  @Get('apple/callback')
  async appleCallback(
    @Query()
    query: {
      code: string; // Apple OAuth code
      state: string; // FE redirect url
    },
    @Res() res: Response
  ) {
    const { code, state } = query;
    if (!code) {
      throw new BadRequestException({
        type: 'BAD_REQUEST',
        message: 'authorization code missing',
      });
    }

    const appleTokens = await this.authOauthService.exchangeAppleCode(code);
    const userAuth = await this.authService.signinup(appleTokens.id_token);
    const { accessToken, refreshToken } = userAuth;

    const user = await this.prisma.user.findUnique({
      where: { id: userAuth.id },
      select: {
        termsAndConditionsAccepted: true,
        role: true,
      },
    });

    const baseDeepLink = new URL(decodeURIComponent(state));
    const targetDeepLink =
      user.role === UserRole.USER && !user.termsAndConditionsAccepted
        ? `lawplace://terms`
        : baseDeepLink;

    const redirectUrl = new URL(targetDeepLink);
    redirectUrl.searchParams.set('accessToken', accessToken);
    redirectUrl.searchParams.set('refreshToken', refreshToken);

    return res.redirect(redirectUrl.toString());
  }
}
