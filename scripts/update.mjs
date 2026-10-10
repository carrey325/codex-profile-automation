import { parseArgs } from 'node:util';
import { mkdir, readFile, writeFile, rename, rm } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { renderBanner } from '../src/banner.mjs';
import { demoUsage } from '../src/demo.mjs';
import { validateUsage } from '../src/validate.mjs';

async function main() {
  const { values } = parseArgs({ options: {
    demo: { type: 'boolean', default: false }, input: { type: 'string' },
    output: { type: 'string', default: 'output/codex-activity.svg' },
    title: { type: 'string', default: 'Building with AI: Codex activity' },
    timezone: { type: 'string', default: 'UTC' }, help: { type: 'boolean', short: 'h' }
  } });
  if (values.help) {
    console.log('Usage: npm run update -- [--output PATH] [--timezone IANA_ZONE] [--title TEXT]\n' +
      '  --demo          Use synthetic data; no login needed\n' +
      '  --input PATH    Render an aggregate usage JSON file without calling Codex\n' +
      '  --output PATH   SVG destination (default: output/codex-activity.svg)\n' +
      '  --timezone ZONE Date displayed on the banner (default: UTC)\n' +
      '  --title TEXT    Heading, up to 40 characters\n' +
      'Live mode requires a local ChatGPT-backed Codex login. Nothing is uploaded.');
    return;
  }
  if (values.demo && values.input) throw new Error('Choose either --demo or --input.');
  if (!values.title.trim() || values.title.length > 40) throw new Error('Title must contain 1–40 characters.');
  new Intl.DateTimeFormat('en-CA', { timeZone: values.timezone });
  let usage;
  if (values.demo) usage = demoUsage();
  else if (values.input) usage = JSON.parse(await readFile(values.input, 'utf8'));
  else {
    const { readAccountUsage } = await import('codex-usage-analyzer');
    usage = await readAccountUsage({ timeoutMs: 120000 });
  }
  validateUsage(usage);
  const svg = renderBanner(usage, { title: values.title, timeZone: values.timezone });
  const destination = resolve(values.output);
  if (!destination.toLowerCase().endsWith('.svg')) throw new Error('Output must be an .svg file.');
  await mkdir(dirname(destination), { recursive: true });
  const temporary = `${destination}.${process.pid}.tmp`;
  try {
    await writeFile(temporary, svg, { encoding: 'utf8', flag: 'wx' });
    await rename(temporary, destination);
  } finally { await rm(temporary, { force: true }); }
  console.log(`Saved ${values.demo ? 'synthetic demo' : 'activity'} banner to ${destination}`);
  console.log(`Data captured at ${usage.capturedAt}. No Git commit or upload was performed.`);
}

main().catch(error => {
  // Avoid dumping upstream responses or input contents into logs.
  const safe = error instanceof SyntaxError ? 'Invalid JSON or command syntax.' : error.message;
  console.error(`Could not generate banner: ${safe}`);
  process.exitCode = 1;
});
