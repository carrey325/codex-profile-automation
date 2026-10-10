// Entirely synthetic, deterministic data. This never reads a real account.
export function demoUsage() {
  const dailyUsageBuckets = [];
  let longestStreakDays = 0;
  let currentStreakDays = 0;
  for (let i = 0; i < 365; i++) {
    const date = new Date(Date.UTC(2025, 9, 1 + i));
    const noise = ((i * 73 + 19) % 101) / 100;
    const active = i >= 358 || noise > (i < 100 ? 0.55 : 0.22);
    const tokens = active ? Math.round((25000 + noise ** 3 * 1200000) * (0.3 + i / 365)) : 0;
    dailyUsageBuckets.push({ startDate: date.toISOString().slice(0, 10), tokens });
    currentStreakDays = tokens ? currentStreakDays + 1 : 0;
    longestStreakDays = Math.max(longestStreakDays, currentStreakDays);
  }
  return { contractVersion: 1, capturedAt: '2026-09-30T12:00:00.000Z', dailyUsageBuckets,
    summary: {
      lifetimeTokens: dailyUsageBuckets.reduce((sum, bucket) => sum + bucket.tokens, 0),
      peakDailyTokens: Math.max(...dailyUsageBuckets.map(bucket => bucket.tokens)),
      longestRunningTurnSec: 12600, longestStreakDays, currentStreakDays
    }
  };
}
