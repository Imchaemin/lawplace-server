import { extendApi } from '@anatine/zod-openapi';
import { z } from 'zod';

import { AuthTokenSchema } from './auth';

export const UserBaseSchema = z
  .object({
    id: extendApi(z.string(), {
      description: '유저 아이디',
      example: '0x1234567890123456789012345678901234567890',
    }),
    email: extendApi(z.string(), {
      description: '이메일',
      example: 'test@test.com',
    }),
    name: extendApi(z.string(), {
      description: '이름',
      example: '홍길동',
    }),
    phone: extendApi(z.string(), {
      description: '전화번호',
      example: '01012345678',
    }),
    provider: extendApi(z.string(), {
      description: '프로바이더',
      example: 'google',
    }),
    termsAndConditionsAcceptance: extendApi(z.boolean(), {
      description: '약관 동의 여부',
      example: true,
    }),
    tokens: extendApi(AuthTokenSchema, {
      description: '토큰',
      example: {
        accessToken: '0x1234567890123456789012345678901234567890',
        refreshToken: '0x1234567890123456789012345678901234567890',
      },
    }),
  })
  .transform(data => ({
    id: data.id,
    email: data.email,
    name: data.name,
    phone: data.phone,
    provider: data.provider,
    termsAndConditionsAcceptance: data.termsAndConditionsAcceptance,
    tokens: data.tokens,
  }));

export type UserBase = z.infer<typeof UserBaseSchema>;
