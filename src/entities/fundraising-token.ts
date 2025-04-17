import { extendApi } from '@anatine/zod-openapi';
import { z } from 'zod';

import { DecimalSchema } from './decimal';

export const FundraisingTokenSchema = z
  .object({
    address: extendApi(z.string(), {
      description: '토큰 주소',
      example: '0x1234567890123456789012345678901234567890',
    }),
    symbol: extendApi(z.string(), {
      description: '토큰 심볼',
      example: 'XRP',
    }),
    decimals: extendApi(z.number(), {
      description: '토큰 소수점 자리수',
      example: 18,
    }),
    priceUsd: extendApi(DecimalSchema, {
      type: 'string',
      description: '토큰 가격(usd)',
      example: '123.123',
    }),
  })
  .transform(data => ({
    address: data.address,
    symbol: data.symbol,
    decimals: data.decimals,
    priceUsd: data.priceUsd.toString(),
  }));

export type FundraisingToken = z.infer<typeof FundraisingTokenSchema>;
