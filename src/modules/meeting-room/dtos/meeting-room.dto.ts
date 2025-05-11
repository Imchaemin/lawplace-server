import { createZodDto } from '@anatine/zod-nestjs';
import { isAfter } from 'date-fns';
import { z } from 'zod';

export const ReserveMeetingRoomBodySchema = z
  .object({
    meetingRoomId: z.string(),
    startAt: z.preprocess(val => new Date(val as string), z.date()),
    endAt: z.preprocess(val => new Date(val as string), z.date()),
  })
  .refine(data => isAfter(data.endAt, data.startAt), {
    message: 'startAt must be in the future',
  });
export class ReserveMeetingRoomBodyDto extends createZodDto(ReserveMeetingRoomBodySchema) {}

export const GetMeetingRoomsQuerySchema = z.object({
  date: z.preprocess(val => new Date(val as string), z.date()).optional(),
});
export class GetMeetingRoomsQueryDto extends createZodDto(GetMeetingRoomsQuerySchema) {}
