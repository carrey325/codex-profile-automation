// Calendar layout and heat levels adapted from postmelee/codex-usage-profile
// src/profile-card/heatmap.js, commit 6d3e600d2d33bb7a50147075d013ddd9b945d0b1.
// Copyright (c) 2026 postmelee. MIT; see ../LICENSE.upstream.
// Custom layout: complete rolling year, light full-width SVG, five metrics.

const DAY = 86400000;
const COLORS = ['#f1f2f3', '#cbe5ff', '#69b4ff', '#1687ee', '#0959a6'];
const WIDTH = 1200;
const HEIGHT = 366;
const PADDING = 28;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const date = value => new Date(`${value}T00:00:00.000Z`);
const iso = value => value.toISOString().slice(0, 10);
const addDays = (value, days) => iso(new Date(date(value).getTime() + days * DAY));

export function buildYearHeatmap(buckets, todayIso) {
  const end = date(todayIso);
  if (Number.isNaN(end.getTime())) throw new TypeError('Invalid end date');
  // Clamp Feb 29's previous-year anniversary to Feb 28, not March 1.
  const priorYear = new Date(end);
  priorYear.setUTCFullYear(priorYear.getUTCFullYear() - 1);
  if (priorYear.getUTCMonth() !== end.getUTCMonth()) priorYear.setUTCDate(0);
  const startDateIso = addDays(iso(priorYear), 1);
  const gridStart = addDays(startDateIso, -date(startDateIso).getUTCDay());
  const columnCount = Math.floor((end - date(gridStart)) / DAY / 7) + 1;
  const usageByDate = new Map((buckets ?? []).map(bucket => [bucket.startDate, bucket.tokens]));
  const cells = Array.from({ length: columnCount * 7 }, (_, index) => {
    const dateIso = addDays(gridStart, index);
    const inRange = dateIso >= startDateIso && dateIso <= todayIso;
    return { dateIso, inRange, column: Math.floor(index / 7), row: index % 7,
      tokens: inRange ? usageByDate.get(dateIso) ?? 0 : 0 };
  });
  const maxTokens = Math.max(1, ...cells.map(cell => cell.tokens));
  return { columnCount, startDateIso, todayIso, cells: cells.map(cell => ({
    ...cell, color: COLORS[heatLevel(cell.tokens, maxTokens)]
  })) };
}

function heatLevel(value, maxValue) {
  if (value <= 0 || maxValue <= 0) return 0;
  const ratio = value / maxValue;
  if (ratio >= 0.75) return 4;
  if (ratio >= 0.45) return 3;
  if (ratio >= 0.2) return 2;
  return 1;
}

const xml = value => String(value).replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'
}[c]));
const numeric = value => value !== null && Number.isFinite(value);
const decimal = value => new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value);
function tokens(value) {
  if (!numeric(value)) return '—';
  for (const [threshold, unit] of [[1e9, 'B'], [1e6, 'M'], [1e3, 'K']]) {
    if (value >= threshold) return `${decimal(value / threshold)}${unit}`;
  }
  return decimal(value);
}
function duration(seconds) {
  if (!numeric(seconds)) return '—';
  if (seconds >= 3600) return `${decimal(seconds / 3600)}h`;
  if (seconds >= 60) return `${Math.floor(seconds / 60)}m`;
  return `${seconds}s`;
}
const streak = value => numeric(value) ? `${value} ${value === 1 ? 'day' : 'days'}` : '—';
const text = (x, y, content, attrs = '') => `<text x="${x}" y="${y}" ${attrs}>${xml(content)}</text>`;

export function renderBanner(document, { title = 'Building with AI: Codex activity', timeZone = 'UTC' } = {}) {
  const todayIso = new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(new Date(document.capturedAt));
  const map = buildYearHeatmap(document.dailyUsageBuckets, todayIso);
  const stats = [
    ['Lifetime tokens', tokens(document.summary.lifetimeTokens)],
    ['Peak daily tokens', tokens(document.summary.peakDailyTokens)],
    ['Longest task', duration(document.summary.longestRunningTurnSec)],
    ['Longest streak', streak(document.summary.longestStreakDays)],
    ['Current streak', streak(document.summary.currentStreakDays)]
  ];
  const body = [];
  body.push('<rect width="1200" height="366" rx="16" fill="#ffffff"/>');
  body.push(text(PADDING, 38, title, 'font-size="23" font-weight="600"'));
  body.push(text(WIDTH - PADDING, 38, `${map.startDateIso} — ${todayIso}`, 'text-anchor="end" font-size="15" fill="#7b8087"'));
  const step = (WIDTH - PADDING * 2 + 4) / map.columnCount;
  const cellSize = step - 4;
  const gridY = 66;
  if (document.dailyUsageBuckets === null) {
    body.push(text(WIDTH / 2, 155, 'Daily activity unavailable', 'text-anchor="middle" font-size="18" fill="#7b8087"'));
  } else {
    for (const cell of map.cells) {
      if (!cell.inRange) continue;
      body.push(`<rect x="${(PADDING + cell.column * step).toFixed(2)}" y="${(gridY + cell.row * step).toFixed(2)}" width="${cellSize.toFixed(2)}" height="${cellSize.toFixed(2)}" rx="4" fill="${cell.color}"><title>${cell.dateIso}: ${cell.tokens.toLocaleString('en-US')} tokens</title></rect>`);
    }
    let lastLabelX = -100;
    for (const cell of map.cells) {
      if (!cell.inRange || !cell.dateIso.endsWith('-01')) continue;
      const x = PADDING + cell.column * step;
      if (x < lastLabelX + 50 || x > WIDTH - PADDING - 28) continue;
      body.push(text(x, 243, MONTHS[date(cell.dateIso).getUTCMonth()], 'font-size="15" fill="#858990"'));
      lastLabelX = x;
    }
  }
  const barY = 270;
  const barWidth = WIDTH - 2 * PADDING;
  body.push(`<rect x="${PADDING}" y="${barY}" width="${barWidth}" height="80" rx="14" fill="#ffffff" stroke="#e5e7eb"/>`);
  stats.forEach(([label, value], index) => {
    const centerX = PADDING + (index + 0.5) * barWidth / stats.length;
    if (index) {
      const dividerX = PADDING + index * barWidth / stats.length;
      body.push(`<path d="M${dividerX} ${barY + 18}v44" stroke="#e5e7eb"/>`);
    }
    body.push(text(centerX, barY + 32, value, 'text-anchor="middle" font-size="24" font-weight="500"'));
    body.push(text(centerX, barY + 58, label, 'text-anchor="middle" font-size="15" fill="#73777f"'));
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-labelledby="title desc">
<title id="title">${xml(title)} over the last year</title>
<desc id="desc">${xml(stats.map(([key, value]) => `${key}: ${value}`).join('; '))}. Updated ${xml(document.capturedAt)}.</desc>
<g font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif" fill="#202428">${body.join('\n')}</g>
</svg>\n`;
}
