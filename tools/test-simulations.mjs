#!/usr/bin/env node
// Checks the why-it-matters simulations: walk rules, data shape, and that every underlined phrase resolves.
// No packages needed: run `node tools/test-simulations.mjs`.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import assert from 'node:assert/strict';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const data = require(join(root, 'js/simulations.js'));
const pop = require(join(root, 'js/sim-popover.js'));
const read = path => readFileSync(join(root, path), 'utf8');
const catalog = JSON.parse(read('data/catalog.json'));
const weights = JSON.parse(read('data/index-weights.json'));
const appJS = read('js/app.js');
const html = read('index.html');
const { walk } = pop;
const ids = new Set(data.sims.map(sim => sim.id));
let passed = 0;
const test = (name, fn) => { try { fn(); passed++; } catch (error) { console.error('FAIL ' + name + '\n  ' + error.message); process.exitCode = 1; } };

test('simulation data is well-formed', () => assert.deepEqual(pop.simulationProblems(data.sims), []));
test('at least 15 simulations, each with 5+ steps and what/why copy', () => {
  assert.ok(data.sims.length >= 15, 'only ' + data.sims.length);
  for (const sim of data.sims) {
    assert.ok(walk.stepCount(sim) >= walk.MIN_SIM_STEPS, sim.id);
    const steps = sim.kind === 'bars' ? sim.bars : sim.steps;
    for (const st of steps) assert.ok(st.what && st.why, sim.id);
  }
});
test('walk: next, previous, replay, and bounds', () => {
  for (const sim of data.sims) {
    const total = walk.stepCount(sim);
    let s = walk.startWalk(sim);
    assert.equal(s.shown, sim.start);
    assert.equal(s.total, total);
    assert.equal(walk.atStart(walk.prevStep({...s, shown: 1})), true);
    assert.deepEqual(walk.prevStep({...s, shown: 1}), {...s, shown: 1}, 'prev stops at 1');
    let guard = 0;
    while (!walk.atEnd(s) && guard++ < 50) s = walk.nextStep(s);
    assert.equal(s.shown, total);
    assert.deepEqual(walk.nextStep(s), s, 'next stops at the end');
    s = walk.prevStep(s);
    assert.equal(s.shown, total - 1);
    assert.equal(walk.replayWalk(sim).shown, sim.start);
    for (let shown = 1; shown <= total; shown++) {
      const copy = walk.stepCopy(sim, {shown, total});
      assert.ok(copy.what.length >= 15 && copy.why.length >= 30, sim.id + ' step ' + shown);
      if (sim.kind === 'columns') {
        const view = walk.visibleColumns(sim, {shown, total});
        assert.ok(view.visible.includes(view.current), sim.id + ' current column is visible');
      }
    }
    assert.match(walk.walkProgress(sim, {shown: 1, total}), /^(Bar|Step) 1 of \d+$/);
  }
});
test('candle layout keeps bars inside the chart', () => {
  for (const sim of data.sims.filter(s => s.kind === 'bars')) {
    const {boxes} = walk.candleLayout(sim.bars, 320, 150);
    for (const b of boxes) assert.ok(b.yHigh >= 0 && b.yLow <= 150 && b.yHigh <= b.yLow, sim.id);
  }
});
test('every tape says SAMPLE or simulated', () => { for (const sim of data.sims) assert.match(sim.tape, /SAMPLE|simulated/i, sim.id); });

