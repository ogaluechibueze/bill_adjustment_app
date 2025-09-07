
export function getMonthRange(start: Date, end: Date): { month: number; year: number }[] {
  const result: { month: number; year: number }[] = [];
  const current = new Date(start.getFullYear(), start.getMonth(), 1);

  while (current <= end) {
    result.push({
      month: current.getMonth() + 1,
      year: current.getFullYear(),
    });
    current.setMonth(current.getMonth() + 1);
  }

  return result;
}
