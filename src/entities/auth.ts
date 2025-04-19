import { extendApi } from '@anatine/zod-openapi';
import { z } from 'zod';

export const AuthTokenSchema = z
  .object({
    accessToken: extendApi(z.string(), {
      description: '액세스 토큰',
      example: '0x1234567890123456789012345678901234567890',
    }),
    refreshToken: extendApi(z.string(), {
      description: '리프레시 토큰',
      example: '0x1234567890123456789012345678901234567890',
    }),
  })
  .transform(data => ({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  }));

export type AuthToken = z.infer<typeof AuthTokenSchema>;
