#!/usr/bin/env node
// Checks data/catalog.json and data/index-weights.json. No packages needed: run `node tools/check-catalog.mjs`.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warnings = [];
const fail = message => errors.push(message);
const warn = message => warnings.push(message);

function read(path) {
  try { return JSON.parse(readFileSync(join(root, path), 'utf8')); }
  catch (error) { fail(path + ' did not parse: ' + error.message); return null; }
}

const GROUPS = ['Assets', 'Industries', 'Markets', 'Economic forces'];
const CATEGORIES = ['Size', 'Region', 'Style', 'Asset class'];
const isText = value => typeof value === 'string' && value.trim().length > 0;
const isHttps = value => { try { return new URL(value).protocol === 'https:'; } catch { return false; } };

const catalog = read('data/catalog.json');
if (catalog) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(catalog.updated || '')) fail('catalog.updated should be YYYY-MM-DD.');
  const instruments = Array.isArray(catalog.instruments) ? catalog.instruments : (fail('catalog.instruments is not a list.'), []);
  const themes = Array.isArray(catalog.themes) ? catalog.themes : (fail('catalog.themes is not a list.'), []);
  const symbols = new Set();
  instruments.forEach((item, i) => {
    const where = 'instrument ' + (item?.symbol || '#' + i);
    for (const field of ['symbol', 'name', 'kind', 'exposure', 'description']) if (!isText(item?.[field])) fail(where + ' is missing ' + field + '.');
    if (item?.symbol && item.symbol !== item.symbol.toUpperCase()) fail(where + ' symbol should be upper case.');
    if (symbols.has(item?.symbol)) fail(where + ' is listed more than once.');
    symbols.add(item?.symbol);
    if (item?.kind && !['stock', 'fund'].includes(item.kind)) fail(where + ' kind should be stock or fund, not ' + item.kind + '.');
    if (item?.kind === 'fund' && !isText(item.issuer)) fail(where + ' is a fund without an issuer.');
    if (item?.official && !isHttps(item.official)) fail(where + ' official link is not https: ' + item.official);
  });
  const themeIds = new Set();
  const listed = new Set();
  themes.forEach((theme, i) => {
    const where = 'theme ' + (theme?.id || '#' + i);
    for (const field of ['id', 'name', 'mark', 'group', 'description', 'connection']) if (!isText(theme?.[field])) fail(where + ' is missing ' + field + '.');
    if (typeof theme?.tags !== 'string') fail(where + ' tags should be a string.');
    if (themeIds.has(theme?.id)) fail(where + ' id is used more than once.');
    themeIds.add(theme?.id);
    if (theme?.id === 'all' || theme?.id === 'saved') fail(where + ' id is reserved by the page.');
    if (!GROUPS.includes(theme?.group)) fail(where + ' group should be one of ' + GROUPS.join(', ') + '.');
    if (theme?.group === 'Markets' && !CATEGORIES.includes(theme.category)) fail(where + ' is a Markets theme without a category of ' + CATEGORIES.join(', ') + '.');
    if (theme?.group !== 'Markets' && theme?.category) fail(where + ' has a category but is not in Markets.');
    if (!Array.isArray(theme?.symbols) || !theme.symbols.length) fail(where + ' has no symbols.');
    else {
      if (new Set(theme.symbols).size !== theme.symbols.length) fail(where + ' lists a symbol twice.');
      for (const symbol of theme.symbols) { listed.add(symbol); if (!symbols.has(symbol)) fail(where + ' lists ' + symbol + ', which is not in instruments.'); }
    }
    if (!Array.isArray(theme?.links)) fail(where + ' links should be a list.');
    else theme.links.forEach(entry => {
      if (!Array.isArray(entry) || entry.length !== 2 || !isText(entry[0])) fail(where + ' has a link that is not [title, url].');
      else if (!isHttps(entry[1])) fail(where + ' link "' + entry[0] + '" is not https: ' + entry[1]);
    });
  });
  // Themes in a group should sit together, or the sidebar repeats a group heading.
  const order = themes.map(theme => theme.group);
  const seen = new Set();
  order.forEach((group, i) => { if (i && group !== order[i - 1] && seen.has(group)) fail('Themes in ' + group + ' are not next to each other; the sidebar would show that heading twice.'); seen.add(group); });
  for (const symbol of symbols) if (!listed.has(symbol)) warn(symbol + ' is in instruments but no theme lists it.');

  const weights = read('data/index-weights.json');
  if (weights) {
    for (const index of weights.indices || []) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(index.snapshotDate || '')) fail('index ' + index.id + ' snapshotDate should be YYYY-MM-DD.');
      if (!isHttps(index.sourceUrl)) fail('index ' + index.id + ' sourceUrl is not https.');
      for (const symbol of Object.keys(index.weights || {})) if (!symbols.has(symbol)) warn('index ' + index.id + ' has a weight for ' + symbol + ', which is not in the catalog.');
    }
  }
  if (!errors.length) console.log('Catalog OK: ' + instruments.length + ' instruments, ' + themes.length + ' themes, updated ' + catalog.updated + '.');
}
for (const message of warnings) console.warn('warning: ' + message);
for (const message of errors) console.error('error: ' + message);
process.exit(errors.length ? 1 : 0);
