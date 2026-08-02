import { calculateRevisionDueDate } from '../utils/dashboardEngine';

describe('StudySpark Adaptive Revision Engine Verification Rules', () => {
  
  // Test below 60% score
  test('Score below 60% flags revision schedule for exactly 1 day out', () => {
    const baselineDate = '2026-07-01';
    const result = calculateRevisionDueDate(baselineDate, 55);
    expect(result.getDate()).toBe(2); // July 1st + 1 Day = July 2nd
  });

  // Test between 60% and 80% score
  test('Score between 60% and 80% flags revision schedule for exactly 3 days out', () => {
    const baselineDate = '2026-07-01';
    const result = calculateRevisionDueDate(baselineDate, 72);
    expect(result.getDate()).toBe(4); // July 1st + 3 Days = July 4th
  });

  // Test above 80% score
  test('Score above 80% flags revision schedule for exactly 7 days out', () => {
    const baselineDate = '2026-07-01';
    const result = calculateRevisionDueDate(baselineDate, 90);
    expect(result.getDate()).toBe(8); // July 1st + 7 Days = July 8th
  });
});