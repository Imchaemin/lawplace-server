import { Injectable } from '@nestjs/common';

import { UserBase, UserBaseSchema } from '@/entities/user';
import { PrismaService } from '@/prisma/services/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserBase(id: string): Promise<UserBase> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        provider: true,

        termsAndConditionsAcceptance: {
          select: {
            accepted: true,
            termsAndConditions: {
              select: {
                required: true,
              },
            },
          },
        },
      },
    });

    const accepted = user.termsAndConditionsAcceptance
      .filter(acceptance => acceptance.termsAndConditions.required)
      .every(acceptance => acceptance.accepted);

    const data = UserBaseSchema.parse({ ...user, accepted });
    return data;
  }
}
