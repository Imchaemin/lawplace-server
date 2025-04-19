import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma/services/prisma.service';

@Injectable()
export class UserAuthService {
  constructor(private readonly prisma: PrismaService) {}

  async acceptTermsAndConditions(userId: string, termsAndConditionsId: string, accepted: boolean) {
    const acceptedAt = accepted ? new Date() : null;

    await this.prisma.termsAndConditionsAcceptance.upsert({
      where: { userId_termsAndConditionsId: { userId, termsAndConditionsId } },
      update: { accepted, acceptedAt },
      create: { userId, termsAndConditionsId, accepted, acceptedAt },
    });
  }
}
