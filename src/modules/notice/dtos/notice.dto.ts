import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export const NoticeParamsSchema = z.object({
  noticeId: z.string(),
});

export class NoticeParamsDto extends createZodDto(NoticeParamsSchema) {}

export const NoticesQuerySchema = z.object({
  max: z.number().optional().default(3),
});

export class NoticesQueryDto extends createZodDto(NoticesQuerySchema) {}
