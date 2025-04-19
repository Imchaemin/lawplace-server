import { Module } from '@nestjs/common';

import { PrismaModule } from '@/prisma/prisma.module';

import { UserTermsConditionsService } from './services/user-terms-conditions.service';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [UserTermsConditionsService],
  exports: [UserTermsConditionsService],
})
export class UserModule {}
