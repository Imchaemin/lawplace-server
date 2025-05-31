import { ZodValidationPipe } from '@anatine/zod-nestjs';
import { Controller, Get, Param, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthGuard } from '@/guards/auth.guard';
import { PrivateCorsInterceptor } from '@/interceptors/cors.interceptor';

import { CreditService } from '../services/credit.service';

@ApiTags('CREDIT')
@UseGuards(AuthGuard)
@UseInterceptors(PrivateCorsInterceptor)
@Controller('credit')
@UsePipes(ZodValidationPipe)
export class CreditController {
  constructor(private readonly creditService: CreditService) {}

  @Get(':creditId/transactions')
  @UseGuards(AuthGuard)
  async getTransactions(@Param() params: { creditId: string }) {
    return this.creditService.getCreditTransactions(params.creditId);
  }
}
