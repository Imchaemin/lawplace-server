import { Global, Module } from '@nestjs/common';

import { PrismaService } from './services/prisma.service';
import { PrismaTestService } from './services/prisma-test.service';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [PrismaTestService],
  exports: [PrismaTestService],
})
export class PrismaTestModule {}

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
