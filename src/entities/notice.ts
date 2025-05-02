import { z } from 'zod';

export const NoticeCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type NoticeCategory = z.infer<typeof NoticeCategorySchema>;

export const NoticeSchema = z.object({
  id: z.string(),

  title: z.string(),

  url: z.string().nullable(),
  content: z.string().nullable(),
  html: z.string().nullable(),
  image: z.string().nullable(),

  metadata: z.record(z.string(), z.any()).nullable(),

  noticeCategory: NoticeCategorySchema.nullable(),

  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Notice = z.infer<typeof NoticeSchema>;

export const NoticeSimpleSchema = z.object({
  id: z.string(),

  title: z.string(),

  url: z.string().nullable(),
  content: z.string().nullable(),
  image: z.string().nullable(),

  noticeCategory: NoticeCategorySchema.nullable(),

  createdAt: z.date(),
  updatedAt: z.date(),
});
export type NoticeSimple = z.infer<typeof NoticeSimpleSchema>;
