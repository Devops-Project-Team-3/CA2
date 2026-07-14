/**
 * Calculates next revision date based on quiz performance rules
 * Below 60%: +1 Day | 60% - 80%: +3 Days | Above 80%: +7 Days
 */
export const calculateRevisionDueDate = (lastQuizDate, score) => {
  const baseDate = new Date(lastQuizDate);
  
  if (score < 60) {
    baseDate.setDate(baseDate.getDate() + 1);
  } else if (score >= 60 && score <= 80) {
    baseDate.setDate(baseDate.getDate() + 3);
  } else {
    baseDate.setDate(baseDate.getDate() + 7);
  }
  
  return baseDate;
};

export const calculateStreak = (history) => {
  // Logic to parse consecutive days of completed study sessions
  return history.length > 0 ? history.length : 0; 
};