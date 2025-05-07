import { BadRequestException, Controller, Get, Query } from '@nestjs/common';

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
  async googleCallback(@Query() query: { code: string }) {
    const { code } = query;
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

    return {
      userId: userAuth.id,
      accessToken,
      refreshToken,
      termsAndConditionsAccepted: user.termsAndConditionsAccepted,
    };
  }

  @Get('apple/callback')
  async appleCallback(@Query() query: { code: string }) {
    const { code } = query;
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

    return {
      userId: userAuth.id,
      accessToken,
      refreshToken,
      termsAndConditionsAccepted: user.termsAndConditionsAccepted,
    };
  }
}
