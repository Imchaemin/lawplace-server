import { ZodValidationPipe } from '@anatine/zod-nestjs';
import { Controller, Get, Param, Post, Query, UseInterceptors, UsePipes } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Notice, NoticeSimple } from '@/entities/notice';
import { PrivateCorsInterceptor } from '@/interceptors/cors.interceptor';

import { NoticeParamsDto, NoticesQueryDto } from '../dtos/notice.dto';
import { NoticeService } from '../services/notice.service';

@ApiTags('NOTICE')
@UseInterceptors(PrivateCorsInterceptor)
@Controller('notice')
@UsePipes(ZodValidationPipe)
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Get(':noticeId')
  async getNotice(@Param() params: NoticeParamsDto): Promise<Notice> {
    return this.noticeService.getNotice(params.noticeId);
  }

  @Post(':noticeId/propagate')
  async propagateNotice(@Param() params: NoticeParamsDto): Promise<void> {
    return this.noticeService.propagateNotice(params.noticeId);
  }
}

@ApiTags('NOTICE')
@UseInterceptors(PrivateCorsInterceptor)
@Controller('notices')
@UsePipes(ZodValidationPipe)
export class NoticesController {
  constructor(private readonly noticeService: NoticeService) {}

  @Get('')
  async getNotices(@Query() query: NoticesQueryDto): Promise<NoticeSimple[]> {
    return this.noticeService.getNotices(query.max);
  }
}
