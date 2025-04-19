import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

// POST refresh
export const RefreshReqBodySchema = z.object({
  userId: z.string(),
  refreshToken: z.string(),
});
export class RefreshReqBodyDto extends createZodDto(RefreshReqBodySchema) {}

export const GeneratedTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});
export class GeneratedTokensDto extends createZodDto(GeneratedTokensSchema) {}
