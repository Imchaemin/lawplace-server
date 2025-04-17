import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { FilterRule, FilterSchema, PaginateSchema, SortSchema } from '@/dtos/base.dto';

type QueryParams = {
  paginate?: {
    cursor: string;
    take: number;
    skip: number;
  };
  sort?: {
    orderBy: string;
    order: 'asc' | 'desc';
  };
  filters?: Array<{
    property: string;
    rule: FilterRule;
    value: string | number | string[] | number[];
  }>;
};

export const BaseQuery = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): QueryParams => {
    const req = ctx.switchToHttp().getRequest();
    const { paginate, sort, filter } = req.query;

    let parsedPaginate;
    if (paginate) {
      parsedPaginate = PaginateSchema.safeParse(paginate);
      if (!parsedPaginate.success) throw new Error('Invalid paginate format');
    }

    let parsedSort;
    if (sort) {
      parsedSort = SortSchema.safeParse(sort);
      if (!parsedSort.success) throw new Error('Invalid sort format');
    }

    const parsedFilters: QueryParams['filters'] = [];
    if (filter) {
      const filters = Array.isArray(filter) ? filter : [filter];
      for (const f of filters) {
        const result = FilterSchema.safeParse(f);
        if (result.success) {
          parsedFilters.push(...(result.data as any));
        } else {
          throw new Error('Invalid filter format');
        }
      }
    }

    return {
      paginate: parsedPaginate?.data,
      sort: parsedSort?.data,
      filters: parsedFilters,
    };
  }
);
