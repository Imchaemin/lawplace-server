import { Injectable } from '@nestjs/common';

import {
  UserTermsAndConditionsAcceptance,
  UserTermsAndConditionsAcceptanceSchema,
} from '@/entities/user';
import { PrismaService } from '@/prisma/services/prisma.service';

@Injectable()
export class UserTermsConditionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserTermsAndConditionsAcceptance(
    userId: string
  ): Promise<UserTermsAndConditionsAcceptance[]> {
    const userWithTermsAndConditionsAcceptance = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        termsAndConditionsAcceptance: {
          select: {
            id: true,
            accepted: true,
            acceptedAt: true,

            termsAndConditions: {
              select: {
                id: true,

                type: true,
                required: true,
              },
            },
          },
        },
      },
    });

    const termsAndConditionsAcceptances =
      userWithTermsAndConditionsAcceptance.termsAndConditionsAcceptance.map(acceptance =>
        UserTermsAndConditionsAcceptanceSchema.parse(acceptance)
      );
    return termsAndConditionsAcceptances;
  }

  async acceptTermsAndConditions(userId: string, termsAndConditionsId: string, accepted: boolean) {
    const acceptedAt = accepted ? new Date() : null;

    await this.prisma.termsAndConditionsAcceptance.upsert({
      where: { userId_termsAndConditionsId: { userId, termsAndConditionsId } },
      update: { accepted, acceptedAt },
      create: { userId, termsAndConditionsId, accepted, acceptedAt },
    });

    const userTermsAndConditionsAcceptance = await this.getUserTermsAndConditionsAcceptance(userId);
    const termsAndConditionsAccepted = userTermsAndConditionsAcceptance
      .filter(acceptance => acceptance.termsAndConditions.required)
      .every(acceptance => acceptance.accepted);

    await this.prisma.user.update({
      where: { id: userId },
      data: { termsAndConditionsAccepted },
    });
  }

  async acceptTermsAndConditionsBatch(
    userId: string,
    termsAndConditions: { id: string; accepted: boolean }[]
  ) {
    for (const data of termsAndConditions) {
      const acceptedAt = data.accepted ? new Date() : null;

      await this.prisma.termsAndConditionsAcceptance.upsert({
        where: { userId_termsAndConditionsId: { userId, termsAndConditionsId: data.id } },
        update: { accepted: data.accepted, acceptedAt },
        create: { userId, termsAndConditionsId: data.id, accepted: data.accepted, acceptedAt },
      });
    }

    const userTermsAndConditionsAcceptance = await this.getUserTermsAndConditionsAcceptance(userId);
    const termsAndConditionsAccepted = userTermsAndConditionsAcceptance
      .filter(acceptance => acceptance.termsAndConditions.required)
      .every(acceptance => acceptance.accepted);

    await this.prisma.user.update({
      where: { id: userId },
      data: { termsAndConditionsAccepted },
    });
  }
}
