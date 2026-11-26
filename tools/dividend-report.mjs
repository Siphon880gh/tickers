#!/usr/bin/env node
// Lists missing or stale dividend fields in data/catalog.json. No network, no packages:
// run `node tools/dividend-report.mjs`.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const catalog = JSON.parse(readFileSync(join(root, 'data/catalog.json'), 'utf8'));
const STALE_DAYS = 90;
const isDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value || '') && !Number.isNaN(Date.parse(value + 'T00:00:00Z'));
const ageDays = value => Math.floor((Date.now() - Date.parse(value + 'T00:00:00Z')) / 86400000);

const missing = [];
const unknownPays = [];
const stale = [];
const noSource = [];
const payerNoFreq = [];
const payerNoStreak = [];
const nonPayers = [];
const payers = [];
const weekly = [];

for (const item of catalog.instruments || []) {
  const d = item.dividend;
  const where = item.symbol;
  if (!d) { missing.push(where); continue; }
  if (d.pays === null) unknownPays.push(where);
  if (d.pays === true) payers.push(where);
  if (d.pays === false) nonPayers.push(where);
  if (!Array.isArray(d.sources) || !d.sources.length) noSource.push(where);
  if (!isDate(d.checked) || ageDays(d.checked) > STALE_DAYS) stale.push(where + ' (' + (d.checked || 'no date') + ')');
  if (d.pays === true && d.frequency == null) payerNoFreq.push(where);
  if (d.pays === true && d.frequency === 'weekly') weekly.push(where);
  if (d.pays === true && d.consecutiveYearsRaised == null) payerNoStreak.push(where);
}

const line = (title, list) => {
  console.log(title + ': ' + list.length + (list.length ? '\n  ' + list.join(', ') : ''));
};

console.log('Dividend report for ' + (catalog.instruments || []).length + ' tickers (catalog updated ' + catalog.updated + ').');
line('Missing dividend object', missing);
line('pays is null (unknown)', unknownPays);
line('Checked date missing or older than ' + STALE_DAYS + ' days', stale);
line('No source URL', noSource);
line('Pays, but frequency is unknown', payerNoFreq);
line('Weekly payers (confirm weekly on the issuer page and Stock Analysis; most are option-income funds)', weekly);
line('Pays, but no raise streak is recorded (common for funds)', payerNoStreak);
console.log('Current payers: ' + payers.length + '. Confirmed non-payers: ' + nonPayers.length + '.');
if (!missing.length && !unknownPays.length && !stale.length && !noSource.length) {
  console.log('No missing or stale dividend records. Re-check current figures with the refresh-dividends skill when the checked dates age.');
}
