import { z } from 'zod';

import { DecimalSchema } from './decimal';
import { UserSchema } from './user';

export const MeetingRoomSchema = z.object({
  id: z.string(),

  name: z.string(),
  description: z.string().nullable(),
  address: z.string().nullable(),
  facilities: z.array(z.string()),

  active: z.boolean(),

  capacity: z.number(),
  credit: DecimalSchema,

  enablePeakTime: z.boolean(),
  peakTimeCredit: DecimalSchema,
  peakTimeStartAt: z.date().nullable(),
  peakTimeEndAt: z.date().nullable(),

  reservationInterval: z.number(),
});
export type MeetingRoom = z.infer<typeof MeetingRoomSchema>;

export const MeetingRoomSimpleSchema = MeetingRoomSchema.pick({
  id: true,
  name: true,
  address: true,
});
export type MeetingRoomSimple = z.infer<typeof MeetingRoomSimpleSchema>;

export const MeetingRoomReservationSchema = z.object({
  id: z.string(),

  user: UserSchema,

  startAt: z.date(),
  endAt: z.date(),

  totalCredit: DecimalSchema,
  meetingRoom: MeetingRoomSimpleSchema,
});
export type MeetingRoomReservation = z.infer<typeof MeetingRoomReservationSchema>;
