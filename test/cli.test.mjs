import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { demoUsage } from '../src/demo.mjs';
import { validateUsage } from '../src/validate.mjs';
import { renderBanner } from '../src/banner.mjs';

const cli = fileURLToPath(new URL('../scripts/update.mjs', import.meta.url));

test('demo CLI works offline, creates nested output, escapes title and can replace the SVG', () => {
  const dir = mkdtempSync(join(tmpdir(), 'codex-banner-test-'));
  try {
    const output = join(dir, 'profile', 'assets', 'banner.svg');
    const args = [cli, '--demo', '--output', output, '--title', 'AI <demo> & activity'];
    execFileSync(process.execPath, args);
    const svg = readFileSync(output, 'utf8');
    assert.match(svg, /AI &lt;demo&gt; &amp; activity/);
    assert.match(svg, /viewBox="0 0 1200 366"/);
    execFileSync(process.execPath, args);
    assert.equal(readFileSync(output, 'utf8'), svg);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('invalid input preserves the last published banner', () => {
  const dir = mkdtempSync(join(tmpdir(), 'codex-banner-test-'));
  try {
    const output = join(dir, 'banner.svg');
    const input = join(dir, 'usage.json');
    writeFileSync(output, 'previous good banner');
    writeFileSync(input, JSON.stringify({ capturedAt: 'invalid' }));
    const result = spawnSync(process.execPath, [cli, '--input', input, '--output', output]);
    assert.equal(result.status, 1);
    assert.equal(readFileSync(output, 'utf8'), 'previous good banner');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('timezone changes the end date without rebucketing source days', () => {
  const usage = demoUsage();
  usage.capturedAt = '2026-10-01T01:00:00Z';
  const utc = renderBanner(usage);
  const ny = renderBanner(usage, { timeZone: 'America/New_York' });
  assert.match(utc, /2025-10-02 — 2026-10-01/);
  assert.match(ny, /2025-10-01 — 2026-09-30/);
});

test('input validation rejects impossible dates, duplicate days and invalid metrics', () => {
  for (const buckets of [[{ startDate: '2026-02-30', tokens: 1 }],
    [{ startDate: '2026-01-01', tokens: -1 }],
    [{ startDate: '2026-01-01', tokens: 1 }, { startDate: '2026-01-01', tokens: 2 }]]) {
    assert.throws(() => validateUsage({ ...demoUsage(), dailyUsageBuckets: buckets }));
  }
  const usage = demoUsage();
  usage.summary.lifetimeTokens = -1;
  assert.throws(() => validateUsage(usage));
});
