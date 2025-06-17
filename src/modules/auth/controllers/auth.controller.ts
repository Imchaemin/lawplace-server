import { ZodValidationPipe } from '@anatine/zod-nestjs';
import {
  Body,
  Controller,
  Delete,
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

  @UseGuards(AuthGuard)
  @Delete('delete')
  async delete(@Req() req: RequestWithAuth) {
    return this.authService.deleteUser(req?.auth?.sub);
  }
}
