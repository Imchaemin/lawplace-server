import { ZodValidationPipe } from '@anatine/zod-nestjs';
import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { PrivateCorsInterceptor } from '@/interceptors/cors.interceptor';

import { GeneratedTokensDto, RefreshReqBodyDto, SigninupReqBodyDto } from '../dtos/auth.dto';
import { AuthService } from '../services/auth.service';

@ApiTags('AUTH')
@UseInterceptors(PrivateCorsInterceptor)
@Controller('auth')
@UsePipes(ZodValidationPipe)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signinup')
  @ApiOperation({ summary: '회원가입' })
  @ApiOkResponse({
    description: '유저 토큰 반환',
    type: GeneratedTokensDto,
  })
  async signinup(@Body() body: SigninupReqBodyDto) {
    if (!body.idToken) throw new BadRequestException('idToken is required');
    return this.authService.signinup(body.idToken);
  }

  @Post('refresh-token')
  @ApiOperation({ summary: '토큰 갱신' })
  @ApiOkResponse({
    description: '새로운 토큰 반환',
    type: GeneratedTokensDto,
  })
  async refresh(@Body() body: RefreshReqBodyDto) {
    if (!body.refreshToken) throw new BadRequestException('refreshToken is required');
    return this.authService.refreshToken(body.userId, body.refreshToken);
  }
}
