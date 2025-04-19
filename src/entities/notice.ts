import { z } from 'zod';

export const NoticeCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type NoticeCategory = z.infer<typeof NoticeCategorySchema>;

export const NoticeSchema = z.object({
  id: z.string(),

  title: z.string(),
  content: z.string().nullable(),
  image: z.string().nullable(),

  url: z.string().nullable(),

  metadata: z.record(z.string(), z.any()).nullable(),

  noticeCategory: NoticeCategorySchema,
});
export type Notice = z.infer<typeof NoticeSchema>;
