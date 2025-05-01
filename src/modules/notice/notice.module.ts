import { Module } from '@nestjs/common';

import { PrismaModule } from '@/prisma/prisma.module';

import { NoticeController } from './controllers/notice.controller';
import { NoticeService } from './services/notice.service';

@Module({
  imports: [PrismaModule],
  controllers: [NoticeController],
  providers: [NoticeService],
  exports: [NoticeService],
})
export class NoticeModule {}
