export function validateUsage(usage) {
  if (!usage || typeof usage.capturedAt !== 'string' || !Number.isFinite(Date.parse(usage.capturedAt))) {
    throw new Error('Usage data must include a valid capturedAt timestamp.');
  }
  if (!usage.summary || typeof usage.summary !== 'object') throw new Error('Usage summary is missing.');
  for (const key of ['lifetimeTokens', 'peakDailyTokens', 'longestRunningTurnSec', 'longestStreakDays', 'currentStreakDays']) {
    const value = usage.summary[key];
    if (value != null && (!Number.isFinite(value) || value < 0)) throw new Error(`Invalid summary field: ${key}`);
  }
  if (usage.dailyUsageBuckets === null) return usage;
  if (!Array.isArray(usage.dailyUsageBuckets)) throw new Error('Daily buckets must be an array or null.');
  const seen = new Set();
  for (const bucket of usage.dailyUsageBuckets) {
    const day = bucket?.startDate;
    if (typeof day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(day) ||
      !Number.isFinite(Date.parse(day)) || new Date(day).toISOString().slice(0, 10) !== day ||
      !Number.isFinite(bucket.tokens) || bucket.tokens < 0 || seen.has(day)) {
      throw new Error('Daily buckets contain an invalid or duplicate date or token value.');
    }
    seen.add(day);
  }
  return usage;
}
