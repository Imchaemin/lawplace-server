import { z } from 'zod';

import { UserSchema } from './user';

export const InvitationSchema = z.object({
  id: z.string(),

  inviter: UserSchema,

  visitorName: z.string(),
  visitorEmail: z.string().nullable(),
  visitorPhone: z.string().nullable(),
  visitorCode: z.string().nullable(),

  visitStartAt: z.date(),
  visitEndAt: z.date(),

  purpose: z.string().nullable(),
  message: z.string().nullable(),
});
export type Invitation = z.infer<typeof InvitationSchema>;

export const UserInvitationSchema = z.object({
  id: z.string(),

  visitorName: z.string(),
  visitorEmail: z.string().nullable(),
  visitorPhone: z.string().nullable(),
  visitorCode: z.string().nullable(),

  visitStartAt: z.date(),
  visitEndAt: z.date(),

  purpose: z.string().nullable(),
  message: z.string().nullable(),
});
export type UserInvitation = z.infer<typeof UserInvitationSchema>;
