import { Injectable } from '@nestjs/common';
import { CronExpression } from '@nestjs/schedule';
import { Cron } from '@nestjs/schedule';
import { addMonths, set } from 'date-fns';
import { chunk } from 'lodash';

import { DISABLE_CRON } from '@/constants';
import { PrismaService } from '@/prisma/services/prisma.service';

@Injectable()
export class CreditCronService {
  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_HOUR, { disabled: DISABLE_CRON, timeZone: 'Asia/Seoul' })
  async creditResetCron() {
    const now = set(new Date(), { minutes: 0, seconds: 0, milliseconds: 0 });

    const credits = await this.prisma.credit.findMany({
      where: {
        lastRenewalAt: {
          lte: now,
        },
        nextRenewalAt: {
          gte: now,
          not: null,
        },
      },
    });

    const chunks = chunk(credits, 100);
    for (const chunk of chunks) {
      for (const credit of chunk) {
        const defaultCredit = credit.defaultCredit;
        const nextRenewalAt = addMonths(credit.lastRenewalAt, 1);

        await this.prisma.credit.update({
          where: { id: credit.id },
          data: {
            lastRenewalAt: now,
            nextRenewalAt,
            currentCredit: defaultCredit,
          },
        });
      }
    }
  }
}
