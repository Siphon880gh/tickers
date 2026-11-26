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
  eq(core.parseHash('#dividend-screeners', ctx), null);
});
check('hash: theme, ticker, kind, and sim round-trip', () => {
  const parsed = core.parseHash('#theme=gold&kind=fund&ticker=gld&sim=duration', ctx);
  eq([parsed.theme, parsed.kind, parsed.ticker, parsed.sim, parsed.compareMode, parsed.indexMode, parsed.divPays], ['gold', 'fund', 'GLD', 'duration', false, false, false]);
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
check('hash: dividend filters round-trip and freq/streak imply pays', () => {
  const parsed = core.parseHash('#theme=all&div=1&freq=monthly&streak=10', ctx);
  eq([parsed.divPays, parsed.divFrequency, parsed.divStreak, parsed.theme], [true, 'monthly', 10, 'all']);
  eq(core.buildHash({query: '', theme: 'all', kind: 'all', selected: null, compareMode: false, indexMode: false, divPays: true, divFrequency: 'monthly', divStreak: 10}), '#theme=all&div=1&freq=monthly&streak=10');
  eq(core.parseHash('#theme=gold&freq=quarterly', ctx).divPays, true, 'freq alone turns the filter on');
  eq(core.parseHash('#theme=gold&streak=any', ctx).divStreak, 1);
  eq(core.parseHash('#theme=gold&freq=daily&streak=3', ctx).divPays, false, 'unknown freq/streak ignored');
  const weekly = core.parseHash('#theme=all&freq=weekly', ctx);
  eq([weekly.divPays, weekly.divFrequency], [true, 'weekly'], 'freq=weekly is a known frequency and turns the filter on');
  eq(core.buildHash({query: '', theme: 'all', kind: 'all', selected: null, compareMode: false, indexMode: false, divPays: true, divFrequency: 'weekly', divStreak: null}), '#theme=all&div=1&freq=weekly');
  ok(core.DIV_FREQUENCIES.includes('weekly'));
  eq(core.parseHash('#theme=gold&div=1', ctx).divFrequency, null);
  eq(core.buildHash({query: '', theme: 'gold', kind: 'all', selected: 'GDX', compareMode: false, indexMode: false, divPays: false, divFrequency: 'monthly', divStreak: 10}), '#theme=gold&ticker=GDX', 'unchecked drops freq/streak from the hash');
});
check('dividend filter: pays, frequency, and raise streak', () => {
  const pg = instruments.find(item => item.symbol === 'PG');
  const gld = instruments.find(item => item.symbol === 'GLD');
  const bnd = instruments.find(item => item.symbol === 'BND');
  const ura = instruments.find(item => item.symbol === 'URA');
  ok(pg && pg.dividend && pg.dividend.pays === true && pg.dividend.frequency === 'quarterly' && pg.dividend.consecutiveYearsRaised >= 25, 'PG dividend record');
  ok(gld && gld.dividend && gld.dividend.pays === false, 'GLD does not pay');
  eq(core.dividendMatches(pg, {divPays: false}), true);
  eq(core.dividendMatches(gld, {divPays: true}), false);
  eq(core.dividendMatches(pg, {divPays: true}), true);
  eq(core.dividendMatches(pg, {divPays: true, divFrequency: 'monthly'}), false);
  eq(core.dividendMatches(pg, {divPays: true, divFrequency: 'quarterly', divStreak: 25}), true);
  eq(core.dividendMatches(pg, {divPays: true, divStreak: 1}), true);
  ok(bnd && bnd.dividend && bnd.dividend.pays === true && bnd.dividend.frequency === 'monthly', 'BND monthly');
  eq(core.dividendMatches(bnd, {divPays: true, divFrequency: 'monthly'}), true);
  const weeklyFunds = instruments.filter(item => item.dividend && item.dividend.frequency === 'weekly').map(item => item.symbol);
  eq(weeklyFunds.sort(), ['QDTE', 'RDTE', 'ULTY', 'XDTE', 'YMAG', 'YMAX']);
  const xdte = instruments.find(item => item.symbol === 'XDTE');
  eq(core.dividendMatches(xdte, {divPays: true, divFrequency: 'weekly'}), true);
  eq(core.dividendMatches(bnd, {divPays: true, divFrequency: 'weekly'}), false);
  eq(core.dividendBadge(xdte.dividend).text.startsWith('Weekly'), true, 'weekly badge');
  eq(core.dividendMatches(bnd, {divPays: true, divStreak: 5}), false, 'null streak fails a 5+ filter');
  ok(ura && ura.dividend && ura.dividend.pays === true && ura.dividend.frequency === null, 'URA pays with unknown frequency');
  eq(core.dividendMatches(ura, {divPays: true, divFrequency: 'annual'}), false);
  const badge = core.dividendBadge(pg.dividend);
  ok(badge && badge.pays && /Quarterly/.test(badge.text) && /70 yr/.test(badge.text), badge && badge.text);
  eq(core.dividendBadge(gld.dividend).text, 'No dividend');
  eq(core.dividendBadge(null), null);
});
check('resource hint: dividend screener phrases point at the guide section', () => {
  for (const q of ['dividend screener', 'dividend screeners', 'monthly dividend', 'monthly dividends', 'dividend aristocrats', 'Dividend Aristocrat', 'dividend champions', 'ccc list']) {
    const hit = core.resourceHint(q);
    eq(hit && hit.id, 'dividend-screeners', q);
    eq(hit.href, '#dividend-screeners', q + ' href');
  }
  for (const q of ['dividend', 'dividends', 'gold', 'GLD', 'screener', '']) eq(core.resourceHint(q), null, q);
  for (const q of ['weekly dividend', 'weekly dividends', 'weekly pay', 'weekly payers', 'Weekly Payer', 'option income', 'covered call', 'covered calls', '0dte']) {
    const hit = core.resourceHint(q);
    eq(hit && hit.id, 'weekly-payers', q);
    eq(hit.href, '#dividend-screeners', q + ' href');
  }
  eq(core.RESOURCE_HINTS[0].href, '#dividend-screeners');
});
check('search words find the option-income theme and its funds', () => {
  for (const q of ['weekly dividend', 'weekly pay', 'weekly payers', 'option income', 'covered call', 'covered calls', 'weekly income', '0dte']) {
    eq(core.matchingThemes(themes, q).map(theme => theme.id).includes('option-income'), true, q + ' finds the theme');
  }
  for (const q of ['covered call', 'option income']) eq(core.notCovered(q), null, q + ' is not a not-covered note');
  const theme = themes.find(item => item.id === 'option-income');
  eq([theme.group, theme.category], ['Markets', 'Style']);
  eq(theme.symbols.length >= 4 && theme.symbols.length <= 6, true);
  for (const symbol of theme.symbols) {
    const item = bySymbol[symbol];
    ok(item.dividend.pays === true && item.dividend.frequency === 'weekly' && item.dividend.sources.length >= 2, symbol + ' weekly with two sources');
    ok(item.dividend.sources.some(url => url.includes('stockanalysis.com/etf/' + symbol.toLowerCase() + '/dividend/')), symbol + ' has its Stock Analysis dividend page');
    ok(item.dividend.sources.some(url => url === item.official), symbol + ' has its issuer page');
    ok(!/\byield\b|\d\s?%/i.test(item.description), symbol + ' stores no yield');
  }
});
check('not covered: crypto, leveraged, options, single bonds, accounts', () => {
  eq(core.notCovered('bitcoin').id, 'crypto');
  eq(core.notCovered('ETH etf').id, 'crypto');
  eq(core.notCovered('3x leveraged').id, 'leveraged');
  eq(core.notCovered('TQQQ').id, 'leveraged');
  eq(core.notCovered('covered calls'), null, 'covered calls have a theme now');
  eq(core.notCovered('option income'), null);
  eq(core.notCovered('0dte'), null);
  eq(core.notCovered('ultra option income'), null);
  eq(core.notCovered('options').id, 'options');
  eq(core.notCovered('buy calls').id, 'options');
  ok(core.notCovered('options').themes.includes('option-income'), 'the options note offers the option-income theme');
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
  for (const name of ['parseHash', 'buildHash', 'searchInstruments', 'mergeBackup', 'notCovered', 'resourceHint', 'dividendMatches', 'dividendBadge', 'pageTitle', 'freshness']) ok(app.includes('CORE.' + name), 'app.js should call CORE.' + name);
  ok(html.indexOf('js/core.js') > -1 && html.indexOf('js/core.js') < html.indexOf("'js/app.js'"), 'core.js loads before app.js');
  ok(html.includes('id="dividend-screeners"') && html.includes('Dividend screeners &amp; databases'), 'research guide should include the screeners section');
  for (const url of [
    'https://stockanalysis.com/list/monthly-dividend-stocks/',
    'https://www.dividend.com/dividend-stock-screener/',
    'https://www.ireitinvestor.com/dividend-champions/',
    'https://finviz.com/screener.ashx'
  ]) ok(html.includes(url) && html.includes('rel="noopener noreferrer"'), url);
  ok(html.includes('Educational, not buy or sell advice.'), 'screeners section should include the advice line');
  ok(html.includes('id="div-filter"') && html.includes('Pays dividends') && html.includes('id="freq-filter"') && html.includes('id="streak-filter"'), 'dividend filters should be in the search bar');
  ok(html.includes('<fieldset class="div-filters"') && html.includes('<legend>Dividends</legend>') && html.includes('aria-controls="div-sub"') && html.includes('aria-expanded="false"'), 'dividend filters should be a fieldset with aria-expanded');
  ok(search('dividend aristocrats').includes('SCHD'), 'aristocrats search should still find the Dividend theme tickers');
});

for (const failure of failures) console.error('FAIL ' + failure);
console.log(passed + ' of ' + (passed + failures.length) + ' app checks passed.');
process.exit(failures.length ? 1 : 0);
