import { ZodValidationPipe } from '@anatine/zod-nestjs';
import { Controller, Get, UseInterceptors, UsePipes } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PrivateCorsInterceptor } from '@/interceptors/cors.interceptor';

import { AdminMeetingRoomService } from '../services/admin-meeting-room.service';

@ApiTags('ADMIN_MEETING_ROOM')
@UseInterceptors(PrivateCorsInterceptor)
@Controller('admin/meeting-rooms')
@UsePipes(ZodValidationPipe)
export class AdminMeetingRoomsController {
  constructor(private readonly meetingRoomService: AdminMeetingRoomService) {}

  @Get('')
  async getMeetingRooms() {
    return this.meetingRoomService.getMeetingRooms();
  }
}

@ApiTags('ADMIN_MEETING_ROOM')
@UseInterceptors(PrivateCorsInterceptor)
@Controller('admin/meeting-room')
@UsePipes(ZodValidationPipe)
export class AdminMeetingRoomController {
  constructor(private readonly meetingRoomService: AdminMeetingRoomService) {}

  @Get('')
  async getMeetingRooms() {
    return this.meetingRoomService.getMeetingRooms();
  }
}
