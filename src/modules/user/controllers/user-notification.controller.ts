import { ZodValidationPipe } from '@anatine/zod-nestjs';
import {
  Body,
  Controller,
  Get,
  Param,
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
import { UserNotification } from '@/entities/user';
import { AuthGuard } from '@/guards/auth.guard';
import { PrivateCorsInterceptor } from '@/interceptors/cors.interceptor';

import { GetUserNotificationsResDto } from '../dtos/user-notification.dto';
import { UserNotificationService } from '../services/user-notification.service';

@ApiTags('USER')
@UseInterceptors(PrivateCorsInterceptor)
@Controller('user/notification')
@UsePipes(ZodValidationPipe)
export class UserNotificationController {
  constructor(private readonly userNotificationService: UserNotificationService) {}

  @Get(':id')
  @UseGuards(AuthGuard)
  async getUserNotification(
    @Req() req: RequestWithAuth,
    @Param() params: { id: string }
  ): Promise<UserNotification> {
    return this.userNotificationService.getUserNotification(req.auth.sub, params.id);
  }

  @Patch('/read')
  @UseGuards(AuthGuard)
  async readNotification(
    @Req() req: RequestWithAuth,
    @Body() body: { notificationId: string }
  ): Promise<void> {
    return this.userNotificationService.readNotification(body.notificationId, req.auth.sub);
  }
}
@ApiTags('USER')
@UseInterceptors(PrivateCorsInterceptor)
@Controller('user/notifications')
@UsePipes(ZodValidationPipe)
export class UserNotificationsController {
  constructor(private readonly userNotificationService: UserNotificationService) {}

  @Get('')
  @UseGuards(AuthGuard)
  async getUserNotifications(
    @Req() req: RequestWithAuth,
    @Query() query: BaseReqQueryDto
  ): Promise<GetUserNotificationsResDto> {
    return this.userNotificationService.getUserNotifications(req.auth.sub, query);
  }

  @Get('/new')
  @UseGuards(AuthGuard)
  async getUserNewNotifications(@Req() req: RequestWithAuth): Promise<boolean> {
    return this.userNotificationService.getUserNewNotifications(req.auth.sub);
  }
}
