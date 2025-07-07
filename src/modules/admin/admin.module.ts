import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { PrismaModule } from '@/prisma/prisma.module';

import { UserModule } from '../user/user.module';
import { AdminCompanyMemberController } from './controllers/admin-company-member.controller';
import {
  AdminMeetingRoomController,
  AdminMeetingRoomsController,
} from './controllers/meeting-room.controller';
import { AdminCompanyMemberService } from './services/admin-company-member.service';
import { AdminMeetingRoomService } from './services/admin-meeting-room.service';

@Module({
  imports: [PrismaModule, HttpModule, JwtModule, UserModule],
  controllers: [
    AdminCompanyMemberController,
    AdminMeetingRoomController,
    AdminMeetingRoomsController,
  ],
  providers: [AdminCompanyMemberService, AdminMeetingRoomService],
  exports: [AdminCompanyMemberService, AdminMeetingRoomService],
})
export class AdminModule {}
