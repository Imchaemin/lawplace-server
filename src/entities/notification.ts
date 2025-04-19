import { z } from 'zod';

export const NotificationSchema = z.object({
  id: z.string(),

  title: z.string(),
  content: z.string().nullable(),
  link: z.string().nullable(),

  metadata: z.record(z.string(), z.any()).nullable(),

  read: z.boolean(),
});
export type Notification = z.infer<typeof NotificationSchema>;
