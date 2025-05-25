import { Module } from '@nestjs/common';

import { PrismaModule } from '@/prisma/prisma.module';

import { MetadataController } from './controllers/metadata.controller';
import { MetadataService } from './services/metadata.service';

@Module({
  imports: [PrismaModule],
  controllers: [MetadataController],
  providers: [MetadataService],
  exports: [MetadataService],
})
export class MetadataModule {}
