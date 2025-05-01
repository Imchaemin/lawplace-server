import { ZodValidationPipe } from '@anatine/zod-nestjs';
import {
  Body,
  Controller,
  Get,
  Patch,
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

import { GetUserNotificationsResDto } from '../dtos/user-notification.dto';
import { UserNotificationService } from '../services/user-notification.service';

@ApiTags('USER')
@UseInterceptors(PrivateCorsInterceptor)
@Controller('user')
@UsePipes(ZodValidationPipe)
export class UserNotificationController {
  constructor(private readonly userNotificationService: UserNotificationService) {}

  @Get('notifications')
  @UseGuards(AuthGuard)
  async getUserNotifications(
    @Req() req: RequestWithAuth,
    @Query() query: BaseReqQueryDto
  ): Promise<GetUserNotificationsResDto> {
    return this.userNotificationService.getUserNotifications(req.auth.sub, query);
  }

  @Patch('notifications/read')
  @UseGuards(AuthGuard)
  async readNotification(
    @Req() req: RequestWithAuth,
    @Body() body: { notificationId: string }
  ): Promise<void> {
    return this.userNotificationService.readNotification(body.notificationId, req.auth.sub);
  }
}
