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
import { AdminNoticeController, AdminNoticesController } from './controllers/notice.controller';
import { AdminCompanyMemberService } from './services/admin-company-member.service';
import { AdminMeetingRoomService } from './services/admin-meeting-room.service';
import { AdminNoticeService } from './services/admin-notice.service';

@Module({
  imports: [PrismaModule, HttpModule, JwtModule, UserModule],
  controllers: [
    AdminCompanyMemberController,
    AdminMeetingRoomController,
    AdminMeetingRoomsController,
    AdminNoticeController,
    AdminNoticesController,
  ],
  providers: [AdminCompanyMemberService, AdminMeetingRoomService, AdminNoticeService],
  exports: [AdminCompanyMemberService, AdminMeetingRoomService, AdminNoticeService],
})
export class AdminModule {}
