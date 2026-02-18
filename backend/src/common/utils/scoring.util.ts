interface ScoringInput {
  budgetMin?: number;
  budgetMax?: number;
  artistFeeMin?: number;
  artistFeeMax?: number;
  eventType?: string;
  daysUntilEvent?: number;
  expectedAttendance?: number;
  formCompleteness?: number; // 0-1
  isRepeatBooker?: boolean;
}

interface ScoreBreakdown {
  budget: number;
  eventType: number;
  leadTime: number;
  repeatBooker: number;
  attendance: number;
  formCompleteness: number;
  total: number;
}

export function calculateBookingScore(input: ScoringInput): ScoreBreakdown {
  let budget = 0;
  if (input.budgetMax && input.artistFeeMin && input.artistFeeMax) {
    const midBudget = ((input.budgetMin || 0) + input.budgetMax) / 2;
    const midFee = (input.artistFeeMin + input.artistFeeMax) / 2;
    const ratio = midBudget / midFee;
    if (ratio >= 1.2) budget = 30;
    else if (ratio >= 1) budget = 25;
    else if (ratio >= 0.8) budget = 15;
    else if (ratio >= 0.5) budget = 5;
  }

  const eventTypeScores: Record<string, number> = {
    festival: 15,
    club: 12,
    corporate: 10,
    private: 8,
    other: 5,
  };
  const eventType = eventTypeScores[input.eventType || 'other'] || 5;

  let leadTime = 0;
  if (input.daysUntilEvent) {
    if (input.daysUntilEvent > 90) leadTime = 15;
    else if (input.daysUntilEvent > 60) leadTime = 12;
    else if (input.daysUntilEvent > 30) leadTime = 8;
    else if (input.daysUntilEvent > 14) leadTime = 4;
  }

  const repeatBooker = input.isRepeatBooker ? 10 : 0;

  let attendance = 0;
  if (input.expectedAttendance) {
    if (input.expectedAttendance > 10000) attendance = 10;
    else if (input.expectedAttendance > 5000) attendance = 8;
    else if (input.expectedAttendance > 1000) attendance = 6;
    else if (input.expectedAttendance > 500) attendance = 4;
    else attendance = 2;
  }

  const formCompleteness = Math.round((input.formCompleteness || 0) * 10);

  const total = budget + eventType + leadTime + repeatBooker + attendance + formCompleteness;

  return { budget, eventType, leadTime, repeatBooker, attendance, formCompleteness, total };
}
