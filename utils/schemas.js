import { z } from 'zod';

export const quizScoreSchema = z.object({
  userId: z.string().uuid(),
  score: z.number().min(0).max(100),
  completedAt: z.string().datetime(),
});