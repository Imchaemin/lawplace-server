import { ZodValidationPipe } from '@anatine/zod-nestjs';
import {
  Controller,
  Delete,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RequestWithAuth } from '@/dtos/auth.dto';
import { BaseReqQueryDto } from '@/dtos/base.dto';
import { AuthGuard } from '@/guards/auth.guard';
import { PrivateCorsInterceptor } from '@/interceptors/cors.interceptor';

import { GetUserMeetingRoomReservationsResDto } from '../dtos/user-meeting-room.dto';
import { UserMeetingRoomService } from '../services/user-meeting-room.service';

@ApiTags('USER')
@UseInterceptors(PrivateCorsInterceptor)
@Controller('user/meeting-room')
@UsePipes(ZodValidationPipe)
export class UserMeetingRoomController {
  constructor(private readonly userMeetingRoomService: UserMeetingRoomService) {}

  @Get('reservations')
  @UseGuards(AuthGuard)
  async getUserMeetingRoomReservations(
    @Req() req: RequestWithAuth,
    @Query() query: BaseReqQueryDto
  ): Promise<GetUserMeetingRoomReservationsResDto> {
    return this.userMeetingRoomService.getUserMeetingRoomReservations(req.auth.sub, query);
  }

  @Delete('reservations/:reservationId')
  @UseGuards(AuthGuard)
  async cancelReservation(@Req() req: RequestWithAuth, @Param() param: { reservationId: string }) {
    return this.userMeetingRoomService.cancel(req.auth.sub, param.reservationId);
  }
}