const used = new Set();
const usedTerms = new Set();
// A ref id is a simulation id, or 'term:<id>' for a grey-underlined definition.
const use = (where, id) => {
  if (String(id).startsWith('term:')) { const term = id.slice(5); assert.ok(data.terms[term], where + ' → unknown term ' + term); usedTerms.add(term); return; }
  assert.ok(ids.has(id), where + ' → unknown simulation ' + id); used.add(id);
};
test('theme phrases exist in data/catalog.json and resolve', () => {
  for (const [themeId, fields] of Object.entries(data.themeRefs)) {
    const theme = catalog.themes.find(item => item.id === themeId);
    assert.ok(theme, 'unknown theme ' + themeId);
    for (const [field, refs] of Object.entries(fields)) {
      assert.ok(['description', 'connection'].includes(field), themeId + '.' + field);
      for (const [phrase, id] of refs) { assert.ok(theme[field].includes(phrase), themeId + '.' + field + ' lacks "' + phrase + '"'); use(themeId, id); }
    }
  }
});
test('exposure and page phrases exist in js/app.js and resolve', () => {
  for (const [key, refs] of Object.entries(data.exposureRefs)) {
    assert.ok(new RegExp('\\b' + key + ':\\{label:').test(appJS), 'EXPOSURE_TYPES has no ' + key);
    for (const [phrase, id] of refs) { assert.ok(appJS.includes(phrase), 'app.js lacks "' + phrase + '"'); use(key, id); }
  }
  for (const [key, refs] of Object.entries(data.pageRefs)) {
    assert.ok(appJS.includes("'pageRefs','" + key + "'"), 'app.js never renders pageRefs.' + key);
    for (const [phrase, id] of refs) { assert.ok(appJS.includes(phrase), 'app.js lacks "' + phrase + '"'); use(key, id); }
  }
  for (const [title, parts] of Object.entries(data.groupWhy)) {
    assert.ok(appJS.includes("title:'" + title + "'"), 'no research group titled ' + title);
    for (const part of parts) if (typeof part !== 'string') use(title, part.sim);
  }
  for (const part of data.sentimentWhy) if (typeof part !== 'string') use('sentiment note', part.sim);
});
test('underlines in index.html resolve', () => {
  const found = [...html.matchAll(/class="sim-trigger" data-sim="([^"]+)"/g)].map(m => m[1]);
  assert.ok(found.length >= 10, 'only ' + found.length + ' triggers in index.html');
  for (const id of found) use('index.html', id);
  for (const m of html.matchAll(/class="term-tip" data-term="([^"]+)"/g)) use('index.html', 'term:' + m[1]);
  assert.ok(html.includes('id="sim-trigger-hint"') && html.includes('id="sim-list"'));
  assert.ok(html.indexOf('js/simulations.js') < html.indexOf("'js/app.js'"), 'simulations load before app.js');
});
test('every simulation has an underlined phrase in the page content', () => {
  for (const id of ids) assert.ok(used.has(id), id + ' is only in the list');
});
test('index concentration walk matches the dated snapshot', () => {
  const sp = weights.indices.find(index => index.name === 'S&P 500');
  const sim = data.sims.find(s => s.id === 'concentration');
  assert.ok(sim.goal.includes('Oct 8, 2026') && sp.snapshotDate === '2026-10-08');
  const top = Object.entries(sp.weights).sort((a, b) => b[1] - a[1]).slice(0, 5);
  let running = 0;
  top.forEach(([symbol, weight], i) => {
    running += weight;
    const row = sim.rows[i];
    assert.equal(row[0], symbol);
    assert.equal(row[1], weight.toFixed(2) + '%');
    assert.equal(row[2], running.toFixed(2) + '%');
  });
  assert.equal(sim.rows[5][1], (100 - running).toFixed(2) + '%');
});
test('richText underlines exact phrases, escapes, and leaves missing phrases plain', () => {
  const out = pop.richText('Bonds <fall> when yields rise. Longer bonds move more.', [['Longer bonds move more.', 'duration'], ['not here', 'wrapper']]);
  assert.ok(out.startsWith('Bonds &lt;fall&gt; when yields rise. <button type="button" class="sim-trigger" data-sim="duration"'));
  assert.ok(out.includes('>Longer bonds move more.</button>'));
  assert.ok(!out.includes('wrapper'));
  assert.equal(pop.richText('plain & simple', []), 'plain &amp; simple');
  assert.ok(pop.toolText(['A ', {text: 'b', sim: 'fees'}, '.']).includes('data-sim="fees"'));
});

