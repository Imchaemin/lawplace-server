import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CompanyRole, UserRole } from '@prisma/clients/client';
import * as bcrypt from 'bcrypt';
import * as admin from 'firebase-admin';

import { JwtPayload } from '@/dtos/auth.dto';
import {
  CompanyMembership,
  CompanyMembershipSchema,
  UserMembership,
  UserMembershipSchema,
} from '@/entities/membership';
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

  private async verifyIdToken(idToken: string) {
    try {
      return await this.firebase.auth().verifyIdToken(idToken);
    } catch {
      throw new UnauthorizedException({
        type: 'UNAUTHORIZED',
        message: 'invalid firebase id token',
      });
    }
  }

  private async generateTokens(
    userId: string,
    role: UserRole,
    termsAndConditionsAccepted: boolean,
    userMembership?: UserMembership,
    companyId?: string,
    companyMembership?: CompanyMembership,
    companyRole?: CompanyRole
  ) {
    const payload = {
      sub: userId,
      role,
      termsAndConditionsAccepted,
      userMembership,
      companyId,
      companyMembership,
      companyRole,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '5m' });

    const hash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hash },
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
      select: {
        role: true,
        termsAndConditionsAccepted: true,
        membership: true,
        company: true,
        companyRole: true,
      },
    });
    if (existing) {
      const userMembership = UserMembershipSchema.parse(existing.membership);
      const companyMembership = CompanyMembershipSchema.parse(existing.company);

      const tokens = await this.generateTokens(
        uid,
        existing.role,
        existing.termsAndConditionsAccepted,
        userMembership,
        existing.company?.id,
        companyMembership,
        existing.companyRole
      );

      return {
        id: uid,
        role: existing.role,
        termsAndConditionsAccepted: existing.termsAndConditionsAccepted,
        ...tokens,
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
      },
    });

    const tokens = await this.generateTokens(
      newUser.id,
      UserRole.USER,
      false,
      undefined,
      undefined,
      undefined
    );
    return {
      id: newUser.id,
      role: UserRole.USER,
      termsAndConditionsAccepted: false,
      ...tokens,
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
      select: {
        role: true,
        refreshToken: true,
        termsAndConditionsAccepted: true,
        membership: true,
        company: true,
        companyRole: true,
      },
    });
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException({
        type: 'UNAUTHORIZED',
        message: 'no refresh token stored',
      });
    }

    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isMatch) {
      throw new UnauthorizedException({
        type: 'UNAUTHORIZED',
        message: 'refresh token mismatch',
      });
    }

    const userMembership = UserMembershipSchema.parse(user.membership);
    const companyMembership = CompanyMembershipSchema.parse(user.company);

    const tokens = await this.generateTokens(
      userId,
      user.role,
      user.termsAndConditionsAccepted,
      userMembership,
      user.company?.id,
      companyMembership,
      user.companyRole
    );
    return tokens;
  }
}
