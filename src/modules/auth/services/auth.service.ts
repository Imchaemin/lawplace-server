import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as admin from 'firebase-admin';

import { JwtPayload } from '@/dtos/auth.dto';
import { UserBase } from '@/entities/user';
import { UserService } from '@/modules/user/services/user.service';
import { PrismaService } from '@/prisma/services/prisma.service';

import { GeneratedTokensDto } from '../dtos/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    @Inject('firebase') private readonly firebase: admin.app.App
  ) {}

  private async verifyIdToken(idToken: string) {
    try {
      return await this.firebase.auth().verifyIdToken(idToken);
    } catch {
      throw new UnauthorizedException('Invalid firebase id token');
    }
  }

  private async generateTokens(userId: string) {
    const payload = { sub: userId };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '5m' });

    const hash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hash },
    });

    return { accessToken, refreshToken };
  }

  async signinup(idToken: string): Promise<UserBase> {
    // check token
    const decoded = await this.verifyIdToken(idToken);
    const {
      uid,
      email,
      firebase: { sign_in_provider: provider },
    } = decoded;

    // check user
    const existing = await this.prisma.user.findUnique({ where: { id: uid } });
    if (existing) {
      await this.generateTokens(existing.id);
      const userBase = await this.userService.getUserBase(existing.id);

      return userBase;
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

    await this.generateTokens(newUser.id);
    const userBase = await this.userService.getUserBase(newUser.id);

    return userBase;
  }

  async refreshToken(userId: string, refreshToken: string): Promise<GeneratedTokensDto> {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const userIdFromRefreshToken = payload.sub;
    if (userIdFromRefreshToken !== userId) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.refreshToken) {
      throw new UnauthorizedException('No refresh token stored');
    }

    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isMatch) {
      throw new UnauthorizedException('Refresh token mismatch');
    }

    const tokens = await this.generateTokens(userId);
    return tokens;
  }
}
