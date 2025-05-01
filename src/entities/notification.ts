import { z } from 'zod';

export const NotificationCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string().nullable(),
});
export type NotificationCategory = z.infer<typeof NotificationCategorySchema>;

export const NotificationSchema = z.object({
  id: z.string(),

  title: z.string(),
  content: z.string().nullable(),
  link: z.string().nullable(),

  metadata: z.record(z.string(), z.any()).nullable(),
  notificationCategory: NotificationCategorySchema,

  createdAt: z.date(),
});
export type Notification = z.infer<typeof NotificationSchema>;
