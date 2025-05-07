import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { Request } from 'express';
import { z } from 'zod';

export const PaginateSchema = extendApi(
  z.string().transform(val => {
    const [_cursor, _take, _skip] = val.split(':');
    const cursor = _cursor && _cursor !== 'undefined' ? _cursor : undefined;
    const take = _take && _take !== 'undefined' ? _take : undefined;
    const skip = _skip && _skip !== 'undefined' ? _skip : undefined;
    return {
      cursor,
      take: take ? Number(take) : undefined,
      skip: skip ? Number(skip) : cursor ? 1 : undefined,
    };
  }),
  {
    description: '페이지네이션 쿼리. cursor:take:skip 형식',
    examples: [
      '(cursor가 지갑주소, take가 10) - 0x1234567890123456789012345678901234567890:10',
      '(cursor가 지갑주소, take가 10, skip이 0) - 0x1234567890123456789012345678901234567890:10:0',
    ],
  }
);
export class PaginateDto extends createZodDto(PaginateSchema) {}

export const SortSchema = extendApi(
  z
    .string()
    .regex(/^.+:(asc|desc)$/i, 'Format must be orderBy:order')
    .transform(val => {
      const [orderBy, order] = val.split(':');
      return {
        orderBy,
        order: order.toLowerCase() as 'asc' | 'desc',
      };
    }),
  {
    description: '정렬 쿼리. orderBy:order 형식',
    examples: ['address:asc', 'address:desc', 'createdAt:asc', 'createdAt:desc'],
  }
);
export class SortDto extends createZodDto(SortSchema) {}

export const FilterRuleEnum = z.enum([
  'equals',
  'not',
  'lt',
  'lte',
  'gt',
  'gte',
  'in',
  'notIn',
  'contains',
  'startsWith',
  'endsWith',
]);
export type FilterRule = z.infer<typeof FilterRuleEnum>;

const filterValueParser = (value: string, type: string): any => {
  if (value.includes(',')) {
    const parts = value.split(',').map(v => v.trim());
    const parsed = parts.map(p => {
      if (type === 'number') return Number(p);
      if (type === 'string') return p;
      if (type === 'boolean') return p.toLowerCase() === 'true';
      return p;
    });

    const allNumbers = parsed.every(v => typeof v === 'number');
    const allStrings = parsed.every(v => typeof v === 'string');

    if (allNumbers) return parsed as number[];
    if (allStrings) return parsed as string[];
    throw new Error('Filter value array must be all numbers or all strings');
  }

  if (type === 'number') return Number(value);
  if (type === 'string') return value;
  if (type === 'boolean') return value.toLowerCase() === 'true';
  return value;
};

export const FilterSchema = extendApi(
  z
    .string()
    .regex(
      /^(.+:\w+:\w+:\w+)(,.+:\w+:\w+:\w+)*$/,
      'Format must be property:rule:value:type or property:rule:value:type,property2:rule2:value2:type,...'
    )
    .transform(val => {
      const filters = val.includes(',') ? val.split(',').map(f => f.trim()) : [val];

      return filters.map(f => {
        const [property, ruleRaw, valueStr, type] = f.split(':');
        const value = filterValueParser(valueStr, type);

        const ruleParse = FilterRuleEnum.safeParse(ruleRaw);
        if (!ruleParse.success) {
          throw new Error(`Invalid rule: ${ruleRaw}`);
        }

        return {
          property,
          rule: ruleParse.data,
          value,
        };
      });
    }) as unknown as z.ZodType<
    {
      property: string;
      rule: FilterRule;
      value: any;
    }[],
    any,
    unknown
  >,
  {
    description:
      '필터 쿼리. filters=property:rule:value:type 형식. 여러 개 가능 (e.g. filters=name:eq:hello:string&filters=age:gte:30:number)',
    properties: {
      rule: {
        description: '규칙',
        enum: FilterRuleEnum.options,
      },
      type: {
        description: '타입',
        enum: ['string', 'number', 'boolean'],
      },
    },
    example: 'name:eq:hello:string&age:gte:30:number',
  }
);
export class FilterDto extends createZodDto(FilterSchema) {}

export const BaseQuerySchema = z.object({
  paginate: PaginateSchema.optional(),
  sort: SortSchema.optional(),
  filters: FilterSchema.optional(),
});
export class BaseReqQueryDto extends createZodDto(BaseQuerySchema) {}

export const PaginateMetadataSchema = extendApi(
  z.object({
    totalCount: extendApi(z.number(), {
      description: '총 아이템 수',
    }),
    totalPage: extendApi(z.number(), {
      description: '총 페이지 수',
    }),
    cursor: extendApi(z.string().optional(), {
      description: '커서. 다음 페이지가 없는경우 undefined',
      examples: ['0x1234567890123456789012345678901234567890', undefined],
    }),
  }),
  {
    description: '페이지네이션 메타데이터',
  }
);
export type PaginateMetadata = z.infer<typeof PaginateMetadataSchema>;
export class PaginateMetadataDto extends createZodDto(PaginateMetadataSchema) {}

export type ReqWithAuth = Request & {
  auth?: Auth;
};

export type Auth = {
  userId: string;
};
