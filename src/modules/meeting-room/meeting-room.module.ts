import { Module } from '@nestjs/common';

import { PrismaModule } from '@/prisma/prisma.module';

import { MeetingRoomController } from './controllers/meeting-room.controller';
import { MeetingRoomService } from './services/meeting-room.service';

@Module({
  imports: [PrismaModule],
  controllers: [MeetingRoomController],
  providers: [MeetingRoomService],
  exports: [MeetingRoomService],
})
export class MeetingRoomModule {}
