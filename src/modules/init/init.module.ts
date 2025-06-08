import { Module } from '@nestjs/common';

import { PrismaModule } from '@/prisma/prisma.module';

import { InitService } from './services/init.service';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [InitService],
  exports: [InitService],
})
export class InitModule {}
