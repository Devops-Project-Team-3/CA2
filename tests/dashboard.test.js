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

  // Test exact boundary scores
  test('Exact boundary scores (60% and 80%) allocate correct revision intervals', () => {
    const baselineDate = '2026-07-01';
    
    // Test exact 60% boundary
    const result60 = calculateRevisionDueDate(baselineDate, 60);
    expect(result60.getDate()).toBe(4); // Should fall into 3-day bucket

    // Test exact 80% boundary
    const result80 = calculateRevisionDueDate(baselineDate, 80);
    expect(result80.getDate()).toBe(4); // Or 8 depending on your logic (<= 80 vs > 80)
  });

  test('Handles month roll-over correctly (e.g., July 31st + 1 day)', () => {
    const monthEnd = '2026-07-31';
    const result = calculateRevisionDueDate(monthEnd, 50); // +1 day
    expect(result.getMonth()).toBe(7); // August (0-indexed: July is 6, Aug is 7)
    expect(result.getDate()).toBe(1);  // August 1st
});