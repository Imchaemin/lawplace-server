import { ZodValidationPipe } from '@anatine/zod-nestjs';
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RequestWithAuth } from '@/dtos/auth.dto';
import { AuthGuard } from '@/guards/auth.guard';
import { PrivateCorsInterceptor } from '@/interceptors/cors.interceptor';

import { AdminAuthService } from '../services/admin-auth.service';

@ApiTags('AUTH')
@UseInterceptors(PrivateCorsInterceptor)
@Controller('admin/auth')
@UsePipes(ZodValidationPipe)
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('update-membership')
  @UseGuards(AuthGuard)
  async updateMembership(@Req() req: RequestWithAuth, @Body() body: { hashedKey: string }) {
    if (body.hashedKey !== 'lawplace-admin-update-membership') {
      throw new UnauthorizedException('Invalid hashed key');
    }

    const userAuth = await this.adminAuthService.updateMembership(req.auth.sub);

    return {
      userId: userAuth.id,
      accessToken: userAuth.accessToken,
      refreshToken: userAuth.refreshToken,
      termsAndConditionsAccepted: userAuth.termsAndConditionsAccepted,
    };
  }

  @Get('android-audit-tester')
  async getAndroidAuditTester() {
    const userAuth = await this.adminAuthService.getAndroidAuditTester();
    return userAuth;
  }
}
