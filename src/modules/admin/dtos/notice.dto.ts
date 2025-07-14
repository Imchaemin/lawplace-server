import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export const NoticeParamsSchema = z.object({
  id: z.string(),
});

export class NoticeParamsDto extends createZodDto(NoticeParamsSchema) {}

export const NoticesQuerySchema = z.object({
  skip: z
    .string()
    .transform(val => parseInt(val, 10))
    .optional(),
  take: z
    .string()
    .transform(val => parseInt(val, 10))
    .optional(),
});

export class NoticesQueryDto extends createZodDto(NoticesQuerySchema) {}

export const CreateNoticesBodySchema = z.object({
  title: z.string(),
  content: z.string(),
  image: z.string().optional().nullable(),
});

export class CreateNoticesBodyDto extends createZodDto(CreateNoticesBodySchema) {}
