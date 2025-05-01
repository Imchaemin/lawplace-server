import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { z } from 'zod';

import { PaginateMetadataSchema } from '@/dtos/base.dto';
import { UserNotificationSchema } from '@/entities/user';

export const GetUserNotificationsResSchema = extendApi(
  z.object({
    data: extendApi(z.array(UserNotificationSchema), {
      description: '알림 목록',
    }),
    metadata: extendApi(PaginateMetadataSchema, {
      description: '페이지네이션 메타데이터',
      example: {
        totalCount: 100,
        totalPage: 10,
        cursor: 'cursor',
      },
    }),
  })
);
export class GetUserNotificationsResDto extends createZodDto(GetUserNotificationsResSchema) {}
