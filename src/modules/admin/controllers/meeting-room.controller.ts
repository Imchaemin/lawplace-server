import { ZodValidationPipe } from '@anatine/zod-nestjs';
import { Controller, Get, Query, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthGuard } from '@/guards/auth.guard';
import { AdminGuard } from '@/guards/user-role.guard';
import { PrivateCorsInterceptor } from '@/interceptors/cors.interceptor';

import { AdminMeetingRoomService } from '../services/admin-meeting-room.service';

@ApiTags('ADMIN_MEETING_ROOM')
@UseInterceptors(PrivateCorsInterceptor)
@Controller('admin/meeting-rooms')
@UsePipes(ZodValidationPipe)
export class AdminMeetingRoomsController {
  constructor(private readonly meetingRoomService: AdminMeetingRoomService) {}

  @Get('')
  @UseGuards(AuthGuard, AdminGuard)
  async getMeetingRooms() {
    return this.meetingRoomService.getMeetingRooms();
  }

  @Get('reservations')
  @UseGuards(AuthGuard, AdminGuard)
  async getMeetingRoomReservations(@Query('date') date: string) {
    return this.meetingRoomService.getMeetingRoomReservations(new Date(date));
  }
}

@ApiTags('ADMIN_MEETING_ROOM')
@UseInterceptors(PrivateCorsInterceptor)
@Controller('admin/meeting-room')
@UsePipes(ZodValidationPipe)
export class AdminMeetingRoomController {
  constructor(private readonly meetingRoomService: AdminMeetingRoomService) {}

  @Get('')
  @UseGuards(AuthGuard, AdminGuard)
  async getMeetingRooms() {
    return this.meetingRoomService.getMeetingRooms();
  }
}
