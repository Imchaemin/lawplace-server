import { ZodValidationPipe } from '@anatine/zod-nestjs';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthGuard } from '@/guards/auth.guard';
import { AdminGuard } from '@/guards/user-role.guard';
import { PrivateCorsInterceptor } from '@/interceptors/cors.interceptor';

import { CreateNoticesBodyDto, NoticeParamsDto, NoticesQueryDto } from '../dtos/notice.dto';
import { AdminNoticeService } from '../services/admin-notice.service';

@ApiTags('ADMIN_NOTICE')
@UseInterceptors(PrivateCorsInterceptor)
@Controller('admin/notices')
@UsePipes(ZodValidationPipe)
export class AdminNoticesController {
  constructor(private readonly noticeService: AdminNoticeService) {}

  @Get('')
  @UseGuards(AuthGuard, AdminGuard)
  async getNotices(@Query() query: NoticesQueryDto) {
    return this.noticeService.getNotices(query.skip, query.take);
  }
}

@ApiTags('ADMIN_NOTICE')
@UseInterceptors(PrivateCorsInterceptor)
@Controller('admin/notice')
@UsePipes(ZodValidationPipe)
export class AdminNoticeController {
  constructor(private readonly noticeService: AdminNoticeService) {}

  @Get(':id')
  @UseGuards(AuthGuard, AdminGuard)
  async getNotice(@Param() params: NoticeParamsDto) {
    return this.noticeService.getNotice(params.id);
  }

  @Post('')
  @UseGuards(AuthGuard, AdminGuard)
  async createNotice(@Body() body: CreateNoticesBodyDto) {
    return this.noticeService.createNotice(body.title, body.image, body.content);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, AdminGuard)
  async editNotice(@Param() params: NoticeParamsDto, @Body() body: CreateNoticesBodyDto) {
    return this.noticeService.editNotice(params.id, body.title, body.image, body.content);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AdminGuard)
  async deleteNotice(@Param() params: NoticeParamsDto) {
    return this.noticeService.deleteNotice(params.id);
  }
}
