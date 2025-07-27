import { BadRequestException, Body, Controller, Post } from '@nestjs/common';

import { PrismaService } from '@/prisma/services/prisma.service';

import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthOauthController {
  constructor(private readonly authService: AuthService, private readonly prisma: PrismaService) {}

  @Post('google/callback')
  async googleCallback(@Body() body: { accessToken: string }) {
    const { accessToken } = body;
    if (!accessToken) {
      throw new BadRequestException({
        type: 'BAD_REQUEST',
        message: 'authorization code missing',
      });
    }

    const userAuth = await this.authService.signinupFromGoogle(accessToken);
    const user = await this.prisma.user.findUnique({
      where: { id: userAuth.id },
      select: {
        termsAndConditionsAccepted: true,
        role: true,
      },
    });

    return {
      userId: userAuth.id,
      accessToken: userAuth.accessToken,
      refreshToken: userAuth.refreshToken,
      termsAndConditionsAccepted: user.termsAndConditionsAccepted,
    };
  }

  @Post('apple/callback')
  async appleCallback(
    @Body() body: { appleUserId?: string; identityToken: string; name?: string }
  ) {
    const { appleUserId, identityToken, name } = body;
    if (!identityToken) {
      throw new BadRequestException({
        type: 'BAD_REQUEST',
        message: 'identityToken is required',
      });
    }

    const userAuth = await this.authService.signinupFromApple(identityToken, appleUserId, name);
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

  @Post('kakao/callback')
  async kakaoCallback(@Body() body: { accessToken: string }) {
    const { accessToken } = body;
    if (!accessToken) {
      throw new BadRequestException({
        type: 'BAD_REQUEST',
        message: 'authorization code missing',
      });
    }

    const userAuth = await this.authService.signinupFromKakao(accessToken);
    const user = await this.prisma.user.findUnique({
      where: { id: userAuth.id },
      select: {
        termsAndConditionsAccepted: true,
        role: true,
      },
    });

    return {
      userId: userAuth.id,
      accessToken: userAuth.accessToken,
      refreshToken: userAuth.refreshToken,
      termsAndConditionsAccepted: user.termsAndConditionsAccepted,
    };
  }

  @Post('naver/callback')
  async naverCallback(@Body() body: { accessToken: string }) {
    const { accessToken } = body;
    if (!accessToken) {
      throw new BadRequestException({
        type: 'BAD_REQUEST',
        message: 'authorization code missing',
      });
    }

    const userAuth = await this.authService.signinupFromNaver(accessToken);
    const user = await this.prisma.user.findUnique({
      where: { id: userAuth.id },
      select: {
        termsAndConditionsAccepted: true,
        role: true,
      },
    });

    return {
      userId: userAuth.id,
      accessToken: userAuth.accessToken,
      refreshToken: userAuth.refreshToken,
      termsAndConditionsAccepted: user.termsAndConditionsAccepted,
    };
  }
}
