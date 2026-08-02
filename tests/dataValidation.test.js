import { quizScoreSchema } from '../utils/schemas.js';

describe('Data Validation Rules', () => {
  test('Rejects invalid quiz scores outside 0-100 range', () => {
    const invalidData = {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      score: 150, // Invalid: score > 100
      completedAt: new Date().toISOString()
    };

    const result = quizScoreSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  test('Validates correct score object successfully', () => {
    const validData = {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      score: 85,
      completedAt: new Date().toISOString()
    };

    const result = quizScoreSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});