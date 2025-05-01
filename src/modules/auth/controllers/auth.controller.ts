import { ZodValidationPipe } from '@anatine/zod-nestjs';
import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PrivateCorsInterceptor } from '@/interceptors/cors.interceptor';

import { RefreshReqBodyDto } from '../dtos/auth.dto';
import { AuthService } from '../services/auth.service';

@ApiTags('AUTH')
@UseInterceptors(PrivateCorsInterceptor)
@Controller('auth')
@UsePipes(ZodValidationPipe)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('refresh-token')
  async refresh(@Body() body: RefreshReqBodyDto) {
    if (!body.refreshToken)
      throw new UnauthorizedException({
        type: 'UNAUTHORIZED',
        message: 'refreshToken is required',
      });
    return this.authService.refreshToken(body.userId, body.refreshToken);
  }
}
