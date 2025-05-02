import { CompanyRole, CreditTransactionType, MembershipRole, UserRole } from '@prisma/client';
import { nativeEnum, z } from 'zod';

import { CompanySchema } from './company';
import { CreditSchema } from './credit';
import { DecimalSchema } from './decimal';
import { MeetingRoomSimpleSchema } from './meeting-room';
import { UserMembershipSchema } from './membership';
import { NotificationCategorySchema } from './notification';
import { TermsAndConditionsSchema } from './terms-conditions';

export const UserAuthSchema = z
  .object({
    id: z.string(),
    accessToken: z.string(),
    refreshToken: z.string(),
  })
  .transform(data => ({
    id: data.id,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  }));
export type UserAuth = z.infer<typeof UserAuthSchema>;

export const UserSchema = z
  .object({
    id: z.string(),
    role: z.nativeEnum(UserRole),
    email: z.string(),
    name: z.string(),
    phone: z.string(),
    provider: z.string(),
    termsAndConditionsAccepted: z.boolean(),
    currentMembership: nativeEnum(MembershipRole),
    membership: UserMembershipSchema.nullable(),
    company: CompanySchema.nullable(),
    companyRole: z.nativeEnum(CompanyRole).nullable(),
    companyEmployeeCount: z.number().nullable(),
    credit: CreditSchema.nullable(),
  })
  .transform(data => ({
    id: data.id,
    role: data.role,
    email: data.email,
    name: data.name,
    phone: data.phone,
    provider: data.provider,
    termsAndConditionsAccepted: data.termsAndConditionsAccepted,
    currentMembership: data.currentMembership,
    membership: data.membership,
    company: data.company,
    companyRole: data.companyRole,
    companyEmployeeCount: data.companyEmployeeCount,
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

export const UserNotificationSchema = z.object({
  id: z.string(),

  title: z.string(),
  content: z.string().nullable(),
  link: z.string().nullable(),
  target: z.string().nullable(),

  metadata: z.record(z.string(), z.any()).nullable(),
  notificationCategory: NotificationCategorySchema,

  createdAt: z.date(),

  read: z.boolean(),
});
export type UserNotification = z.infer<typeof UserNotificationSchema>;
