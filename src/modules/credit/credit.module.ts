import { Module } from '@nestjs/common';

import { PrismaModule } from '@/prisma/prisma.module';

import { CreditController } from './controllers/credit.controller';
import { CreditService } from './services/credit.service';

@Module({
  imports: [PrismaModule],
  controllers: [CreditController],
  providers: [CreditService],
  exports: [CreditService],
})
export class CreditModule {}
