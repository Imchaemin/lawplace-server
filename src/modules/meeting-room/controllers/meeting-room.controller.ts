import { ZodValidationPipe } from '@anatine/zod-nestjs';
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MembershipRole as PrismaMembershipRole } from '@prisma/client';

import { RequestWithAuth } from '@/dtos/auth.dto';
import { AuthGuard } from '@/guards/auth.guard';
import { MembershipRole } from '@/guards/membership-role.guard';
import { PrivateCorsInterceptor } from '@/interceptors/cors.interceptor';

import { ReserveMeetingRoomBodyDto } from '../dtos/meeting-room.dto';
import { MeetingRoomService } from '../services/meeting-room.service';

@ApiTags('MEETING_ROOM')
@UseInterceptors(PrivateCorsInterceptor)
@Controller('meeting-room')
@UsePipes(ZodValidationPipe)
export class MeetingRoomController {
  constructor(private readonly meetingRoomService: MeetingRoomService) {}

  @Post('reserve')
  @UseGuards(AuthGuard)
  @MembershipRole(PrismaMembershipRole.USER_LV1)
  async reserveMeetingRoom(@Req() req: RequestWithAuth, @Body() body: ReserveMeetingRoomBodyDto) {
    return this.meetingRoomService.reserveMeetingRoom(
      req.auth.sub,
      body.meetingRoomId,
      body.startAt,
      body.endAt
    );
  }
}

@ApiTags('MEETING_ROOM')
@UseInterceptors(PrivateCorsInterceptor)
@Controller('meeting-rooms')
@UsePipes(ZodValidationPipe)
export class MeetingRoomsController {
  constructor(private readonly meetingRoomService: MeetingRoomService) {}

  @Get('')
  async getMeetingRooms() {
    return this.meetingRoomService.getMeetingRooms();
  }
}
