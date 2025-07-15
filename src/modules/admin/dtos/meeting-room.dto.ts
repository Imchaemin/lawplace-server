import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export const CreateMeetingRoomBodySchema = z.object({
  name: z.string(),
  image: z.string(),

  facilities: z.string(),
  capacity: z.string().transform(val => Number(val)),

  peakTimeStartAt: z.string(),
  peakTimeEndAt: z.string(),

  credit: z.string().transform(val => Number(val)),
  peakTimeCredit: z.string().transform(val => Number(val)),
});

export class CreateMeetingRoomBodyDto extends createZodDto(CreateMeetingRoomBodySchema) {}

export const UpdateMeetingRoomBodySchema = z.object({
  name: z.string().optional(),
  image: z.string().optional(),

  facilities: z.string().optional(),
  capacity: z
    .string()
    .transform(val => Number(val))
    .optional(),

  peakTimeStartAt: z.string().optional(),
  peakTimeEndAt: z.string().optional(),

  credit: z
    .string()
    .transform(val => Number(val))
    .optional(),
  peakTimeCredit: z
    .string()
    .transform(val => Number(val))
    .optional(),
});

export class UpdateMeetingRoomBodyDto extends createZodDto(UpdateMeetingRoomBodySchema) {}

export const DeleteMeetingRoomParamsSchema = z.object({
  id: z.string(),
});

export class DeleteMeetingRoomParamsDto extends createZodDto(DeleteMeetingRoomParamsSchema) {}
