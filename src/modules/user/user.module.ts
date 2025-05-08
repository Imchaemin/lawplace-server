import { Module } from '@nestjs/common';

import { PrismaModule } from '@/prisma/prisma.module';

import { UserController } from './controllers/user.controller';
import { UserMeetingRoomController } from './controllers/user-meeting-room.controller';
import {
  UserNotificationController,
  UserNotificationsController,
} from './controllers/user-notification.controller';
import { UserTermsConditionsController } from './controllers/user-terms-conditions.controller.ts';
import { UserService } from './services/user.service';
import { UserMeetingRoomService } from './services/user-meeting-room.service';
import { UserNotificationService } from './services/user-notification.service';
import { UserTermsConditionsService } from './services/user-terms-conditions.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    UserController,
    UserNotificationController,
    UserNotificationsController,
    UserMeetingRoomController,
    UserTermsConditionsController,
  ],
  providers: [
    UserService,
    UserNotificationService,
    UserMeetingRoomService,
    UserTermsConditionsService,
  ],
  exports: [
    UserService,
    UserNotificationService,
    UserMeetingRoomService,
    UserTermsConditionsService,
  ],
})
export class UserModule {}
