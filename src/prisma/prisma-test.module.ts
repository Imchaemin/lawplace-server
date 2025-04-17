import { Global, Module } from '@nestjs/common';

import { PrismaTestService } from './services/prisma-test.service';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [PrismaTestService],
  exports: [PrismaTestService],
})
export class PrismaTestModule {}
