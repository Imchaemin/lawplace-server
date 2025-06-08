import { ZodValidationPipe } from '@anatine/zod-nestjs';
import { Body, Controller, Post, Req, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RequestWithAuth } from '@/dtos/auth.dto';
import { AuthGuard } from '@/guards/auth.guard';
import { PrivateCorsInterceptor } from '@/interceptors/cors.interceptor';

import { NotificationService } from '../services/notification.service';

@ApiTags('NOTIFICATION')
@UseInterceptors(PrivateCorsInterceptor)
@Controller('notification')
@UsePipes(ZodValidationPipe)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('token')
  @UseGuards(AuthGuard)
  async savePushToken(
    @Req() req: RequestWithAuth,
    @Body() body: { deviceId: string; platform: string; token: string }
  ): Promise<void> {
    return this.notificationService.savePushToken(
      req.auth.sub,
      body.deviceId,
      body.platform,
      body.token
    );
  }
}
