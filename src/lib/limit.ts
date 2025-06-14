import path from 'path';

const LIMIT_FILE = path.join(__dirname, '../../db_limit.json');
const LIMIT_PER_MONTH = 5000;

let userLimits: Record<string, { month: string; count: number }> = {};

export function checkAndAddMonthlyLimit(user: string) {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`; // format: 2025-06
  if (!userLimits[user] || userLimits[user].month !== month) {
    userLimits[user] = { month, count: 0 };
  }
  if (userLimits[user].count >= LIMIT_PER_MONTH) {
    return { allowed: false, sisa: 0 };
  }
  userLimits[user].count += 1;
  return { allowed: true, sisa: LIMIT_PER_MONTH - userLimits[user].count };
}