test('at least 35 simulations', () => assert.ok(data.sims.length >= 35, 'only ' + data.sims.length));
test('every theme in data/catalog.json has at least one underline', () => {
  const bare = catalog.themes.filter(theme => !Object.values(data.themeRefs[theme.id] || {}).some(refs => refs.length)).map(theme => theme.id);
  assert.deepEqual(bare, []);
});
test('every phrase renders as its own underline (no overlaps or repeats hiding one)', () => {
  const attr = id => String(id).startsWith('term:') ? 'data-term="' + id.slice(5) + '"' : 'data-sim="' + id + '"';
  const check = (where, text, refs) => {
    const html = pop.richText(text, refs);
    const n = (html.match(/class="(sim-trigger|term-tip)"/g) || []).length;
    assert.equal(n, refs.length, where + ' renders ' + n + ' of ' + refs.length);
    for (const [phrase, id] of refs) assert.ok(html.includes(attr(id)) && html.includes('>' + phrase.replace(/&/g, '&amp;') + '</button>'), where + ' · ' + phrase);
  };
  for (const [themeId, fields] of Object.entries(data.themeRefs)) {
    const theme = catalog.themes.find(item => item.id === themeId);
    for (const [field, refs] of Object.entries(fields)) check(themeId + '.' + field, theme[field], refs);
  }
  const exposureText = key => appJS.match(new RegExp('\\b' + key + ":\\{label:'[^']*',text:'([^']*)'"))[1];
  for (const [key, refs] of Object.entries(data.exposureRefs)) check('exposure ' + key, exposureText(key), refs);
});
// SAMPLE tables must add up, so a reader who checks the arithmetic is not misled.
const num = cell => Number(String(cell).replace(/[−–]/g, '-').replace(/[^0-9.\-]/g, ''));
const sim = id => data.sims.find(s => s.id === id);
const near = (a, b, tol, where) => assert.ok(Math.abs(a - b) <= tol, where + ': ' + a + ' vs ' + b);
test('SAMPLE arithmetic: cap rate, FFO, breadth, country mix', () => {
  const cap = sim('cap-rate').rows;
  for (let c = 1; c < cap[0].length; c++) near(num(cap[2][c]) / (num(cap[1][c]) / 100), num(cap[3][c]), 0.6, 'cap-rate col ' + c);
  const ffo = sim('ffo').rows;
  for (let c = 1; c < ffo[0].length; c++) {
    const eps = num(ffo[0][c]) + num(ffo[1][c]) + num(ffo[2][c]) + num(ffo[3][c]);
    near(eps, num(ffo[4][c]), 0.001, 'ffo EPS col ' + c);
    near(eps - num(ffo[1][c]) - num(ffo[2][c]), num(ffo[5][c]), 0.001, 'ffo FFO col ' + c);
    near(100 * num(ffo[6][c]) / num(ffo[4][c]), num(ffo[7][c]), 0.6, 'ffo ÷ EPS col ' + c);
    near(100 * num(ffo[6][c]) / num(ffo[5][c]), num(ffo[8][c]), 0.6, 'ffo ÷ FFO col ' + c);
  }
  const br = sim('breadth').rows;
  let total = 0;
  for (const row of br.slice(0, 5)) { const pts = num(row[1]) * num(row[2]) / 100; near(pts, num(row[3]), 0.001, 'breadth ' + row[0]); total += pts; }
  near(total, num(br[5][2]), 0.001, 'breadth index');
  near(br.slice(0, 5).reduce((sum, row) => sum + num(row[2]), 0) / 5, num(br[6][2]), 0.001, 'breadth equal weight');
  const cm = sim('country-mix').rows;
  let fund = 0;
  for (const row of cm.slice(0, 4)) {
    const inDollars = ((1 + num(row[2]) / 100) * (1 + num(row[3]) / 100) - 1) * 100;
    near(inDollars, num(row[4]), 0.06, 'country-mix ' + row[0]);
    near(num(row[1]) * num(row[4]) / 100, num(row[5]), 0.006, 'country-mix contribution ' + row[0]);
    fund += num(row[5]);
  }
  near(fund, num(cm[4][5]), 0.001, 'country-mix fund');
});
test('SAMPLE arithmetic: roll, swings, size funds, spreads, and the other tables', () => {
  const bw = sim('backwardation').rows;
  let value = 100;
  for (let c = 1; c < bw[0].length; c++) {
    const roll = (num(bw[1][c]) / num(bw[2][c]) - 1) * 100;
    near(roll, num(bw[4][c]), 0.06, 'backwardation roll col ' + c);
    value *= 1 + roll / 100;
    near(value, num(bw[5][c]), 0.06, 'backwardation fund col ' + c);
  }
  for (const [ret, val] of [[0, 1], [2, 3]]) {
    const rows = sim('swings').rows;
    let v = 10000;
    for (let c = 2; c < rows[0].length; c++) { v *= 1 + num(rows[ret][c]) / 100; near(v, num(rows[val][c]), 0.6, 'swings ' + rows[val][0] + ' col ' + c); }
  }
  const sb = sim('size-beta').rows;
  for (const row of sb.slice(1)) near((row.slice(1, 7).reduce((acc, cell) => acc * (1 + num(cell) / 100), 1) - 1) * 100, num(row[7]), 0.06, 'size-beta ' + row[0]);
  const sp = sim('spread').rows;
  for (let c = 1; c < sp[0].length; c++) {
    near(num(sp[1][c]) - num(sp[0][c]), num(sp[2][c]), 0.001, 'spread col ' + c);
    near(5000 * num(sp[3][c]) / 100, num(sp[4][c]), 0.01, 'spread cost col ' + c);
  }
  const vt = sim('value-trap').rows;
  for (const [p, e, pe] of [[0, 1, 2], [3, 4, 5]]) for (let c = 1; c < vt[0].length; c++) near(num(vt[p][c]) / num(vt[e][c]), num(vt[pe][c]), 0.06, 'value-trap ' + vt[pe][0] + ' col ' + c);
  const pc = sim('patent-cliff').rows;
  for (let c = 1; c < pc[0].length; c++) near(num(pc[0][c]) + num(pc[1][c]) + num(pc[2][c]), num(pc[3][c]), 0.001, 'patent-cliff col ' + c);
  const cx = sim('policy-capex').rows;
  for (let c = 1; c < cx[0].length; c++) near(100 * num(cx[2][c]) / num(cx[3][c]), num(cx[4][c]), 0.6, 'policy-capex col ' + c);
  const rf = sim('refinance').rows;
  for (let c = 1; c < rf[0].length; c++) {
    near(num(rf[0][c]) + 3, num(rf[1][c]), 0.001, 'refinance rate col ' + c);
    near(200 * num(rf[1][c]) / 100, num(rf[2][c]), 0.001, 'refinance interest col ' + c);
    near(num(rf[3][c]) - num(rf[2][c]), num(rf[4][c]), 0.001, 'refinance profit col ' + c);
  }
  const tr = sim('tracking').rows;
  for (let c = 1; c < tr[0].length; c++) near(100 * (num(tr[2][c]) / num(tr[1][c]) - 1), num(tr[3][c]), 0.006, 'tracking premium col ' + c);
  const nim = sim('nim').rows;
  for (let c = 1; c < nim[0].length; c++) {
    near(num(nim[1][c]) - num(nim[0][c]), num(nim[2][c]), 0.001, 'nim curve col ' + c);
    near(num(nim[3][c]) - num(nim[4][c]), num(nim[5][c]), 0.001, 'nim margin col ' + c);
  }
});
test('every new simulation is underlined in at least one page text, not only index.html', () => {
  const inData = new Set();
  for (const fields of Object.values(data.themeRefs)) for (const refs of Object.values(fields)) for (const [, id] of refs) inData.add(id);
  for (const refs of Object.values(data.exposureRefs)) for (const [, id] of refs) inData.add(id);
  const htmlOnly = ['spread', 'swings', 'stop-loss', 'value-trap'];
  for (const id of ['size-beta', 'refinance', 'cap-rate', 'ffo', 'nim', 'ad-cycle', 'patent-cliff', 'policy-capex', 'tracking', 'breadth', 'rotation', 'correlation', 'country-mix', 'backwardation']) assert.ok(inData.has(id), id);
  for (const id of htmlOnly) assert.ok(html.includes('data-sim="' + id + '"'), id + ' in index.html');
});

