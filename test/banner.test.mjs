import test from 'node:test';
import assert from 'node:assert/strict';
import { buildYearHeatmap, renderBanner } from '../src/banner.mjs';

test('a full rolling year keeps the first and last day, ignores older and future data', () => {
  const map = buildYearHeatmap([
    { startDate: '2025-10-10', tokens: 999 },
    { startDate: '2025-10-11', tokens: 11 },
    { startDate: '2026-10-10', tokens: 22 },
    { startDate: '2026-10-11', tokens: 999 }
  ], '2026-10-10');
  const included = map.cells.filter(cell => cell.inRange);
  assert.equal(included.length, 365);
  assert.equal(included[0].dateIso, '2025-10-11');
  assert.equal(included.at(-1).dateIso, '2026-10-10');
  assert.equal(included.reduce((sum, cell) => sum + cell.tokens, 0), 33);
  assert.equal(included.at(-1).row, 6);
});

test('leap years and Sunday endings retain the complete calendar year', () => {
  const map = buildYearHeatmap([], '2024-03-03');
  const included = map.cells.filter(cell => cell.inRange);
  assert.equal(included.length, 366);
  assert.equal(included[0].dateIso, '2023-03-04');
  assert.equal(included.at(-1).dateIso, '2024-03-03');
});

test('a February 29 capture starts on March 1 of the previous year', () => {
  const included = buildYearHeatmap([], '2024-02-29').cells.filter(cell => cell.inRange);
  assert.equal(included.length, 366);
  assert.equal(included[0].dateIso, '2023-03-01');
  assert.equal(included.at(-1).dateIso, '2024-02-29');
});

test('unavailable usage is not presented as zero and a long task has its own statistic', () => {
  const usage = {
    contractVersion: 1, capturedAt: '2026-10-10T12:00:00.000Z',
    dailyUsageBuckets: null,
    summary: { lifetimeTokens: null, peakDailyTokens: 0, longestRunningTurnSec: 28800,
      longestStreakDays: null, currentStreakDays: 0 }
  };
  const svg = renderBanner(usage);
  assert.match(svg, /Daily activity unavailable/);
  assert.match(svg, /8h/);
  assert.match(svg, /Longest task/);
  assert.match(svg, /—/);
  assert.match(svg, /0 days/);
  assert.doesNotMatch(svg, /NaN|undefined/);
});
