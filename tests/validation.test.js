import { z } from 'zod';

// 1. Define the Schema (Expected structure)
const userSubmissionSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  score: z.number().min(0).max(100, 'Score must be between 0 and 100'),
  submittedAt: z.string().datetime({ message: 'Invalid ISO date string' })
});

// 2. Data Validation Test Suite
describe('Data Validation Checks', () => {

  test('Valid payload successfully passes schema validation', () => {
    const validPayload = {
      userId: 'user_788',
      score: 85,
      submittedAt: new Date().toISOString()
    };

    const result = userSubmissionSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  test('Invalid score (> 100) fails schema validation', () => {
    const invalidPayload = {
      userId: 'user_788',
      score: 150, // Invalid: score exceeds 100
      submittedAt: new Date().toISOString()
    };

    const result = userSubmissionSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });

  test('Missing required fields fails schema validation', () => {
    const incompletePayload = {
      score: 75 // Missing userId and submittedAt
    };

    const result = userSubmissionSchema.safeParse(incompletePayload);
    expect(result.success).toBe(false);
  });

});