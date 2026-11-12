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
const use = (where, id) => { assert.ok(ids.has(id), where + ' → unknown simulation ' + id); used.add(id); };
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

console.log(passed + ' checks passed, ' + data.sims.length + ' simulations, ' + used.size + ' with page underlines.');
