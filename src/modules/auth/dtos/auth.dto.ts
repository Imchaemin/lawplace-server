import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { z } from 'zod';

// POST signup / signin
export const SigninupReqBodySchema = extendApi(
  z.object({
    idToken: extendApi(z.string(), {
      description: 'idToken(idToken으로부터 유저 정보를 추출)',
      example: '1234567890',
    }),
  })
);
export class SigninupReqBodyDto extends createZodDto(SigninupReqBodySchema) {}

// POST refresh
export const RefreshReqBodySchema = extendApi(
  z.object({
    userId: extendApi(z.string(), {
      description: 'userId',
      example: '1234567890',
    }),
    refreshToken: extendApi(z.string(), {
      description: 'refreshToken',
      example: '1234567890',
    }),
  })
);
export class RefreshReqBodyDto extends createZodDto(RefreshReqBodySchema) {}

export const GeneratedTokensSchema = extendApi(
  z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
  })
);
export class GeneratedTokensDto extends createZodDto(GeneratedTokensSchema) {}
