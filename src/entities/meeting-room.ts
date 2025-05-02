import { z } from 'zod';

import { DecimalSchema } from './decimal';

export const MeetingRoomReservationSchema = z.object({
  id: z.string(),

  user: z.object({
    id: z.string(),
    name: z.string(),
    companyName: z.string().nullable(),
  }),

  startAt: z.date(),
  endAt: z.date(),
});
export type MeetingRoomReservation = z.infer<typeof MeetingRoomReservationSchema>;

export const MeetingRoomSimpleSchema = z.object({
  id: z.string(),

  name: z.string(),
  description: z.string().nullable(),
  address: z.string().nullable(),
  image: z.string().nullable(),
});
export type MeetingRoomSimple = z.infer<typeof MeetingRoomSimpleSchema>;

export const MeetingRoomSchema = z.object({
  id: z.string(),

  name: z.string(),
  description: z.string().nullable(),
  address: z.string().nullable(),
  image: z.string().nullable(),

  facilities: z.array(z.string()),

  active: z.boolean(),

  capacity: z.number(),
  credit: DecimalSchema,

  enablePeakTime: z.boolean(),
  peakTimeCredit: DecimalSchema.nullable(),
  peakTimeStartAt: z.string().nullable(),
  peakTimeEndAt: z.string().nullable(),

  reservationInterval: z.number(),
  reservations: z.array(MeetingRoomReservationSchema).nullable(),
});
export type MeetingRoom = z.infer<typeof MeetingRoomSchema>;
