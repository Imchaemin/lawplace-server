import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SHA256 } from 'crypto-js';
import { decode } from 'jsonwebtoken';

import { JWT_SECRET } from '@/constants';
import { JwtPayload } from '@/dtos/auth.dto';
import { UserAuth } from '@/entities/user';
import { PrismaService } from '@/prisma/services/prisma.service';

import { GeneratedTokensDto } from '../dtos/auth.dto';
import { AuthOauthService, UserInfo } from './auth-oauth.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authOauthService: AuthOauthService,
    private readonly jwtService: JwtService
  ) {}

  async signinup(userInfo: UserInfo): Promise<UserAuth> {
    const existing = await this.prisma.user.findUnique({
      where: { email: userInfo.email },
    });
    if (existing) {
      await this.prisma.user.update({
        where: { id: existing.id },
        data: {
          name: userInfo.name,

          provider: userInfo.provider,
          providerId: userInfo.id,
        },
      });
      const { accessToken, refreshToken } = await this.generateTokens(existing.id);

      return {
        id: existing.id,
        accessToken,
        refreshToken,
        termsAndConditionsAccepted: existing.termsAndConditionsAccepted,
      };
    }

    const newUser = await this.prisma.user.create({
      data: {
        email: userInfo.email,
        name: userInfo.name,
        phone: '',
        provider: userInfo.provider,
        providerId: userInfo.id,
        termsAndConditionsAccepted: false,
      },
      select: {
        id: true,
        email: true,
        companyId: true,
        termsAndConditionsAccepted: true,
      },
    });

    await Promise.all([
      this.prisma.termsAndConditionsAcceptance.upsert({
        where: {
          userId_termsAndConditionsId: {
            userId: newUser.id,
            termsAndConditionsId: 'TERMS_OF_SERVICE',
          },
        },
        update: {},
        create: {
          userId: newUser.id,
          termsAndConditionsId: 'TERMS_OF_SERVICE',
          accepted: false,
        },
      }),
      this.prisma.termsAndConditionsAcceptance.upsert({
        where: {
          userId_termsAndConditionsId: {
            userId: newUser.id,
            termsAndConditionsId: 'PRIVACY_POLICY',
          },
        },
        update: {},
        create: {
          userId: newUser.id,
          termsAndConditionsId: 'PRIVACY_POLICY',
          accepted: false,
        },
      }),
      this.prisma.termsAndConditionsAcceptance.upsert({
        where: {
          userId_termsAndConditionsId: {
            userId: newUser.id,
            termsAndConditionsId: 'MARKETING_POLICY',
          },
        },
        update: {},
        create: {
          userId: newUser.id,
          termsAndConditionsId: 'MARKETING_POLICY',
          accepted: false,
        },
      }),
    ]);

    if (newUser.companyId) {
      const companyInvite = await this.prisma.companyInvitation.findUnique({
        where: {
          companyId_userEmail: {
            companyId: newUser.companyId,
            userEmail: newUser.email,
          },
        },
      });

      const company = await this.prisma.company.findUnique({
        where: { id: companyInvite.companyId },
        select: {
          name: true,
          membership: {
            select: {
              startAt: true,
              endAt: true,
            },
          },
        },
      });

      if (companyInvite) {
        const notificationCategory = await this.prisma.notificationCategory.findUnique({
          where: { name: 'COMPANY_INVITATION' },
        });
        await this.prisma.notification.create({
          data: {
            title: '회사 초대 알림',
            content: '회사 초대 알림',

            link: '',
            metadata: {
              companyInvitationId: companyInvite.id,
              companyId: companyInvite.companyId,
              companyName: company.name,

              membershipRole: companyInvite.membershipRole,
              membershipStartAt: company.membership.startAt,
              membershipEndAt: company.membership.endAt,
            },
            notificationCategoryId: notificationCategory?.id,

            target: newUser.id,
          },
        });
      }
    }

    const { accessToken, refreshToken } = await this.generateTokens(newUser.id);
    return {
      id: newUser.id,
      accessToken,
      refreshToken,
      termsAndConditionsAccepted: newUser.termsAndConditionsAccepted,
    };
  }

  async signinupFromApple(
    identityToken: string,
    appleUserId?: string,
    name?: string
  ): Promise<UserAuth> {
    const { sub, email } = decode(identityToken) as { email: string; sub: string };

    return this.signinup({
      id: appleUserId || sub.toString(),
      email,
      name: name ? name : '사용자',
      provider: 'apple',
    });
  }

  async signinupFromGoogle(googleAccessToken: string): Promise<UserAuth> {
    const userInfo = await this.authOauthService.getGoogleUserInfo(googleAccessToken);

    return this.signinup(userInfo);
  }

  async generateTokens(userId: string) {
    const payload = { sub: userId };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '7d', secret: JWT_SECRET });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '365d', secret: JWT_SECRET });

    const hashedRefreshToken = SHA256(refreshToken).toString();
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken },
    });

    return { accessToken, refreshToken };
  }

  async refreshToken(userId: string, refreshToken: string): Promise<GeneratedTokensDto> {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(refreshToken);
    } catch {
      throw new UnauthorizedException({
        type: 'UNAUTHORIZED',
        message: 'invalid refresh token',
      });
    }

    const userIdFromRefreshToken = payload.sub;
    if (userIdFromRefreshToken !== userId) {
      throw new UnauthorizedException({
        type: 'UNAUTHORIZED',
        message: 'refresh token mismatch',
      });
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, refreshToken: true },
    });
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException({
        type: 'UNAUTHORIZED',
        message: 'no refresh token stored',
      });
    }

    const hashedRefreshToken = SHA256(refreshToken).toString();
    const isMatch = hashedRefreshToken === user.refreshToken;
    if (!isMatch) {
      throw new UnauthorizedException({
        type: 'UNAUTHORIZED',
        message: 'refresh token mismatch',
      });
    }

    const tokens = await this.generateTokens(userId);
    return tokens;
  }

  async deleteUser(userId: string) {
    if (!userId) {
      throw new UnauthorizedException({
        type: 'UNAUTHORIZED',
        message: 'user id is required',
      });
    }
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException({
        type: 'UNAUTHORIZED',
        message: 'user not found',
      });
    }
    await this.prisma.user.delete({ where: { id: userId } });
  }
}
