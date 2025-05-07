import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SHA256 } from 'crypto-js';
import * as admin from 'firebase-admin';

import { JWT_SECRET } from '@/constants';
import { JwtPayload } from '@/dtos/auth.dto';
import { UserAuth } from '@/entities/user';
import { PrismaService } from '@/prisma/services/prisma.service';

import { GeneratedTokensDto } from '../dtos/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    @Inject('firebase') private readonly firebase: admin.app.App
  ) {}

  async verifyIdToken(idToken: string) {
    try {
      return await this.firebase.auth().verifyIdToken(idToken);
    } catch {
      throw new UnauthorizedException({
        type: 'UNAUTHORIZED',
        message: 'invalid firebase id token',
      });
    }
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

  async signinup(idToken: string): Promise<UserAuth> {
    // check token
    const decoded = await this.verifyIdToken(idToken);
    const {
      uid,
      email,
      firebase: { sign_in_provider: provider },
    } = decoded;

    // check user
    const existing = await this.prisma.user.findUnique({
      where: { id: uid },
    });
    if (existing) {
      const { accessToken, refreshToken } = await this.generateTokens(uid);

      return {
        id: uid,
        accessToken,
        refreshToken,
        termsAndConditionsAccepted: existing.termsAndConditionsAccepted,
      };
    }

    // get user record
    const userRecord = await this.firebase.auth().getUser(uid);

    const name = userRecord.displayName || 'user';
    const phone = userRecord.phoneNumber;

    // create user
    const newUser = await this.prisma.user.create({
      data: {
        id: uid,
        email,
        name,
        phone,
        provider,
        termsAndConditionsAccepted: false,
      },
    });

    const companyInvite = await this.prisma.companyInvitation.findUnique({
      where: {
        companyId_userEmail: {
          companyId: newUser.companyId,
          userEmail: newUser.email,
        },
      },
    });

    if (companyInvite) {
      const notificationCategory = await this.prisma.notificationCategory.findUnique({
        where: { name: 'company-invitation' },
      });
      await this.prisma.notification.create({
        data: {
          title: '회사 초대 알림',
          content: '회사 초대 알림',

          link: `/company/${companyInvite.companyId}/invitation/${companyInvite.id}`,
          metadata: { companyInvitationId: companyInvite.id },
          notificationCategoryId: notificationCategory?.id,

          target: newUser.id,
        },
      });
    }

    const { accessToken, refreshToken } = await this.generateTokens(newUser.id);
    return {
      id: newUser.id,
      accessToken,
      refreshToken,
      termsAndConditionsAccepted: newUser.termsAndConditionsAccepted,
    };
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
}
