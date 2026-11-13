#!/usr/bin/env node
// Tests the pure helpers in js/core.js against the real catalog. No packages: run `node tools/test-app.mjs`.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const core = require(join(root, 'js/core.js'));
const catalog = JSON.parse(readFileSync(join(root, 'data/catalog.json'), 'utf8'));
const { instruments, themes } = catalog;
const bySymbol = Object.fromEntries(instruments.map(item => [item.symbol, item]));
const ctx = { hasTheme: id => themes.some(theme => theme.id === id), hasSymbol: symbol => Boolean(bySymbol[symbol]), currentTheme: 'gold' };

let passed = 0;
const failures = [];
function check(name, fn) {
  try { fn(); passed++; } catch (error) { failures.push(name + '\n  ' + error.message); }
}
function eq(actual, expected, label = '') {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a !== e) throw new Error((label ? label + ': ' : '') + 'expected ' + e + ', got ' + a);
}
const ok = (value, label) => { if (!value) throw new Error(label); };
const search = (query, notes = () => false) => core.searchInstruments(instruments, themes, query, notes).map(item => item.symbol);

check('hash: a state-free hash is ignored', () => {
  eq(core.parseHash('', ctx), null);
  eq(core.parseHash('#start-here', ctx), null);
});
check('hash: theme, ticker, kind, and sim round-trip', () => {
  const parsed = core.parseHash('#theme=gold&kind=fund&ticker=gld&sim=duration', ctx);
  eq([parsed.theme, parsed.kind, parsed.ticker, parsed.sim, parsed.compareMode, parsed.indexMode], ['gold', 'fund', 'GLD', 'duration', false, false]);
  eq(core.buildHash({query: '', theme: 'gold', kind: 'fund', selected: 'GLD', compareMode: false, indexMode: false}, 'duration'), '#theme=gold&kind=fund&ticker=GLD&sim=duration');
});
check('hash: unknown theme, kind, and ticker fall back safely', () => {
  const parsed = core.parseHash('#theme=nope&kind=crypto&ticker=ZZZZ', ctx);
  eq([parsed.theme, parsed.kind, parsed.ticker], ['gold', 'all', null]);
  eq(core.parseHash('#q=copper&theme=nope', {...ctx, currentTheme: 'oil'}).theme, 'oil', 'a search keeps the current theme');
});
check('hash: compare keeps up to 3 known symbols and wins over weights', () => {
  const parsed = core.parseHash('#theme=gold&compare=gld,IAU,zzz,NEM,GDX&weights=AAPL', ctx);
  eq(parsed.comparePicks, ['GLD', 'IAU', 'NEM']);
  eq([parsed.compareMode, parsed.indexMode, parsed.indexPicks], [true, false, null]);
  eq(core.buildHash({query: '', theme: 'gold', kind: 'all', selected: 'GLD', compareMode: true, comparePicks: ['GLD', 'IAU'], indexMode: false}), '#theme=gold&ticker=GLD&compare=GLD,IAU');
});
check('hash: weights list and search query', () => {
  const parsed = core.parseHash('#q=%20copper%20&weights=AAPL,MSFT,AAPL', ctx);
  eq([parsed.query, parsed.indexMode, parsed.indexPicks], ['copper', true, ['AAPL', 'MSFT']]);
  eq(core.buildHash({query: 'copper', theme: 'gold', kind: 'all', selected: null, compareMode: false, indexMode: true, indexPicks: ['AAPL']}), '#q=copper&weights=AAPL');
  eq(core.parseHash('#q=' + 'x'.repeat(300), ctx).query.length, 200, 'query capped at 200');
});
check('search: exact symbol comes first', () => {
  eq(search('gld')[0], 'GLD');
  eq(search('BND')[0], 'BND');
});
check('search: everyday words find the Building blocks', () => {
  const hits = search('index fund');
  ok(['VTI', 'VXUS', 'BND'].every(symbol => hits.slice(0, 8).includes(symbol)), 'index fund → ' + hits.slice(0, 8).join(','));
  ok(hits.indexOf('VTI') < hits.indexOf('CPER') || !hits.includes('CPER'), 'VTI ranks above a fund that only has "Index Fund" in its name');
  ok(search('retirement').includes('AOR'), 'retirement → AOR');
  ok(search('junk bonds').includes('HYG'), 'junk bonds → HYG');
  ok(search('tax free').includes('MUB'), 'tax free → MUB');
  ok(search('60/40')[0] === 'AOR', '60/40 → AOR first');
});
check('search: matches keep the old rules (theme words, ticker text, notes)', () => {
  ok(search('copper').includes('FCX'), 'theme match');
  ok(search('vanguard').includes('VTI'), 'issuer text');
  eq(search('zzzz-nothing'), []);
  eq(search('my secret word', symbol => symbol === 'XOM'), ['XOM'], 'note text');
  ok(core.matchingThemes(themes, 'safe haven').some(theme => theme.id === 'gold'));
});
check('not covered: crypto, leveraged, options, single bonds, accounts', () => {
  eq(core.notCovered('bitcoin').id, 'crypto');
  eq(core.notCovered('ETH etf').id, 'crypto');
  eq(core.notCovered('3x leveraged').id, 'leveraged');
  eq(core.notCovered('TQQQ').id, 'leveraged');
  eq(core.notCovered('covered calls').id, 'options');
  eq(core.notCovered('CDs').id, 'single-bonds');
  eq(core.notCovered('roth ira').id, 'accounts');
  for (const q of ['gold', 'GLD', 'muni bonds', 'high yield', 'bonds', 'ethics', 'treasury bills', 't-bills', '']) eq(core.notCovered(q), null, q);
  for (const entry of core.NOT_COVERED) for (const [, url] of entry.links) ok(url.startsWith('https://'), url);
  for (const entry of core.NOT_COVERED) for (const id of entry.themes || []) ok(ctx.hasTheme(id), 'not-covered theme ' + id);
});
check('backup: merges without duplicates and never deletes', () => {
  const current = {notes: {GLD: [{id: 'a', text: 'mine', at: '2026-01-01T00:00:00Z'}]}, watchlist: ['GLD']};
  const file = JSON.stringify({app: 'market-forces', version: 1, notes: {GLD: [{id: 'a', text: 'mine', at: '2026-01-01T00:00:00Z'}, {id: 'b', text: 'new', at: '2026-02-01T00:00:00Z'}], XOM: [{id: 'c', text: 'oil', at: ''}], bad$: [{id: 'd', text: 'x'}]}, watchlist: ['GLD', 'XOM', 'NOPE']});
  const merged = core.mergeBackup(file, current, ctx.hasSymbol);
  eq([merged.addedNotes, merged.addedSaved], [2, 1]);
  eq(merged.notes.GLD.map(note => note.id), ['b', 'a'], 'newest first');
  eq(merged.watchlist, ['GLD', 'XOM']);
  eq(current.notes.GLD.length, 1, 'input not mutated');
  ok(!merged.notes['bad$'], 'invalid symbol skipped');
});
check('backup: rejects files that are not Market Forces backups', () => {
  for (const [text, message] of [['{', 'not valid JSON'], ['{"app":"other","notes":{}}', 'not a Market Forces backup'], ['{"app":"market-forces"}', 'not a Market Forces backup']]) {
    let error = null;
    try { core.mergeBackup(text, {notes: {}, watchlist: []}, ctx.hasSymbol); } catch (e) { error = e; }
    ok(error && error.message.includes(message), text + ' → ' + (error && error.message));
  }
});
check('freshness: days, stale after 90, oldest date', () => {
  const now = new Date(2026, 10, 13);
  eq(core.daysSince('2026-11-13', now), 0);
  eq(core.daysSince('2026-08-15', now), 90);
  eq(core.isStale('2026-08-15', now), false);
  eq(core.isStale('2026-08-14', now), true);
  eq(core.daysSince('2026-02-30', now), null, 'invalid date');
  eq(core.freshness([{reviewed: '2026-10-09'}, {reviewed: '2026-05-01'}, {}], now), {oldest: '2026-05-01', staleCount: 1, missing: 1});
});
check('catalog: every ticker and theme has a valid reviewed date', () => {
  const bad = [...instruments, ...themes].filter(entry => !core.parseDay(entry.reviewed)).map(entry => entry.symbol || entry.id);
  eq(bad, []);
});
check('titles: one per view', () => {
  eq(core.pageTitle({themeName: 'Gold', ticker: 'GLD', tickerName: 'SPDR Gold Shares'}), 'GLD (SPDR Gold Shares) · Gold · Market Forces');
  eq(core.pageTitle({query: 'copper', ticker: 'FCX'}), 'FCX · Search “copper” · Market Forces');
  eq(core.pageTitle({compare: ['GLD', 'IAU'], themeName: 'Gold'}), 'Compare GLD, IAU · Market Forces');
  eq(core.pageTitle({weights: [], themeName: 'Gold'}), 'Index weights · Market Forces');
  eq(core.pageTitle({sim: 'The bond seesaw', themeName: 'Bond market'}), 'The bond seesaw · Bond market · Market Forces');
});
check('app.js uses js/core.js and index.html loads it before app.js', () => {
  const app = readFileSync(join(root, 'js/app.js'), 'utf8');
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  for (const name of ['parseHash', 'buildHash', 'searchInstruments', 'mergeBackup', 'notCovered', 'pageTitle', 'freshness']) ok(app.includes('CORE.' + name), 'app.js should call CORE.' + name);
  ok(html.indexOf('js/core.js') > -1 && html.indexOf('js/core.js') < html.indexOf("'js/app.js'"), 'core.js loads before app.js');
});

for (const failure of failures) console.error('FAIL ' + failure);
console.log(passed + ' of ' + (passed + failures.length) + ' app checks passed.');
process.exit(failures.length ? 1 : 0);
