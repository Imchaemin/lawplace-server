import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export const ReserveMeetingRoomBodySchema = z.object({
  userId: z.string(),
  meetingRoomId: z.string(),
  startAt: z.date(),
  endAt: z.date(),
});
export class ReserveMeetingRoomBodyDto extends createZodDto(ReserveMeetingRoomBodySchema) {}
