import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma/services/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async savePushToken(userId: string, deviceId: string, platform: string, token: string) {
    await this.prisma.pushToken.upsert({
      where: { deviceId_token_userId: { deviceId, token, userId } },
      update: { token },
      create: { deviceId, platform, token, userId },
    });
  }
}
