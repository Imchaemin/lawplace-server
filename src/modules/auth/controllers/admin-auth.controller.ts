import { ZodValidationPipe } from '@anatine/zod-nestjs';
import { Body, Controller, Post, UseInterceptors, UsePipes } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PrivateCorsInterceptor } from '@/interceptors/cors.interceptor';

import { SigninReqBodyDto } from '../dtos/admin-auth.dto';
import { AdminAuthService } from '../services/admin-auth.service';

@ApiTags('AUTH')
@UseInterceptors(PrivateCorsInterceptor)
@Controller('admin/auth')
@UsePipes(ZodValidationPipe)
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('signup')
  async signup(@Body() body: SigninReqBodyDto) {
    const userAuth = await this.adminAuthService.signupAdmin(body);
    const { accessToken, refreshToken } = userAuth;

    return {
      userId: userAuth.id,
      accessToken,
      refreshToken,
      termsAndConditionsAccepted: userAuth.termsAndConditionsAccepted,
    };
  }

  @Post('signin')
  async signin(@Body() body: { email: string }) {
    const userAuth = await this.adminAuthService.signinWithPreset(body.email);
    const { accessToken, refreshToken } = userAuth;

    return {
      userId: userAuth.id,
      accessToken,
      refreshToken,
      termsAndConditionsAccepted: userAuth.termsAndConditionsAccepted,
    };
  }
}
