import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { z } from 'zod';

import { PaginateMetadataSchema } from '@/dtos/base.dto';
import { UserMeetingRoomReservationSchema } from '@/entities/user';

export const GetUserMeetingRoomReservationsResSchema = extendApi(
  z.object({
    data: extendApi(z.array(UserMeetingRoomReservationSchema), {
      description: '회의실 예약 목록',
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
export class GetUserMeetingRoomReservationsResDto extends createZodDto(
  GetUserMeetingRoomReservationsResSchema
) {}
