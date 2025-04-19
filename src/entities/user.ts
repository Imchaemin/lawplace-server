import { CreditTransactionType } from '@prisma/clients/client';
import { z } from 'zod';

import { CompanySchema } from './company';
import { CreditSchema } from './credit';
import { DecimalSchema } from './decimal';
import { MeetingRoomSimpleSchema } from './meeting-room';
import { UserMembershipSchema } from './membership';
import { NotificationSchema } from './notification';
import { TermsAndConditionsSchema } from './terms-conditions';

export const UserAuthSchema = z
  .object({
    id: z.string(),
    termsAndConditionsAccepted: z.boolean(),
    accessToken: z.string(),
    refreshToken: z.string(),
  })
  .transform(data => ({
    id: data.id,
    termsAndConditionsAccepted: data.termsAndConditionsAccepted,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  }));
export type UserAuth = z.infer<typeof UserAuthSchema>;

export const UserSchema = z
  .object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
    phone: z.string(),
    provider: z.string(),
    termsAndConditionsAccepted: z.boolean(),
    membership: UserMembershipSchema.nullable(),
    company: CompanySchema.nullable(),
    credit: CreditSchema.nullable(),
  })
  .transform(data => ({
    id: data.id,
    email: data.email,
    name: data.name,
    phone: data.phone,
    provider: data.provider,
    termsAndConditionsAccepted: data.termsAndConditionsAccepted,
    membership: data.membership,
    company: data.company,
    credit: data.credit,
  }));
export type User = z.infer<typeof UserSchema>;

export const UserCreditTransactionSchema = z.object({
  id: z.string(),

  credit: CreditSchema,

  name: z.string(),
  description: z.string().nullable(),

  amount: DecimalSchema,
  type: z.nativeEnum(CreditTransactionType),
});
export type UserCreditTransaction = z.infer<typeof UserCreditTransactionSchema>;

export const UserMeetingRoomReservationSchema = z.object({
  id: z.string(),

  startAt: z.date(),
  endAt: z.date(),

  totalCredit: DecimalSchema,
  meetingRoom: MeetingRoomSimpleSchema,
});
export type UserMeetingRoomReservation = z.infer<typeof UserMeetingRoomReservationSchema>;

export const UserTermsAndConditionsAcceptanceSchema = z.object({
  id: z.string(),

  termsAndConditions: TermsAndConditionsSchema,

  accepted: z.boolean(),
  acceptedAt: z.date().nullable(),
});
export type UserTermsAndConditionsAcceptance = z.infer<
  typeof UserTermsAndConditionsAcceptanceSchema
>;

export const UserNotificationSchema = NotificationSchema;
export type UserNotification = z.infer<typeof UserNotificationSchema>;
