import { z } from 'zod';

export const AppConfigSchema = z.object({
  latestVersion: z.string(),
  minSupportedVersion: z.string(),
});
export type AppConfig = z.infer<typeof AppConfigSchema>;
