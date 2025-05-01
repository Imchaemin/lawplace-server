import { ZodValidationPipe } from '@anatine/zod-nestjs';
import { Controller, Get, Req, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RequestWithAuth } from '@/dtos/auth.dto';
import { User } from '@/entities/user';
import { AuthGuard } from '@/guards/auth.guard';
import { PrivateCorsInterceptor } from '@/interceptors/cors.interceptor';

import { UserService } from '../services/user.service';

@ApiTags('USER')
@UseInterceptors(PrivateCorsInterceptor)
@Controller('user')
@UsePipes(ZodValidationPipe)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('')
  @UseGuards(AuthGuard)
  async getUser(@Req() req: RequestWithAuth): Promise<User> {
    const userId = req.auth.sub;
    return this.userService.getUser(userId);
  }
}
