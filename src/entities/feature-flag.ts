import { z } from 'zod';

export const FeatureFlagSchema = z.object({
  id: z.string(),
  data: z.record(z.string(), z.any()),
});
export type FeatureFlag = z.infer<typeof FeatureFlagSchema>;
