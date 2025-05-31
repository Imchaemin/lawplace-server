import { Injectable } from '@nestjs/common';

import { UserCreditTransaction, UserCreditTransactionSchema } from '@/entities/user';
import { PrismaService } from '@/prisma/services/prisma.service';

@Injectable()
export class CreditService {
  constructor(private readonly prisma: PrismaService) {}

  async getCreditTransactions(creditId: string): Promise<UserCreditTransaction[]> {
    const credit = await this.prisma.credit.findUnique({
      where: { id: creditId },
      select: {
        id: true,
        lastRenewalAt: true,
        nextRenewalAt: true,
      },
    });
    if (!credit || !credit.lastRenewalAt) return [];

    const transactions = await this.prisma.creditTransaction.findMany({
      where: {
        creditId,
        createdAt: {
          gte: credit.lastRenewalAt,
          lte: credit.nextRenewalAt,
        },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        amount: true,
        type: true,
        sign: true,
        createdAt: true,
      },
    });

    return transactions.map(transaction => UserCreditTransactionSchema.parse(transaction));
  }
}