// ---------- Beginner layer (M7.3) ----------
test('every walk has a level, and Basic walks come first in the guide', () => {
  for (const sim of data.sims) assert.ok(['basic', 'next', 'advanced'].includes(sim.level) && sim.levelName, sim.id + ' has no level');
  assert.ok(data.sims.filter(sim => sim.level === 'basic').length >= 10, 'fewer than 10 Basic walks');
  for (const id of Object.keys(data.LEVELS)) assert.ok(ids.has(id), 'LEVELS names unknown walk ' + id);
});
test('prerequisites resolve, and every bar walk links to the bar-reading walk', () => {
  for (const sim of data.sims) {
    for (const id of sim.before) { assert.ok(ids.has(id) && id !== sim.id, sim.id + ' → ' + id); assert.ok(data.PREREQ_LABEL[id], 'no "New to…?" label for ' + id); }
    if (sim.kind === 'bars' && sim.id !== 'bar-reading') assert.ok(sim.before.includes('bar-reading'), sim.id);
  }
  for (const id of ['yields', 'duration']) assert.ok(data.sims.find(s => s.id === id).before.includes('bond-seesaw'), id);
  for (const id of ['concentration', 'breadth']) assert.ok(data.sims.find(s => s.id === id).before.includes('index-basics'), id);
  const popJS = read('js/sim-popover.js');
  assert.ok(popJS.includes("trigger('bar-reading', 'How to read a bar')"), 'bar captions link to the bar-reading walk');
  assert.ok(popJS.includes('data-sim-before') && popJS.includes('data-sim-back') && popJS.includes('data-sim-level'));
});
test('Start here: 5 to 8 Basic walks, a 3-step how-to panel, and the guide link points at it', () => {
  assert.ok(data.startHere.length >= 5 && data.startHere.length <= 8);
  for (const id of data.startHere) { assert.ok(ids.has(id), id); assert.equal(data.sims.find(s => s.id === id).level, 'basic', id); }
  assert.ok(html.includes('id="start-here"') && html.includes('id="start-list"') && html.includes('href="#start-here" id="guide-link"'));
  const panel = html.slice(html.indexOf('id="start-here"'), html.indexOf('id="start-list"'));
  assert.equal((panel.match(/<li>/g) || []).length, 3, 'how-to panel has 3 steps');
  assert.ok(appJS.includes("POP.renderStartHere($('start-list'), SIMS.startHere)") && appJS.includes("$('start-here')"));
});
test('terms: 25+ plain definitions, each shown somewhere on the page', () => {
  const list = Object.entries(data.terms);
  assert.ok(list.length >= 25, 'only ' + list.length + ' terms');
  for (const [id, t] of list) {
    assert.match(id, /^[a-z0-9-]+$/);
    assert.ok(t.term && t.def.length >= 30, id + ' definition too short');
    if (t.sim) assert.ok(ids.has(t.sim), id + ' → unknown walk ' + t.sim);
    assert.ok(usedTerms.has(id), id + ' is defined but never underlined on the page');
  }
  const out = pop.richText('An ETF and a bond.', [['ETF', 'term:etf'], ['bond', 'bond-seesaw']]);
  assert.ok(out.includes('class="term-tip" data-term="etf"') && out.includes('data-sim="bond-seesaw"'));
  assert.ok(pop.toolText(['A ', {text: 'b', term: 'etf'}]).includes('data-term="etf"'));
});
test('every research link has a one-line plain-language note', () => {
  const groups = appJS.slice(appJS.indexOf('const groups = ['), appJS.indexOf('return groups;'));
  const titles = new Set();
  for (const m of groups.matchAll(/\[\s*(?:item\.official\?)?'([^']+)'(?::'([^']+)')?,/g)) { titles.add(m[1]); if (m[2]) titles.add(m[2]); }
  assert.ok(titles.size >= 20, 'found only ' + titles.size + ' link titles');
  for (const title of titles) assert.ok(data.linkHelp[title] && data.linkHelp[title].length >= 20, 'no help line for ' + title);
  for (const title of Object.keys(data.linkHelp)) assert.ok(titles.has(title), 'help for a link that does not exist: ' + title);
  assert.ok(appJS.includes('group.links.map(helpLink)'));
});
test('beginner copy: futures walks start with what a contract is, and terms are defined at first use', () => {
  const first = id => { const sim = data.sims.find(s => s.id === id); return (sim.kind === 'bars' ? sim.bars : sim.steps)[0].what; };
  assert.match(first('futures-roll'), /futures contract is/i);
  assert.match(first('backwardation'), /futures contract/i);
  const all = id => JSON.stringify(data.sims.find(s => s.id === id));
  for (const [id, words] of [['gold-rates', 'A real yield is'], ['duration', 'called maturity'], ['duration', 'Duration is a sensitivity score'], ['value-trap', 'earnings per share, or EPS, is'], ['ai', 'P/E, the share price divided by'], ['correlation', 'correlation measures'], ['yields', 'A yield is'], ['size-beta', 'beta compares'], ['earnings', 'A catalyst is'], ['dividend', 'the first day a new buyer'], ['concentration', 'an index of about 500']]) assert.ok(all(id).includes(words), id + ' lacks "' + words + '"');
});
test('SAMPLE arithmetic: foundation walks', () => {
  const cp = sim('compounding').rows;
  const fv = months => 100 * ((1.005 ** months - 1) / 0.005);
  [12, 120, 360].forEach((months, i) => {
    near(months * 100, num(cp[0][i + 1]), 0.001, 'compounding put in ' + months);
    near(fv(months), num(cp[1][i + 1]), 0.6, 'compounding value ' + months);
    near(num(cp[1][i + 1]) - num(cp[0][i + 1]), num(cp[2][i + 1]), 0.001, 'compounding growth ' + months);
  });
  near(fv(240), num(cp[4][3]), 0.6, 'late starter');
  near(240 * 100, num(cp[3][3]), 0.001, 'late starter put in');
  assert.ok(JSON.stringify(sim('compounding')).includes('$54,248') && num(cp[1][3]) - num(cp[4][3]) === 54248);
  const price = y => { let p = 0; for (let t = 1; t <= 10; t++) p += 40 / (1 + y) ** t; return p + 1000 / (1 + y) ** 10; };
  const bs = sim('bond-seesaw').rows;
  near(price(0.05), num(bs[2][2]), 0.5, 'bond at 5%');
  near(price(0.03), num(bs[2][3]), 0.5, 'bond at 3%');
  near((price(0.05) / 1000 - 1) * 100, num(bs[4][2]), 0.06, 'bond change at 5%');
  near((price(0.03) / 1000 - 1) * 100, num(bs[4][3]), 0.06, 'bond change at 3%');
  const ix = sim('index-basics').rows;
  let total = 0;
  for (const row of ix.slice(0, 4)) { const cap = num(row[1]) * num(row[2]) / 1000; near(cap, num(row[3]), 0.001, 'index cap ' + row[0]); total += cap; }
  near(total, num(ix[4][3]), 0.001, 'index total');
  for (const row of ix.slice(0, 4)) { near(100 * num(row[3]) / total, num(row[4]), 0.001, 'index weight ' + row[0]); near(num(row[4]) / 10, num(row[5]), 0.001, 'index move ' + row[0]); }
  const st = sim('stock-basics').rows;
  for (let c = 1; c < st[0].length; c++) { near(num(st[2][c]), num(st[3][c]), 0.001, 'stock value col ' + c); near(num(st[2][c]) * 100, num(st[4][c]), 0.001, 'your shares col ' + c); }
});

console.log(passed + ' checks passed, ' + data.sims.length + ' simulations (' + data.sims.filter(sim => sim.level === 'basic').length + ' Basic), ' + used.size + ' with page underlines, ' + usedTerms.size + ' of ' + Object.keys(data.terms).length + ' terms on the page.');
